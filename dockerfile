# Stage 1: Node frontend build
FROM node:20.11.0-slim AS web-build
WORKDIR /app/frontend
COPY web/package.json ./
RUN npm install
COPY ./web/public ./public
COPY ./web/src ./src
COPY ./web/tailwind.config.mjs .
COPY ./web/tsconfig.json .
COPY ./web/astro.config.mjs .
RUN npm run build && npm cache clean --force

# Stage 2: Python build
FROM python:3.10-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app
COPY ./api/requirements.txt .

RUN apt-get update && apt-get install -y \
    ffmpeg libsm6 libxext6 nginx \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu \
    && pip3 install -r /app/requirements.txt

COPY --from=web-build /app/frontend/dist /app/static
COPY ./api/main.py .
COPY ./api/api /app/api/
COPY ./api/ml /app/ml
COPY ./api/logger.py /app/logger.py
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 8000

CMD ["sh", "-c", "nginx && uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4"]
