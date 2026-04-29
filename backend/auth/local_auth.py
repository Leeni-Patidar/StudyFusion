import streamlit as st
import json
import os
import hashlib

USER_DB = "users.json"

# ---------- Load Users ----------
def load_users():
    if not os.path.exists(USER_DB):
        return {}
    with open(USER_DB, "r") as f:
        return json.load(f)

# ---------- Save Users ----------
def save_users(users):
    with open(USER_DB, "w") as f:
        json.dump(users, f, indent=4)

# ---------- Hash Password ----------
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# ---------- Register ----------
def register_user(name, email, password):
    users = load_users()

    if email in users:
        return False, "User already exists!"

    users[email] = {
        "name": name,
        "password": hash_password(password)
    }

    save_users(users)
    return True, "Registration successful!"

# ---------- Login ----------
def login_user(name, password):
    users = load_users()

    for email, data in users.items():
        if data["name"] == name and data["password"] == hash_password(password):
            return True, {"name": name, "email": email}

    return False, None

# ---------- Logout ----------
def logout():
    st.session_state.clear()