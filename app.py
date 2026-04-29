import os
os.environ["CREWAI_DISABLE_TELEMETRY"] = "true"

from io import BytesIO

import streamlit as st
from dotenv import load_dotenv
from agents.crew_setup import run_notes, run_questions
from agents.image_agent import generate_hf_images
from auth.local_auth import register_user, login_user, logout
from utils.history_manager import save_history, load_history
from tools.docx_export import export_docx

load_dotenv(override=True)

st.set_page_config(page_title="NoteMind AI", layout="wide")

# ================= SESSION =================
defaults = {
    "user": None,
    "history": [],
    "chat_history": [],
    "mode": None,
    "pending_action": None,
    "topic_input": "",
    "image_prompt": "",
    "generated_images": [],
    "last_mode": None,
    "auth_mode": "login"
}

for k, v in defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v

# Ensure history is loaded when a user is already signed in (e.g., after a rerun)
if st.session_state.user and not st.session_state.history:
    st.session_state.history = load_history(st.session_state.user["email"])

# ================= GLOBAL STYLING =================
# Apply a consistent, modern theme for both the landing page and main app.
st.markdown(
    """
    <style>
    :root {
        --bg1: #0a0f1a;
        --bg2: #111b2d;
        --card-bg: rgba(255,255,255,0.08);
        --text: #e2e8f0;
        --muted: #a1aabf;
        --accent: #38bdf8;
        --accent2: #6366f1;
        --border: rgba(255,255,255,0.12);
        --shadow: 0 12px 24px rgba(0,0,0,0.35);
    }

    .stApp {
        background: radial-gradient(circle at top, var(--accent), var(--bg1) 55%, var(--bg2));
        color: var(--text);
    }

   .stButton>button, .stDownloadButton>button {
    background: #0b3d91 !important;  /* dark blue */
    color: #ffffff !important;
    border: 1px solid #0a2f6b !important;
    border-radius: 12px !important;
    padding: 0.65rem 1.1rem !important;
}

.stButton>button:hover, .stDownloadButton>button:hover {
    background: #0d47a1 !important;  /* slightly lighter on hover */
}

 
  

   /* 🔥 Input text black */
    .stTextInput input,
    .stTextArea textarea {
        background: rgba(255,255,255,0.85) !important;  /* thoda light bg for contrast */
        color: #000000 !important;
        -webkit-text-fill-color: #000000 !important; /* Chrome fix */
        border: 1px solid rgba(0,0,0,0.2) !important;
        border-radius: 14px !important;
    }

    /* 🔥 Label (Name, Password, Email) black + bigger */
    .stTextInput label,
    .stTextArea label {
        color: #000000 !important;
        font-size: 16px !important;
        font-weight: 600 !important;
    }

    /* 🔥 Placeholder */
    .stTextInput input::placeholder {
        color: #555 !important;
    }

    .stSidebar {
        background: rgba(10, 15, 26, 0.9) !important;
    }

    .stSidebar h3,
    .stSidebar .streamlit-expanderHeader {
        color: #ffffff !important;
    }

    .glass {
        background: var(--card-bg);
        backdrop-filter: blur(18px);
        padding: 36px;
        border-radius: 22px;
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
    }

    .title {
        font-size: 58px;
        font-weight: 800;
        background: linear-gradient(90deg, var(--accent), var(--accent2));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin: 0;
    }

    .subtitle {
        color: var(--muted);
        margin: 12px 0 30px;
    }

    .feature-list {
        margin-top: 20px;
        padding-left: 20px;
        color: var(--muted);
    }

    .feature-list li {
        margin: 10px 0;
    }

    .feature-card {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        padding: 18px;
        margin-top: 18px;
        box-shadow: rgba(0, 0, 0, 0.25) 0px 10px 25px;
    }

    </style>
    """,
    unsafe_allow_html=True,
)


# ================= PREMIUM LANDING =================
if not st.session_state.user:

    col1, col2 = st.columns([1.2, 1])

    with col1:
        st.markdown('<div class="title">NoteMind AI</div>', unsafe_allow_html=True)
        st.markdown('<div class="subtitle">Multi-Agent Learning System</div>', unsafe_allow_html=True)

        st.markdown(
            '<div class="feature-card">'
            '<h4 style="margin: 0 0 10px;">What can NoteMind AI do?</h4>'
            '<ul class="feature-list">'
            '<li>✅ Generate notes, questions, and clear doubts quickly</li>'
            '<li>✅ Save your history and continue where you left off</li>'
            '<li>✅ Export results to Word (.docx)</li>'
            '<li>✅ Built with modular multi-agent architecture</li>'
            '</ul>'
            '</div>',
            unsafe_allow_html=True,
        )

    with col2:
        st.markdown('<div class="glass">', unsafe_allow_html=True)

        if st.session_state.auth_mode == "login":
            st.subheader("Login")

            name = st.text_input("Name")
            password = st.text_input("Password", type="password")

            if st.button("Login"):
                success, user = login_user(name, password)
                if success:
                    st.session_state.user = user
                    st.session_state.history = load_history(user["email"])
                    st.rerun()
                else:
                    st.error("Invalid credentials")

            if st.button("Go to Register"):
                st.session_state.auth_mode = "register"
                st.rerun()

        else:
            st.subheader("Register")

            name = st.text_input("Name", key="reg_name")
            email = st.text_input("Email")
            password = st.text_input("Password", type="password", key="reg_pass")

            if st.button("Register"):
                success, msg = register_user(name, email, password)
                if success:
                    st.success(msg)
                    st.session_state.auth_mode = "login"
                else:
                    st.error(msg)

            if st.button("Back to Login"):
                st.session_state.auth_mode = "login"
                st.rerun()

        st.markdown('</div>', unsafe_allow_html=True)

    st.stop()

# ================= AUTHENTICATED PAGE STYLE OVERRIDE =================
# Apply a white page background only after login, without changing premium landing style.
if st.session_state.user:
    st.markdown(
        """
        <style>
        .stApp {
            background: #ffffff !important;
            color: #0a0f1a !important;
        }

        .css-1d391kg, .css-eth8g3 { /* streamlit main content and padding containers */
            background: #ffffff !important;
        }

        .stAlert, .stInfo, .stSuccess, .stWarning, .stError {
            border-radius: 12px !important;
        }

        .stChatMessage>div {
            color: #0a0f1a !important;
        }

        </style>
        """,
        unsafe_allow_html=True,
    )

# ================= MODE RESET =================
if st.session_state.mode != st.session_state.last_mode:
    st.session_state.pending_action = None
    st.session_state.topic_input = ""
    st.session_state.image_prompt = ""
    st.session_state.generated_images = []
    st.session_state.chat_history = []
    st.session_state.last_mode = st.session_state.mode

# ================= SIDEBAR =================
def switch_mode(new_mode):
    st.session_state.mode = new_mode
    st.session_state.pending_action = None
    st.session_state.topic_input = ""
    st.session_state.image_prompt = ""
    st.session_state.generated_images = []
    st.rerun()


with st.sidebar:
    st.success(f"👤 {st.session_state.user['name']}")

    # ✅ NEW CHAT
    if st.button("➕ New Chat"):
        st.session_state.chat_history = []
        st.session_state.pending_action = None
        st.rerun()

    st.divider()

    # ✅ MODES
    if st.button("🧠 Doubt Session"):
        switch_mode("doubt")

    if st.button("📝 Generate Notes"):
        switch_mode("notes")

    if st.button("❓ Generate Questions"):
        switch_mode("questions")

    if st.button("🖼️ Generate Image"):
        switch_mode("image")

    st.divider()

    # ✅ HISTORY
    st.subheader("🕘 History")

    # Display history with stable keys so buttons remain consistent across reruns
    history = st.session_state.history or []
    if not history:
        st.info("No history yet. Your past queries will appear here.")
    else:
        for idx in range(len(history) - 1, -1, -1):
            item = history[idx]
            if st.button(item["query"][:25], key=f"hist_{idx}"):
                st.session_state.chat_history.append({
                    "user": item["query"],
                    "bot": item["result"]
                })
                st.rerun()

    st.divider()

    if st.button("Logout"):
        logout()
        st.rerun()

# ================= MAIN =================
st.markdown("## 🧠 NoteMind AI")

# ✅ MODE TAGLINE
if st.session_state.mode == "doubt":
    st.info("🧠 Doubt Session: Ask anything freely!")

elif st.session_state.mode == "notes":
    st.info("📝 Notes Mode: Generate structured notes")

elif st.session_state.mode == "questions":
    st.info("❓ Questions Mode: Create questions instantly")

elif st.session_state.mode == "image":
    st.info("🖼️ Image Mode: Generate 5 Stable Diffusion images")

else:
    st.warning("⚠️ Please select a mode from sidebar")

# ================= IMAGE GENERATION =================
if st.session_state.mode == "image":
    st.session_state.image_prompt = st.text_area(
        "Image prompt",
        value=st.session_state.image_prompt,
        placeholder="Describe the image you want to generate...",
        height=120,
    )

    if st.button("🖼️ Generate 5 Images"):
        prompt = st.session_state.image_prompt.strip()
        if not prompt:
            st.warning("Please enter an image prompt.")
        else:
            try:
                with st.spinner("Generating 5 images with Stable Diffusion..."):
                    st.session_state.generated_images = generate_hf_images(prompt, 5)
                st.success("Images generated successfully.")
            except Exception as exc:
                st.session_state.generated_images = []
                st.error(str(exc))

    if st.session_state.generated_images:
        cols = st.columns(2)
        for idx, image_bytes in enumerate(st.session_state.generated_images, start=1):
            with cols[(idx - 1) % 2]:
                st.image(BytesIO(image_bytes), caption=f"Image {idx}", use_container_width=True)
                st.download_button(
                    f"⬇ Download Image {idx}",
                    image_bytes,
                    file_name=f"notemind_image_{idx}.png",
                    mime="image/png",
                    key=f"download_image_{idx}",
                )

    st.stop()

# ================= CHAT =================
for chat in st.session_state.chat_history:
    st.chat_message("user").write(chat["user"])
    st.chat_message("assistant").write(chat["bot"])

# ================= INPUT =================
user_input = st.chat_input("Type your message...")

if user_input:
    st.session_state.topic_input = user_input

    if st.session_state.mode == "notes":
        st.session_state.pending_action = "notes"
    elif st.session_state.mode == "questions":
        st.session_state.pending_action = "questions"
    elif st.session_state.mode == "doubt":
        st.session_state.pending_action = "doubt"
    else:
        st.warning("Select a mode")
        st.stop()

    st.rerun()

# ================= ACTION =================
result = None

if st.session_state.pending_action == "notes":
    c1, c2, c3 = st.columns(3)

    if c1.button("Detailed"):
        result = run_notes(st.session_state.topic_input, "Detailed Notes")
    elif c2.button("Short"):
        result = run_notes(st.session_state.topic_input, "Short Notes")
    elif c3.button("Bullet"):
        result = run_notes(st.session_state.topic_input, "Bullet Points")

elif st.session_state.pending_action == "questions":
    c1, c2, c3 = st.columns(3)

    if c1.button("MCQ"):
        result = run_questions(st.session_state.topic_input, "MCQ", 10)
    elif c2.button("Short"):
        result = run_questions(st.session_state.topic_input, "Short Questions", 10)
    elif c3.button("Long"):
        result = run_questions(st.session_state.topic_input, "Long Questions", 10)

elif st.session_state.pending_action == "doubt":
    with st.spinner("Thinking..."):
        result = run_notes(st.session_state.topic_input, "Detailed Notes")

# ================= SAVE =================
if result:
    st.session_state.chat_history.append({
        "user": st.session_state.topic_input,
        "bot": result
    })

    save_history(
        st.session_state.user["email"],
        st.session_state.topic_input,
        result
    )
    st.session_state.history = load_history(st.session_state.user["email"])
    st.session_state.pending_action = None
    st.rerun()

# ================= DOWNLOAD =================
if st.session_state.chat_history:
    last = st.session_state.chat_history[-1]["bot"]
    export_docx(last, "output.docx")

    with open("output.docx", "rb") as f:
        st.download_button("⬇ Download Last Output", f)
