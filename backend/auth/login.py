import json
import os

USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")

def authenticate(username, password):
    try:
        with open(USERS_FILE, "r") as f:
            users = json.load(f)

        if username in users and users[username] == password:
            return True

        return False

    except Exception as e:
        print("Auth error:", e)
        return False
