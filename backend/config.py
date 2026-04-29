import os

from dotenv import load_dotenv


load_dotenv(override=True)

def env_value(name, default=None):
    value = os.getenv(name, default)
    if isinstance(value, str):
        return value.strip().strip('"').strip("'")
    return value


LLM_MODEL = env_value("LLM_MODEL", "groq/llama-3.1-8b-instant")

EMBEDDING_MODEL = "all-MiniLM-L6-v2"

HISTORY_FILE = "database/history.json"
