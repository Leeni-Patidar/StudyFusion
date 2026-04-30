# ---------- FRONTEND BUILD ----------
FROM node:20 as frontend-build

WORKDIR /app/frontend
COPY frontend/ .
RUN npm install
RUN npm run build

# ---------- BACKEND ----------
FROM python:3.10

WORKDIR /app

COPY backend/ ./backend

# install python deps
RUN pip install --no-cache-dir fastapi uvicorn

# copy frontend build into backend
COPY --from=frontend-build /app/frontend/dist ./backend/static

WORKDIR /app/backend

EXPOSE 8000

CMD ["python", "app.py"]
