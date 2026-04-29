import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "database")

# ✅ Ensure folder exists
os.makedirs(DB_PATH, exist_ok=True)


def get_file_path(email):
    safe_email = email.replace("@", "_").replace(".", "_")
    return os.path.join(DB_PATH, f"history_{safe_email}.json")


def load_history(email):
    file = get_file_path(email)

    if not os.path.exists(file):
        return []

    try:
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)

            # ✅ Ensure always list
            if isinstance(data, list):
                return data
            return []

    except json.JSONDecodeError:
        # ✅ Handle corrupted file
        return []


def save_history(email, query, result):
    file = get_file_path(email)

    history = load_history(email)

    history.append({
        "query": query,
        "result": result
    })

    try:
        with open(file, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=4, ensure_ascii=False)
    except Exception as e:
        print("Error saving history:", e)