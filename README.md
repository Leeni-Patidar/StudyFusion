# NoteMind-AI is a Multi-Agent AI Education System that generates:
📘 Smart Notes
❓  Questions
📝 Summaries
📄 Downloadable DOCX files


It uses Groq API (LLM) with an agent-based architecture.

## Project Structure
- `app.py` – main application entry point  
- `config.py` – configuration settings for APIs  
- `agents/` – contains multi-agent logic and task workflows  
- `llm/` – handles interaction with a language model (e.g., Ollama)  
- `rag/` – retrieval-augmented generation logic  
- `auth/` – authentication logic  
- `database/` – data models and storage logic  
- `tools/` & `utils/` – helpers & utilities
- 
## Tools Used
| Component      | Technology         |
| -------------- | ------------------ |
| Frontend       | Streamlit          |
| Backend        | Python             |
| LLM Runtime    | Groq API           |
| Architecture   | Multi-Agent System |
| Retrieval      | RAG                |
| Authentication | Google OAuth       |
| File Export    | python-docx        |
| Storage        | JSON-based history |

## Requirements
- Python 3.x
- Install dependencies with:
  ```bash
  pip install -r requirements.txt
