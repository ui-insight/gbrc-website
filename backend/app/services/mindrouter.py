"""MindRouter client for University of Idaho's on-prem AI services.

Provides both non-streaming and streaming (SSE) chat completions
via the OpenAI-compatible endpoint at mindrouter.uidaho.edu.
"""

import json
import logging
import re
from collections.abc import AsyncIterator

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)

LLM_TIMEOUT = 120


class MindRouterClient:
    def __init__(
        self,
        endpoint_url: str | None = None,
        api_key: str | None = None,
        model: str | None = None,
    ):
        base = endpoint_url or settings.mindrouter_base_url
        self.endpoint_url = f"{base.rstrip('/')}/v1/chat/completions"
        self.api_key = api_key or settings.mindrouter_api_key
        self.model = model or settings.mindrouter_model

    def _headers(self) -> dict[str, str]:
        headers: dict[str, str] = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    @staticmethod
    def _strip_think_blocks(text: str) -> str:
        """Remove Qwen3-style <think>...</think> reasoning blocks."""
        return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

    @staticmethod
    def _strip_code_fences(text: str) -> str:
        """Remove markdown code fences wrapping JSON."""
        text = text.strip()
        if text.startswith("```"):
            first_newline = text.index("\n") if "\n" in text else 3
            text = text[first_newline + 1 :]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    async def chat_completion(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> dict:
        """Non-streaming chat completion. Returns the full response."""
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        async with httpx.AsyncClient(timeout=LLM_TIMEOUT) as client:
            logger.info("MindRouter request (model=%s)", self.model)
            response = await client.post(
                self.endpoint_url, headers=self._headers(), json=payload
            )
            response.raise_for_status()

        result = response.json()
        raw_content = result["choices"][0]["message"]["content"]
        content = self._strip_think_blocks(raw_content)

        return {
            "content": content,
            "raw_content": raw_content,
            "usage": result.get("usage", {}),
        }

    async def stream_chat_completion(
        self,
        messages: list[dict[str, str]],
        temperature: float = 0.3,
        max_tokens: int = 2000,
    ) -> AsyncIterator[str]:
        """Streaming chat completion. Yields content tokens."""
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=LLM_TIMEOUT) as client:
            async with client.stream(
                "POST",
                self.endpoint_url,
                headers=self._headers(),
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        delta = chunk["choices"][0].get("delta", {})
                        content = delta.get("content", "")
                        if content:
                            yield content
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue


def get_mindrouter_client() -> MindRouterClient:
    """Factory function returning a configured MindRouter client (gpt-oss-120b)."""
    return MindRouterClient()


def get_ocr_client() -> MindRouterClient:
    """Factory function returning a MindRouter client configured for OCR (dots.ocr)."""
    return MindRouterClient(model=settings.mindrouter_ocr_model)
