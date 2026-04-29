import os
import litellm
from config import LLM_MODEL, env_value

# Load Groq API key from environment variable
GROQ_API_KEY = env_value("GROQ_API_KEY")
if GROQ_API_KEY:
    litellm.api_key = GROQ_API_KEY
else:
    raise ValueError("GROQ_API_KEY not set in environment. Please add it to your .env file.")

groq_llm = LLM(
    model=LLM_MODEL,
    temperature=0.5
)
