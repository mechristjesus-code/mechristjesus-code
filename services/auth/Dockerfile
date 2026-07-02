FROM python:3.11-slim-bullseye

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install shared package first
COPY packages/shared /app/packages/shared
RUN pip install --no-cache-dir ./packages/shared

# Install requirements
COPY services/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy service source
COPY services/auth .

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
