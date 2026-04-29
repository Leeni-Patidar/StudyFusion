import os
import requests
import time

HF_TOKEN=os.getenv("HF_TOKEN")

MODEL=os.getenv(
   "HF_IMAGE_MODEL",
   "stabilityai/stable-diffusion-2"
)

API_URL=f"https://api-inference.huggingface.co/models/{MODEL}"

HEADERS={
 "Authorization":f"Bearer {HF_TOKEN}"
}


def generate_hf_images(prompt,count=4):

    if not HF_TOKEN:
        raise Exception(
           "HF token missing"
        )

    images=[]

    for _ in range(count):

        r=requests.post(
            API_URL,
            headers=HEADERS,
            json={
               "inputs":prompt,
               "options":{
                  "wait_for_model":True
               }
            },
            timeout=180
        )


        if r.status_code!=200:
            raise Exception(
               f"HF Error {r.status_code}: {r.text}"
            )


        if "image" not in r.headers.get(
             "content-type",""
        ):
            raise Exception(
              "Model returned non-image response"
            )


        images.append(
            r.content
        )

        time.sleep(1)


    return images