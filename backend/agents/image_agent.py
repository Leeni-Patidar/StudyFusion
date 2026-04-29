from io import BytesIO

from crewai import Agent
from huggingface_hub import InferenceClient

from config import env_value
from llm.groq_llm import groq_llm


image_agent = Agent(
    role="Educational Image Prompt Designer",

    goal="""
    Create clear and detailed image prompts for educational visuals.
    Focus on accurate diagrams, study-friendly illustrations, and clean visual composition.
    """,

    backstory="""
    You are a visual learning specialist.
    You turn learning topics into image prompts that are:
    - Easy to understand
    - Visually clear
    - Suitable for students
    - Free from unnecessary clutter
    """,

    llm=groq_llm,

    verbose=False,
    allow_delegation=False
)


def generate_hf_images(prompt, image_count=5):
    token = (
        env_value("HF_API_TOKEN")
        or env_value("HF_TOKEN")
        or env_value("HUGGINGFACEHUB_API_TOKEN")
    )
    if not token:
        raise ValueError("Missing Hugging Face token. Add HF_API_TOKEN to your .env file.")

    model = env_value("HF_IMAGE_MODEL", "stabilityai/stable-diffusion-3.5-large-turbo")
    provider = env_value("HF_IMAGE_PROVIDER", "hf-inference")
    client = InferenceClient(provider=provider, api_key=token, timeout=120)

    images = []
    try:
        for image_number in range(image_count):
            image = client.text_to_image(
                prompt,
                model=model,
                seed=image_number + 1,
            )
            image_buffer = BytesIO()
            image.save(image_buffer, format="PNG")
            images.append(image_buffer.getvalue())
    except Exception as exc:
        error_text = str(exc)
        if "401" in error_text or "Unauthorized" in error_text or "Invalid or expired token" in error_text:
            raise ValueError(
                "Invalid image API token. Create a new Hugging Face access token, "
                "update HF_API_TOKEN in .env, set HF_IMAGE_PROVIDER=hf-inference, then restart the app."
            ) from exc
        raise

    return images
