# ---------- FRONTEND BUILD ----------
FROM node:20-alpine as frontend-build

WORKDIR /app/frontend
COPY frontend/ .
RUN npm install
RUN npm run build

# ---------- BACKEND ----------
FROM python:3.10-slim

WORKDIR /app

# copy backend
COPY backend/ ./backend

# install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy frontend build
COPY --from=frontend-build /app/frontend/dist ./backend/static

WORKDIR /app/backend

EXPOSE 8000

CMD ["python", "app.py"]
