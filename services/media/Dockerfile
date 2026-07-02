FROM python:3.11-slim-bullseye
WORKDIR /app
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
COPY packages/shared /app/packages/shared
RUN pip install --no-cache-dir ./packages/shared
COPY services/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY services/media .
EXPOSE 8005
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]
