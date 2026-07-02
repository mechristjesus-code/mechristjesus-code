FROM python:3.11-slim-bullseye
WORKDIR /app
COPY packages/shared /app/packages/shared
RUN pip install --no-cache-dir ./packages/shared
COPY services/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY services/projects .
EXPOSE 8006
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8006"]
