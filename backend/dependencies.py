import os
import ipaddress
from datetime import datetime, timezone
from typing import Optional, List, Set, Union
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from config import settings
from database import get_db
from models import User, UserSession
from security import hash_session_token, verify_csrf_tokens

SESSION_COOKIE_NAME = settings.SESSION_COOKIE_NAME
CSRF_COOKIE_NAME = os.getenv("CSRF_COOKIE_NAME", "nihongo_csrf")


def _parse_trusted_networks() -> List[Union[ipaddress.IPv4Network, ipaddress.IPv6Network]]:
    """Parse configured TRUSTED_PROXIES into ipaddress network objects."""
    networks: List[Union[ipaddress.IPv4Network, ipaddress.IPv6Network]] = []

    for item in settings.TRUSTED_PROXIES:
        cleaned = item.strip()
        if not cleaned:
            continue
        if cleaned == "testclient":
            continue
        try:
            # If item does not contain '/', treat as host IP (/32 or /128)
            net = ipaddress.ip_network(cleaned, strict=False)
            networks.append(net)
        except ValueError:
            pass
    return networks


def is_trusted_proxy_ip(ip_str: str) -> bool:
    """Check if an IP address string belongs to a configured trusted proxy or network."""
    if not ip_str:
        return False
    if ip_str == "testclient":
        return True
    try:
        addr = ipaddress.ip_address(ip_str)
        for net in _parse_trusted_networks():
            if addr in net:
                return True
        return False
    except ValueError:
        return False


def get_client_ip(request: Request) -> str:
    """
    Extract real client IP safely:
    1. If direct peer is NOT a trusted proxy, return direct peer IP immediately (prevent spoofing).
    2. If direct peer IS a trusted proxy, walk X-Forwarded-For from RIGHT to LEFT,
       and return the first IP that is NOT a trusted proxy.
    """
    peer_ip = request.client.host if request.client else "127.0.0.1"

    if not is_trusted_proxy_ip(peer_ip):
        return peer_ip

    forwarded_header = request.headers.get("x-forwarded-for")
    if not forwarded_header:
        return peer_ip

    # Split and clean all IPs in header
    ips = [ip.strip() for ip in forwarded_header.split(",") if ip.strip()]
    if not ips:
        return peer_ip

    # Walk from RIGHT to LEFT to find first untrusted IP
    for ip in reversed(ips):
        if not is_trusted_proxy_ip(ip):
            try:
                # Validate it's a parseable valid IP
                ipaddress.ip_address(ip)
                return ip
            except ValueError:
                continue

    # If all entries in chain are trusted, return the leftmost valid entry
    return ips[0]


def verify_csrf(request: Request) -> None:
    """
    Double-Submit Cookie CSRF validation for state-mutating requests (POST, PATCH, DELETE):
    - When authenticated via cookie, requires matching X-CSRF-Token header.
    - Exempt: /api/auth/signup, /api/auth/login, /api/tutor, or direct Bearer token auth.
    """
    if request.method not in ("POST", "PATCH", "DELETE", "PUT"):
        return

    path = request.url.path
    if path in ("/api/auth/signup", "/api/auth/login", "/api/tutor"):
        return

    session_cookie = request.cookies.get(SESSION_COOKIE_NAME)
    auth_header = request.headers.get("authorization")

    if auth_header and auth_header.startswith("Bearer ") and not session_cookie:
        return

    if session_cookie:
        cookie_csrf = request.cookies.get(CSRF_COOKIE_NAME)
        header_csrf = request.headers.get("x-csrf-token")

        if not verify_csrf_tokens(cookie_csrf, header_csrf):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF टोकन अमान्य या गायब है।",
            )


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """Authenticate request using the httpOnly session cookie or Bearer header."""
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="कृपया पहले लॉग इन करें।",
        )

    token_hash = hash_session_token(token)
    now = datetime.now(timezone.utc)

    session_record = (
        db.query(UserSession)
        .filter(
            UserSession.token_hash == token_hash,
            UserSession.revoked == False,
            UserSession.expires_at > now,
        )
        .first()
    )

    if not session_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="सत्र समाप्त हो गया है। कृपया पुनः लॉग इन करें।",
        )

    user = db.query(User).filter(User.id == session_record.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="उपयोगकर्ता खाता नहीं मिला।",
        )

    return user
