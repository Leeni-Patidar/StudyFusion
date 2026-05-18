# 📚 StudyFusion – AI Powered Learning Assistant

## 📖 Project Overview

**StudyFusion** is an AI-powered educational platform designed to enhance the learning experience for students. The application helps users generate study materials instantly using Artificial Intelligence, making learning faster, smarter, and more interactive.

The platform provides intelligent features like:

- AI-generated MCQs, short questions, and long-answer questions
- AI-generated notes in detailed, short, and bullet-point formats
- AI image generation
- Interactive AI chatbot for doubt-solving and learning assistance

Built using modern web technologies and Generative AI integrations, **StudyFusion** offers a clean, responsive, and user-friendly interface for personalized learning.

---

# 🚀 Features

## 🧠 AI Question Generator

Generate different types of questions instantly from any topic:

- ✅ Multiple Choice Questions (MCQs)
- ✅ Short Answer Questions
- ✅ Long Answer Questions

---

## 📝 AI Notes Generator

Generate study notes in multiple formats:

- 📖 Detailed Notes
- ✨ Short Notes
- 🔹 Bullet Point Notes

---

## 🎨 AI Image Generation

Generate educational and creative images using AI prompts.

---

## 💬 AI Chatbot

Interactive chatbot for:

- 🤖 Doubt Solving
- 📚 Topic Explanations
- 🎯 Learning Assistance
- ✨ Personalized Responses

---

## 📱 Responsive UI

- Fully Responsive Design
- Clean and Modern User Interface
- Optimized for Desktop and Mobile Devices

---

## ⚡ Fast & Scalable

- Optimized Performance
- AI-powered Automation
- Scalable Architecture

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Tailwind CSS
- JavaScript

## Backend
- Python
-
## AI & APIs
- Groq API
- Hugging Face API

## Deployment & DevOps
- Docker
- AWS EC2
- Git & GitHub

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Leeni-Patidar/StudyFusion.git
```

---

## 2️⃣ Navigate to Project Folder

```bash
cd StudyFusion
```

---

# 💻 Frontend Setup

## Install Dependencies

```bash
cd frontend
npm install
```

## Run Frontend

```bash
npm run dev
```

---

# ⚙️ Backend Setup

## Navigate to Backend Folder

```bash
cd backend
```

## Create Virtual Environment

```bash
python -m venv .venv
```

## Activate Virtual Environment

### Windows

```bash
.venv\Scripts\activate
```

### Linux / MacOS

```bash
source .venv/bin/activate
```

## Install Required Packages

```bash
pip install -r requirements.txt
```

## Run Backend Server

```bash
python app.py
```

---

# ☁️ Deployment on AWS EC2 (Ubuntu)

## 🔹 Step 1: Update Packages

```bash
sudo apt update
```

---

## 🔹 Step 2: Install Docker

```bash
sudo apt install docker.io -y
```

---

## 🔹 Step 3: Start & Enable Docker

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

---

## 🔹 Step 4: Add User to Docker Group

```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🔹 Step 5: Clone Repository

```bash
git clone https://github.com/Leeni-Patidar/StudyFusion.git
cd StudyFusion
```

---

# 🔐 Environment Variables Setup

## Backend Environment Variables

```bash
nano backend/.env
```

Add the following:

```env
GROQ_API_KEY=Your_Groq_API_Key
LLM_MODEL=groq/llama-3.3-70b-versatile
HF_TOKEN=Your_HuggingFace_Token
```

---

## Frontend Environment Variables

```bash
nano frontend/.env
```

Add the following:

```env
REACT_APP_API_URL=http://YOUR_PUBLIC_IP:8000
```

Save File:

```bash
CTRL + X → Y → ENTER
```

---

# 🐳 Docker Setup

## Build Docker Image

```bash
sudo docker build --no-cache -t studyfusion .
```

---

## Run Docker Container

```bash
sudo docker run -d -p 8000:8000 \
--env-file backend/.env \
--name studyfusion-container studyfusion
```

---

## Verify Running Containers

```bash
sudo docker ps
```

---
