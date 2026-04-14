FROM python:3.11-slim

WORKDIR /app

RUN pip install uv

COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen

COPY backend/ /app/backend/
COPY frontend/src /app/frontend/src

RUN mkdir -p /app/db/tools/kairo-cafe

ENV PYTHONPATH=/app/backend

VOLUME ["/app/db"]

EXPOSE 5003

CMD [".venv/bin/gunicorn", "--bind", "0.0.0.0:5003", "--workers", "2", "backend.run:app"]
