import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PORT: int = 8000
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/confluence")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    AGENT_RUNTIME_INTERNAL_SECRET: str = os.getenv(
        "AGENT_RUNTIME_INTERNAL_SECRET", "confluence-shared-internal-secret-token-xyz987"
    )

    # API Keys
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    AGENT_ROUTER_API_KEY: str = os.getenv("AGENT_ROUTER_API_KEY", "")

    # Role Model Assignments (Active Provider Catalogs)
    GROQ_REASONING_MODEL: str = "qwen/qwen3.8-27b"
    GEMINI_MODEL: str = "gemini-2.5-flash"
    MISTRAL_MODEL: str = "mistral-small-latest"
    NVIDIA_MODEL: str = "meta/llama-3.2-11b-vision-instruct"
    OPENROUTER_MODEL: str = "deepseek/deepseek-r1"

    # Agent Router Models
    AGENT_ROUTER_TRADER_MODEL: str = "deepseek-v4-flash"
    AGENT_ROUTER_RISK_MANAGER_MODEL: str = "claude-opus-4.8"
    AGENT_ROUTER_PORTFOLIO_MANAGER_MODEL: str = "gpt-6-astra"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
