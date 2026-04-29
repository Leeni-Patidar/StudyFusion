import requests

from config import LLM_MODEL, env_value

GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions"


def _is_auth_error(error_text):
    markers = (
        "401",
        "unauthorized",
        "invalid_api_key",
        "invalid api key",
        "invalid x-api-key",
        "invalid or expired token",
    )
    return any(marker in error_text.lower() for marker in markers)


def _groq_model_name():
    if LLM_MODEL.startswith("groq/"):
        return LLM_MODEL.removeprefix("groq/")
    return LLM_MODEL


def _format_groq_error(response):
    try:
        payload = response.json()
    except ValueError:
        payload = {}

    message = payload.get("error", {}).get("message") or payload.get("message") or response.text
    if response.status_code == 401:
        return (
            "Error: Groq rejected GROQ_API_KEY with 401 Unauthorized. "
            "Make sure the key in .env is the active key from your Groq dashboard, "
            "there is no extra space around it, and restart Streamlit after saving .env."
        )
    if response.status_code == 404:
        return (
            f"Error: Groq model '{_groq_model_name()}' was not found. "
            "Update LLM_MODEL in .env to a model available in your Groq dashboard."
        )
    return f"Error: Groq API returned {response.status_code}: {message}"


def _run_completion(prompt):
    api_key = env_value("GROQ_API_KEY")
    if LLM_MODEL.startswith("groq/") and not api_key:
        return "Error: GROQ_API_KEY is missing. Add a valid Groq API key to your .env file."

    try:
        response = requests.post(
            GROQ_CHAT_COMPLETIONS_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": _groq_model_name(),
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.5,
                "max_tokens": 700,
            },
            timeout=60,
        )
        if not response.ok:
            return _format_groq_error(response)

        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        error_text = str(e)
        if _is_auth_error(error_text):
            return (
                "Error: Groq rejected GROQ_API_KEY. Create a new key in your Groq dashboard, "
                "update GROQ_API_KEY in .env, save the file, then restart Streamlit."
            )
        return f"Error: {error_text}"


def run_notes(topic, mode):
    prompt = f"""
    Create {mode} notes on: {topic}

    Keep it:
    - Clear
    - Structured
    - Concise
    """
    return _run_completion(prompt)


def run_questions(topic, qtype, number):
    prompt = f"""
    Generate {number} {qtype} questions with answers on: {topic}

    Keep answers short and clear.
    """
    return _run_completion(prompt)
