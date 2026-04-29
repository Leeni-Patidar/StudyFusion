import requests
from config import LLM_MODEL, env_value

GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions"


def _groq_model_name():
    if LLM_MODEL.startswith("groq/"):
        return LLM_MODEL.replace("groq/", "")
    return LLM_MODEL


def _run_completion(prompt):

    api_key = env_value("GROQ_API_KEY")

    if not api_key:
        raise Exception(
            "GROQ_API_KEY missing in .env"
        )

    try:
        response = requests.post(
            GROQ_CHAT_COMPLETIONS_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type":"application/json"
            },
            json={
                "model": _groq_model_name(),
                "messages":[
                    {
                     "role":"user",
                     "content":prompt
                    }
                ],
                "temperature":0.5,
                "max_tokens":1200
            },
            timeout=90
        )


        if response.status_code != 200:
            raise Exception(
                f"Groq Error {response.status_code}: {response.text}"
            )


        data=response.json()

        return data["choices"][0]["message"]["content"]


    except Exception as e:
        raise Exception(
            f"LLM failed: {str(e)}"
        )


def run_notes(topic, mode):

    prompt=f"""
Create {mode} notes on {topic}

Use:
- headings
- explanation
- examples
- proper formatting
"""

    return _run_completion(
        prompt
    )



def run_questions(topic,qtype,number):

    prompt=f"""
Generate exactly {number} {qtype} questions with answers on {topic}.

Return only questions and answers.
"""

    return _run_completion(
        prompt
    )