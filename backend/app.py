import os
import json
import hashlib
import base64
import uvicorn

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# ================= ENV =================
load_dotenv(override=True)
os.environ["CREWAI_DISABLE_TELEMETRY"] = "true"

# ================= IMPORTS =================
from agents.groq_setup import run_notes, run_questions
from agents.image_agent import generate_hf_images
from utils.history_manager import save_history, load_history
from tools.docx_export import export_docx

app = FastAPI(title="StudyFusion API")
frontend_path = os.path.join(os.path.dirname(__file__), "static")

# Serve assets (JS, CSS)
app.mount(
    "/assets",
    StaticFiles(directory=os.path.join(frontend_path, "assets")),
    name="assets"
)

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= MODELS =================

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    name: str
    password: str


class ChatRequest(BaseModel):
    user_id: str
    message: str
    mode: str   # notes | questions | doubt | image

    # questions
    questionTypes: Optional[str] = "mcq"
    count: Optional[int] = 10

    # notes
    note_type: Optional[str] = None


class ImageRequest(BaseModel):
    user_id: str
    prompt: str
    count: int = 4


# ================= AUTH HELPERS =================

USER_DB = "users.json"


def load_users():
    if not os.path.exists(USER_DB):
        return {}

    with open(USER_DB, "r") as f:
        return json.load(f)


def save_users(users):
    with open(USER_DB, "w") as f:
        json.dump(users, f, indent=4)


def hash_password(password):
    return hashlib.sha256(
        password.encode()
    ).hexdigest()


# ================= AUTH =================

@app.post("/api/register")
def register(req: RegisterRequest):

    users = load_users()

    if req.email in users:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    users[req.email] = {
        "name": req.name,
        "password": hash_password(req.password)
    }

    save_users(users)

    return {
        "success": True,
        "message": "Registration successful"
    }


@app.post("/api/login")
def login(req: LoginRequest):

    users = load_users()

    for email, data in users.items():

        if (
            data["name"] == req.name
            and
            data["password"] == hash_password(req.password)
        ):
            return {
                "success": True,
                "user": {
                    "name": req.name,
                    "email": email
                }
            }

    raise HTTPException(
        status_code=401,
        detail="Invalid credentials"
    )


# ================= QUESTION TYPE MAPPER =================

def map_question_type(q):
    q_map = {
        "mcq": "MCQ",
        "short": "Short Questions",
        "long": "Long Questions",

        "MCQ": "MCQ",
        "Short Questions": "Short Questions",
        "Long Questions": "Long Questions"
    }

    return q_map.get(q, "MCQ")


# ================= MAIN CHAT =================

@app.post("/api/chat")
def chat(req: ChatRequest):

    try:

        print("MODE:", req.mode)
        print("MESSAGE:", req.message)

        # -------- NOTES --------
        if req.mode == "notes":

            result = run_notes(
                req.message,
                req.note_type or "Detailed Notes"
            )

        # -------- QUESTIONS --------
        elif req.mode == "questions":

            q_type = map_question_type(
                req.questionTypes
            )

            print("QUESTION TYPE:", q_type)

            result = run_questions(
                req.message,
                q_type,
                req.count or 10
            )

        # -------- DOUBT --------
        elif req.mode in ["doubt", "chat"]:

            result = run_notes(
                req.message,
                "Doubt Solver"
            )

        # -------- IMAGE --------
        elif req.mode == "image":

            images = generate_hf_images(
                req.message,
                4
            )

            images_b64 = [
                base64.b64encode(
                    img
                ).decode()
                for img in images
            ]

            save_history(
                req.user_id,
                f"Image: {req.message}",
                "Generated Images"
            )

            return {
                "success": True,
                "images": images_b64
            }

        else:
            raise Exception(
                f"Invalid mode: {req.mode}"
            )

        save_history(
            req.user_id,
            req.message,
            result
        )

        return {
            "success": True,
            "result": result
        }

    except Exception as e:

        print("CHAT ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ================= NOTES =================

@app.post("/api/generate-notes")
def generate_notes(req: ChatRequest):

    try:

        result = run_notes(
            req.message,
            req.note_type or "Detailed Notes"
        )

        save_history(
            req.user_id,
            f"Notes: {req.message}",
            result
        )

        return {
            "success": True,
            "result": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ================= QUESTIONS =================

@app.post("/api/generate-questions")
def generate_questions(req: ChatRequest):

    try:

        q_type = map_question_type(
            req.questionTypes
        )

        print("QUESTION TYPE:", q_type)

        result = run_questions(
            req.message,
            q_type,
            req.count or 10
        )

        save_history(
            req.user_id,
            f"{q_type}: {req.message}",
            result
        )

        return {
            "success": True,
            "result": result
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ================= IMAGE =================

@app.post("/api/generate-images")
def generate_images(req: ImageRequest):

    try:

        images = generate_hf_images(
            req.prompt,
            req.count
        )

        images_b64 = [
            base64.b64encode(
                img
            ).decode()
            for img in images
        ]

        return {
            "success": True,
            "images": images_b64
        }

    except Exception as e:

        print("IMAGE ERROR:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ================= HISTORY =================

@app.get("/api/history/{user_id}")
def history(user_id: str):

    try:
        return {
            "success": True,
            "history": load_history(
                user_id
            )
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ================= EXPORT =================

@app.post("/api/export")
def export_document(req: ChatRequest):

    try:

        export_docx(
            req.message,
            "output.docx"
        )

        with open(
            "output.docx",
            "rb"
        ) as f:

            doc_b64 = base64.b64encode(
                f.read()
            ).decode()

        return {
            "success": True,
            "document": doc_b64
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ================= HEALTH =================

@app.get("/")
def serve_frontend():
    return FileResponse(os.path.join(frontend_path, "index.html"))


# ================= RUN =================

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
