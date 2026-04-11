import httpx

from app.config import settings


class OpenRouterClient:
    MODELS = [
        "meta-llama/llama-3.1-8b-instruct:free",
        "google/gemma-3-4b-it:free",
        "google/gemma-3-1b-it:free",
    ]
    TIMEOUT = 10  # seconds

    def __init__(self) -> None:
        self.base_url = settings.OPENROUTER_BASE_URL
        self.api_key = settings.OPENROUTER_API_KEY

    async def chat(
        self, messages: list[dict[str, str]], model_index: int = 0
    ) -> tuple[str | None, str | None]:
        """Try models starting from model_index. Returns (content, model_used) or (None, None)."""
        for idx in range(model_index, len(self.MODELS)):
            model = self.MODELS[idx]
            try:
                async with httpx.AsyncClient(timeout=self.TIMEOUT) as client:
                    response = await client.post(
                        f"{self.base_url}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {self.api_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": model,
                            "messages": messages,
                        },
                    )
                    if response.status_code >= 400:
                        continue

                    data = response.json()
                    choices = data.get("choices", [])
                    if not choices:
                        continue

                    content = choices[0].get("message", {}).get("content", "")
                    if not content or not content.strip():
                        continue

                    return content.strip(), model

            except (httpx.TimeoutException, httpx.RequestError, ValueError, KeyError):
                continue

        return None, None


ai_client = OpenRouterClient()
