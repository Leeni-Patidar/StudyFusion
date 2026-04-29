import os
import requests
import time

HF_TOKEN = os.getenv("HF_TOKEN")

API_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell"

HEADERS = {
    "Authorization": f"Bearer {HF_TOKEN}",
    "Content-Type": "application/json"
}


def generate_hf_images(prompt, count=5):

    if not HF_TOKEN:
        raise Exception("HF token missing")

    images=[]

    variations = [
        "diagram style",
        "realistic illustration",
        "3d educational rendering",
        "infographic style",
        "labeled scientific drawing"
    ]

    for i in range(count):

        varied_prompt = (
            f"{prompt}, "
            f"{variations[i % len(variations)]}, "
            f"unique composition, different angle"
        )

        r = requests.post(
            API_URL,
            headers=HEADERS,
            json={
                "inputs": varied_prompt
            },
            timeout=300
        )

        if r.status_code != 200:
            raise Exception(
                f"HF Error {r.status_code}: {r.text}"
            )

        images.append(r.content)

        time.sleep(1)

    return images

    if not HF_TOKEN:
        raise Exception("HF token missing")

    images = []

    for _ in range(count):

        r = requests.post(
            API_URL,
            headers=HEADERS,
            json={
                "inputs": prompt
            },
            timeout=300
        )

        if r.status_code != 200:
            raise Exception(
                f"HF Error {r.status_code}: {r.text}"
            )

        if "image" not in r.headers.get(
            "content-type",""
        ):
            raise Exception(
                f"Unexpected response: {r.text}"
            )

        images.append(r.content)

        time.sleep(1)

    return images