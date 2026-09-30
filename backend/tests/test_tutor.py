import os
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from groq import RateLimitError
import httpx
from main import app, ip_request_counts

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_rate_limit_and_env():
    """Reset rate limit dictionary and ensure clean environment for tests."""
    ip_request_counts.clear()
    yield
    ip_request_counts.clear()


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Nihongo in Hindi" in data["app"]


def test_tutor_rejects_extra_fields():
    """Ensure extra='forbid' prevents unexpected fields on request."""
    # Extra field on top level
    res = client.post("/api/tutor", json={
        "message": "こんにちは",
        "unexpected_field": "hack"
    })
    assert res.status_code == 422

    # Extra field inside history
    res = client.post("/api/tutor", json={
        "message": "こんにちは",
        "history": [
            {"role": "user", "content": "Hello", "extra": "data"}
        ]
    })
    assert res.status_code == 422

    # Extra field inside learned
    res = client.post("/api/tutor", json={
        "message": "こんにちは",
        "learned": {
            "kana": ["a", "i"],
            "extra_list": ["foo"]
        }
    })
    assert res.status_code == 422


def test_tutor_rejects_empty_or_whitespace_message():
    res = client.post("/api/tutor", json={"message": ""})
    assert res.status_code == 422

    res = client.post("/api/tutor", json={"message": "   \n\t  "})
    assert res.status_code == 422


def test_tutor_rejects_too_long_message():
    long_msg = "あ" * 501
    res = client.post("/api/tutor", json={"message": long_msg})
    assert res.status_code == 422


def test_tutor_rejects_invalid_history_role():
    res = client.post("/api/tutor", json={
        "message": "Test",
        "history": [{"role": "admin", "content": "I am admin"}]
    })
    assert res.status_code == 422


def test_tutor_missing_key_returns_503_without_leaking_key_or_env_var():
    with patch.dict(os.environ, {"GROQ_API_KEY": ""}):
        res = client.post("/api/tutor", json={"message": "नमस्ते"})
        assert res.status_code == 503
        data = res.json()
        assert "detail" in data
        assert "GROQ_API_KEY" not in res.text
        assert "API_KEY" not in res.text
        assert "अनुपलब्ध" in data["detail"]


@pytest.mark.asyncio
async def test_tutor_mocked_llm_success_never_calls_real_api():
    """Verify that real Groq API is never called and mock provides response."""
    test_key = "gsk_TestMockFakeKey_DoNotCallRealAPI_12345"

    with patch.dict(os.environ, {"GROQ_API_KEY": test_key}):
        mock_choice = MagicMock()
        mock_choice.message.content = "नमस्ते! 'Arigatou' का अर्थ 'धन्यवाद' होता है।"
        mock_choice.finish_reason = "stop"

        mock_completion = MagicMock()
        mock_completion.choices = [mock_choice]

        with patch("groq.AsyncGroq") as mock_groq_cls:
            mock_client_instance = MagicMock()
            mock_client_instance.chat.completions.create = AsyncMock(return_value=mock_completion)
            mock_groq_cls.return_value = mock_client_instance

            res = client.post("/api/tutor", json={
                "message": "arigatou ka matlab kya hai?",
                "history": [
                    {"role": "user", "content": "Konnichiwa"},
                    {"role": "assistant", "content": "नमस्ते! मैं आपकी क्या सहायता कर सकता हूँ?"}
                ],
                "learned": {
                    "kana": ["あ", "い", "う"],
                    "vocab": ["ありがとう (thank you)"],
                    "grammar": ["X は Y です"]
                }
            })

            assert res.status_code == 200
            data = res.json()
            assert data["status"] == "ok"
            assert data["reply"] == "नमस्ते! 'Arigatou' का अर्थ 'धन्यवाद' होता है।"

            # Verify Groq client constructor
            mock_groq_cls.assert_called_once_with(
                api_key=test_key,
                max_retries=0,
                timeout=20.0
            )

            # Verify mock call parameters
            assert mock_client_instance.chat.completions.create.called
            call_kwargs = mock_client_instance.chat.completions.create.call_args.kwargs
            assert call_kwargs["model"] == "openai/gpt-oss-120b"
            assert call_kwargs["max_tokens"] == 2000
            assert "reasoning_effort" not in call_kwargs

            # Verify system message content
            system_msg = call_kwargs["messages"][0]
            assert system_msg["role"] == "system"
            assert "Learned Kana: あ, い, う" in system_msg["content"]
            assert "Learned Vocab: ありがとう (thank you)" in system_msg["content"]

            # Ensure the test key is not in the response
            assert test_key not in res.text


def test_tutor_reasoning_effort_sent_only_when_configured():
    test_key = "gsk_TestMockFakeKey"

    with patch.dict(os.environ, {"GROQ_API_KEY": test_key, "GROQ_REASONING_EFFORT": "low"}):
        mock_choice = MagicMock()
        mock_choice.message.content = "उत्तर"
        mock_choice.finish_reason = "stop"

        mock_completion = MagicMock()
        mock_completion.choices = [mock_choice]

        with patch("groq.AsyncGroq") as mock_groq_cls:
            mock_client_instance = MagicMock()
            mock_client_instance.chat.completions.create = AsyncMock(return_value=mock_completion)
            mock_groq_cls.return_value = mock_client_instance

            res = client.post("/api/tutor", json={"message": "नमस्ते"})
            assert res.status_code == 200

            call_kwargs = mock_client_instance.chat.completions.create.call_args.kwargs
            assert call_kwargs["reasoning_effort"] == "low"


def test_tutor_empty_reply_returns_502():
    test_key = "gsk_TestMockFakeKey"

    with patch.dict(os.environ, {"GROQ_API_KEY": test_key}):
        mock_choice = MagicMock()
        mock_choice.message.content = "   "
        mock_choice.finish_reason = "stop"

        mock_completion = MagicMock()
        mock_completion.choices = [mock_choice]

        with patch("groq.AsyncGroq") as mock_groq_cls:
            mock_client_instance = MagicMock()
            mock_client_instance.chat.completions.create = AsyncMock(return_value=mock_completion)
            mock_groq_cls.return_value = mock_client_instance

            res = client.post("/api/tutor", json={"message": "नमस्ते"})
            assert res.status_code == 502
            data = res.json()
            assert "उत्तर प्राप्त नहीं हो सका" in data["detail"]
            assert test_key not in res.text


def test_tutor_truncated_reply_length_returns_502():
    test_key = "gsk_TestMockFakeKey"

    with patch.dict(os.environ, {"GROQ_API_KEY": test_key}):
        mock_choice = MagicMock()
        mock_choice.message.content = "अधूरा उत्तर..."
        mock_choice.finish_reason = "length"

        mock_completion = MagicMock()
        mock_completion.choices = [mock_choice]

        with patch("groq.AsyncGroq") as mock_groq_cls:
            mock_client_instance = MagicMock()
            mock_client_instance.chat.completions.create = AsyncMock(return_value=mock_completion)
            mock_groq_cls.return_value = mock_client_instance

            res = client.post("/api/tutor", json={"message": "नमस्ते"})
            assert res.status_code == 502
            data = res.json()
            assert "उत्तर प्राप्त नहीं हो सका" in data["detail"]
            assert test_key not in res.text


def test_tutor_groq_rate_limit_error_returns_429():
    """Verify that Groq RateLimitError returns 429 with the specific retry Hindi message."""
    test_key = "gsk_TestMockFakeKey"

    with patch.dict(os.environ, {"GROQ_API_KEY": test_key}):
        # Construct a dummy httpx Response for RateLimitError
        mock_request = httpx.Request("POST", "https://api.groq.com/openai/v1/chat/completions")
        mock_response = httpx.Response(status_code=429, request=mock_request)
        rate_limit_err = RateLimitError("Rate limit reached", response=mock_response, body={"error": "rate_limit"})

        with patch("groq.AsyncGroq") as mock_groq_cls:
            mock_client_instance = MagicMock()
            mock_client_instance.chat.completions.create = AsyncMock(side_effect=rate_limit_err)
            mock_groq_cls.return_value = mock_client_instance

            res = client.post("/api/tutor", json={"message": "नमस्ते"})
            assert res.status_code == 429
            data = res.json()
            assert data["detail"] == "अभी बहुत अनुरोध हो गए हैं, कृपया थोड़ी देर बाद फिर कोशिश करें।"
            assert test_key not in res.text


def test_tutor_internal_rate_limiting():
    """Verify in-memory UTC daily rate limiter."""
    test_key = "gsk_TestMockFakeKey"

    with patch.dict(os.environ, {"GROQ_API_KEY": test_key, "RATE_LIMIT_DAILY": "2"}):
        mock_choice = MagicMock()
        mock_choice.message.content = "उत्तर"
        mock_choice.finish_reason = "stop"
        mock_completion = MagicMock()
        mock_completion.choices = [mock_choice]

        with patch("groq.AsyncGroq") as mock_groq_cls:
            mock_client_instance = MagicMock()
            mock_client_instance.chat.completions.create = AsyncMock(return_value=mock_completion)
            mock_groq_cls.return_value = mock_client_instance

            # Request 1: OK
            res1 = client.post("/api/tutor", json={"message": "प्रश्न १"})
            assert res1.status_code == 200

            # Request 2: OK
            res2 = client.post("/api/tutor", json={"message": "प्रश्न २"})
            assert res2.status_code == 200

            # Request 3: Exceeds limit of 2 -> 429 with daily limit message
            res3 = client.post("/api/tutor", json={"message": "प्रश्न ३"})
            assert res3.status_code == 429
            data = res3.json()
            assert data["detail"] == "आज की दैनिक सीमा पूरी हो गई है। कृपया कल फिर से पूछें।"
            assert test_key not in res3.text


def test_tutor_timeout_returns_504():
    """Verify timeout triggers 504 Gateway Timeout."""
    test_key = "gsk_TestMockFakeKey"

    with patch.dict(os.environ, {"GROQ_API_KEY": test_key, "LLM_TIMEOUT_SECONDS": "0.01"}):
        import asyncio

        async def slow_generate(*args, **kwargs):
            await asyncio.sleep(0.05)
            mock_choice = MagicMock()
            mock_choice.message.content = "Slow"
            mock_choice.finish_reason = "stop"
            mock_comp = MagicMock()
            mock_comp.choices = [mock_choice]
            return mock_comp

        with patch("groq.AsyncGroq") as mock_groq_cls:
            mock_client_instance = MagicMock()
            mock_client_instance.chat.completions.create = AsyncMock(side_effect=slow_generate)
            mock_groq_cls.return_value = mock_client_instance

            res = client.post("/api/tutor", json={"message": "समय समाप्त परीक्षण"})
            assert res.status_code == 504
            data = res.json()
            assert "अधिक समय" in data["detail"]
            assert test_key not in res.text
