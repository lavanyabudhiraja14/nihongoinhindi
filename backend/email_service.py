import json
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
import urllib.request
import urllib.error

from config import settings

logger = logging.getLogger("nihongo_backend")


def _get_base_html_template(title: str, preheader: str, content_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #F8F9FA;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Devanagari', Helvetica, Arial, sans-serif;
      color: #0D1B4B;
      -webkit-font-smoothing: antialiased;
    }}
    .wrapper {{
      width: 100%;
      table-layout: fixed;
      background-color: #F8F9FA;
      padding: 40px 16px;
    }}
    .container {{
      max-width: 540px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      border: 1px solid #E8E8EC;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(13, 27, 75, 0.04);
    }}
    .header {{
      background: linear-gradient(135deg, #0D1B4B 0%, #1A2B6B 100%);
      padding: 28px 24px;
      text-align: center;
    }}
    .logo-badge {{
      display: inline-block;
      width: 44px;
      height: 44px;
      line-height: 44px;
      background-color: #BC2025;
      color: #FFFFFF;
      font-size: 20px;
      font-weight: bold;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 12px;
    }}
    .header-title {{
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.01em;
    }}
    .header-sub {{
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
      margin: 4px 0 0 0;
    }}
    .body-content {{
      padding: 32px 28px;
    }}
    .btn {{
      display: inline-block;
      padding: 13px 28px;
      background-color: #BC2025;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }}
    .footer {{
      border-top: 1px solid #E8E8EC;
      padding: 20px 28px;
      text-align: center;
      font-size: 12px;
      color: #5B6070;
      background-color: #FAFAFB;
    }}
    .link-fallback {{
      font-size: 12px;
      color: #2563EB;
      word-break: break-all;
    }}
    .warning-box {{
      background-color: #FFF8E6;
      border-left: 3px solid #FF9933;
      padding: 12px 14px;
      font-size: 13px;
      color: #78350F;
      border-radius: 4px;
      margin-top: 18px;
    }}
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    {preheader}
  </div>
  <table class="wrapper" role="presentation" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <div class="container">
          <div class="header">
            <div class="logo-badge">学</div>
            <h1 class="header-title">Nihongo Seekho</h1>
            <p class="header-sub">हिंदी माध्यम से जापानी भाषा सीखें</p>
          </div>
          <div class="body-content">
            {content_html}
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px 0;">© 2026 Nihongo Seekho. All rights reserved.</p>
            <p style="margin: 0;">हिंदी से जापानी भाषा सीखने का सरल मंच।</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _send_via_resend(to_email: str, subject: str, html_body: str, text_body: str) -> bool:
    """Send email using Resend HTTP API."""
    if not settings.RESEND_API_KEY:
        logger.error("Resend delivery failed: RESEND_API_KEY is not set.")
        return False

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "NihongoSeekho-Backend/1.0",
    }
    payload = {
        "from": settings.EMAIL_FROM,
        "to": [to_email],
        "subject": subject,
        "html": html_body,
        "text": text_body,
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status in (200, 201):
                logger.info(f"Email successfully sent to {to_email} via Resend.")
                return True
            logger.error(f"Resend API returned non-200 status: {resp.status}")
            return False
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8", errors="ignore")
        logger.error(f"Resend API HTTP error {e.code}: {err_msg}")
        return False
    except Exception as e:
        logger.error(f"Resend delivery exception: {str(e)}")
        return False


def _send_via_smtp(to_email: str, subject: str, html_body: str, text_body: str) -> bool:
    """Send email using SMTP server."""
    if not settings.SMTP_HOST:
        logger.error("SMTP delivery failed: SMTP_HOST is not set.")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email

    part1 = MIMEText(text_body, "plain", "utf-8")
    part2 = MIMEText(html_body, "html", "utf-8")
    msg.attach(part1)
    msg.attach(part2)

    try:
        if settings.SMTP_USE_SSL:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)

        with server:
            if settings.SMTP_USE_TLS and not settings.SMTP_USE_SSL:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, [to_email], msg.as_string())
            logger.info(f"Email successfully sent to {to_email} via SMTP.")
            return True
    except Exception as e:
        logger.error(f"SMTP delivery exception: {str(e)}")
        return False


def _send_email_dispatch(to_email: str, subject: str, html_body: str, text_body: str) -> bool:
    """Dispatch email delivery to configured provider."""
    provider = settings.EMAIL_PROVIDER

    if provider == "resend":
        return _send_via_resend(to_email, subject, html_body, text_body)
    elif provider == "smtp":
        return _send_via_smtp(to_email, subject, html_body, text_body)
    else:
        # Console / Development mode
        logger.info(f"========== [CONSOLE EMAIL DISPATCH: {provider}] ==========")
        logger.info(f"To: {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body (plain text):\n{text_body}")
        logger.info("==========================================================")
        return True


def send_password_reset_email(to_email: str, reset_token: str, display_name: str = "") -> bool:
    """Send password reset link (valid for 30 minutes)."""
    greeting = f"नमस्ते {display_name}," if display_name else "नमस्ते,"
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    subject = "Nihongo Seekho: पासवर्ड रीसेट अनुरोध (Password Reset Link)"
    preheader = "आपके Nihongo Seekho खाते का पासवर्ड रीसेट करने का लिंक।"

    content_html = f"""
      <h2 style="color: #0D1B4B; font-size: 19px; margin-top: 0; font-weight: 600;">पासवर्ड रीसेट अनुरोध</h2>
      <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">{greeting}</p>
      <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
        हमने आपके Nihongo Seekho खाते के लिए पासवर्ड रीसेट का अनुरोध प्राप्त किया है। नीचे दिए गए बटन पर क्लिक करके अपना नया पासवर्ड सेट करें:
      </p>
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="{reset_url}" class="btn" target="_blank" rel="noopener noreferrer">पासवर्ड रीसेट करें (Reset Password)</a>
      </div>

      <p style="font-size: 13px; color: #5B6070; line-height: 1.5; margin: 16px 0 6px 0;">
        यदि ऊपर दिया गया बटन काम नहीं कर रहा है, तो इस लिंक को अपने ब्राउज़र में कॉपी और पेस्ट करें:
      </p>
      <p class="link-fallback"><a href="{reset_url}" style="color: #2563EB;">{reset_url}</a></p>

      <div class="warning-box">
        <strong>महत्वपूर्ण सूचना:</strong> यह रीसेट लिंक केवल <strong>३० मिनट (30 minutes)</strong> के लिए वैध है और केवल एक बार उपयोग किया जा सकता है।
      </div>

      <p style="font-size: 13px; color: #717684; line-height: 1.5; margin-top: 20px; border-top: 1px solid #EEEEEE; padding-top: 14px;">
        यदि आपने पासवर्ड रीसेट का अनुरोध नहीं किया था, तो कृपया इस ईमेल को अनदेखा करें। आपका पासवर्ड सुरक्षित रहेगा।
      </p>
    """

    text_body = f"""{greeting}

हमने आपके Nihongo Seekho खाते के लिए पासवर्ड रीसेट का अनुरोध प्राप्त किया है।

अपना नया पासवर्ड सेट करने के लिए नीचे दिए गए लिंक पर जाएं:
{reset_url}

नोट: यह लिंक केवल 30 मिनट के लिए वैध है और केवल 1 बार उपयोग किया जा सकता है।

यदि आपने यह अनुरोध नहीं किया था, तो कृपया इस ईमेल को अनदेखा करें।

Nihongo Seekho Team
"""

    html_full = _get_base_html_template(subject, preheader, content_html)
    return _send_email_dispatch(to_email, subject, html_full, text_body)


def send_verification_email(to_email: str, verification_token: str, display_name: str = "") -> bool:
    """Send email verification link (valid for 24 hours)."""
    greeting = f"नमस्ते {display_name}," if display_name else "नमस्ते,"
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    subject = "Nihongo Seekho: अपना ईमेल पता सत्यापित करें (Verify Your Email)"
    preheader = "Nihongo Seekho में आपका स्वागत है! कृपया अपना ईमेल पता सत्यापित करें।"

    content_html = f"""
      <h2 style="color: #0D1B4B; font-size: 19px; margin-top: 0; font-weight: 600;">ईमेल सत्यापन (Verify Your Email)</h2>
      <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">{greeting}</p>
      <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
        Nihongo Seekho में आपका स्वागत है! अपने खाते की सुरक्षा सुनिश्चित करने और सभी सुविधाओं का लाभ उठाने के लिए कृपया नीचे दिए गए बटन पर क्लिक करके अपना ईमेल सत्यापित करें:
      </p>
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="{verify_url}" class="btn" target="_blank" rel="noopener noreferrer">ईमेल सत्यापित करें (Verify Email)</a>
      </div>

      <p style="font-size: 13px; color: #5B6070; line-height: 1.5; margin: 16px 0 6px 0;">
        यदि ऊपर दिया गया बटन काम नहीं कर रहा है, तो इस लिंक को अपने ब्राउज़र में कॉपी और पेस्ट करें:
      </p>
      <p class="link-fallback"><a href="{verify_url}" style="color: #2563EB;">{verify_url}</a></p>

      <div class="warning-box">
        <strong>सूचना:</strong> यह सत्यापन लिंक <strong>२४ घंटे (24 hours)</strong> के लिए वैध है।
      </div>

      <p style="font-size: 13px; color: #717684; line-height: 1.5; margin-top: 20px; border-top: 1px solid #EEEEEE; padding-top: 14px;">
        यदि आपने Nihongo Seekho पर खाता नहीं बनाया है, तो कृपया इस ईमेल को अनदेखा करें।
      </p>
    """

    text_body = f"""{greeting}

Nihongo Seekho में आपका स्वागत है!

कृपया अपना ईमेल पता सत्यापित करने के लिए नीचे दिए गए लिंक पर जाएं:
{verify_url}

नोट: यह लिंक 24 घंटे के लिए वैध है।

यदि आपने खाता नहीं बनाया है, तो कृपया इस ईमेल को अनदेखा करें।

Nihongo Seekho Team
"""

    html_full = _get_base_html_template(subject, preheader, content_html)
    return _send_email_dispatch(to_email, subject, html_full, text_body)
