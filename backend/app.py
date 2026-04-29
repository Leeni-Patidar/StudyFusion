import os
import json
import hashlib
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

# Load environment
os.environ["CREWAI_DISABLE_TELEMETRY"] = "true"
from dotenv import load_dotenv
load_dotenv(override=True)

# Import existing functionality
from agents.crew_setup import run_notes, run_questions
from agents.image_agent import generate_hf_images
from utils.history_manager import save_history, load_history
from tools.docx_export import export_docx

app = FastAPI(title="StudyFusion API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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
    mode: str  # "notes", "questions", "doubt"

class ImageRequest(BaseModel):
    user_id: str
    prompt: str
    count: int = 5

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
    return hashlib.sha256(password.encode()).hexdigest()

# ================= AUTH ENDPOINTS =================
@app.post("/api/register")
def register(req: RegisterRequest):
    users = load_users()
    
    if req.email in users:
        raise HTTPException(status_code=400, detail="User already exists!")
    
    users[req.email] = {
        "name": req.name,
        "password": hash_password(req.password)
    }
    
    save_users(users)
    return {"success": True, "message": "Registration successful!"}

@app.post("/api/login")
def login(req: LoginRequest):
    users = load_users()
    
    for email, data in users.items():
        if data["name"] == req.name and data["password"] == hash_password(req.password):
            return {
                "success": True,
                "user": {"name": req.name, "email": email}
            }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

# ================= CHAT ENDPOINTS =================
@app.post("/api/chat")
def chat(req: ChatRequest):
    """Handle chat requests for notes, questions, or doubt solving"""
    result = None
    
    if req.mode == "notes":
        result = run_notes(req.message, "Detailed Notes")
    elif req.mode == "questions":
        result = run_questions(req.message, "MCQ", 10)
    elif req.mode == "doubt":
        result = run_notes(req.message, "Detailed Notes")
    else:
        raise HTTPException(status_code=400, detail="Invalid mode")
    
    # Save to history
    save_history(req.user_id, req.message, result)
    
    return {"success": True, "result": result}

@app.post("/api/generate-notes")
def generate_notes(req: ChatRequest):
    """Generate notes in different formats"""
    result = run_notes(req.message, "Detailed Notes")
    save_history(req.user_id, f"Notes: {req.message}", result)
    return {"success": True, "result": result}

@app.post("/api/generate-questions")
def generate_questions(req: ChatRequest):
    """Generate practice questions"""
    result = run_questions(req.message, "MCQ", 10)
    save_history(req.user_id, f"Questions: {req.message}", result)
    return {"success": True, "result": result}

# ================= IMAGE ENDPOINT =================
@app.post("/api/generate-images")
def generate_images(req: ImageRequest):
    """Generate images from prompt"""
    try:
        images = generate_hf_images(req.prompt, req.count)
        # Convert bytes to base64 for JSON response
        import base64
        images_b64 = [base64.b64encode(img).decode() for img in images]
        return {"success": True, "images": images_b64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ================= HISTORY ENDPOINTS =================
@app.get("/api/history/{user_id}")
def get_history(user_id: str):
    """Get user history"""
    history = load_history(user_id)
    return {"success": True, "history": history}

# ================= EXPORT ENDPOINT =================
@app.post("/api/export")
def export_document(req: ChatRequest):
    """Export content to DOCX"""
    try:
        export_docx(req.message, "output.docx")
        with open("output.docx", "rb") as f:
            import base64
            docx_b64 = base64.b64encode(f.read()).decode()
        return {"success": True, "document": docx_b64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)