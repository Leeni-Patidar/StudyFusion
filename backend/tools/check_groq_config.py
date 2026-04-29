import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from config import LLM_MODEL, env_value


def mask_key(value):
    if not value:
        return "missing"
    if len(value) <= 8:
        return "***"
    return f"{value[:4]}...{value[-4:]}"


def main():
    api_key = env_value("GROQ_API_KEY")
    model = LLM_MODEL.removeprefix("groq/")

    print(f"GROQ_API_KEY: {mask_key(api_key)}")
    print(f"GROQ_API_KEY length: {len(api_key or '')}")
    print(f"LLM_MODEL: {LLM_MODEL}")
    print(f"Groq request model: {model}")

    if not api_key:
        print("Status: missing GROQ_API_KEY")
    elif not api_key.startswith("gsk_"):
        print("Status: key does not start with gsk_")
    else:
        print("Status: local .env format looks OK")


if __name__ == "__main__":
    main()
