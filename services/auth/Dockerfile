FROM python:3.11-slim

WORKDIR /app

COPY packages/shared /packages/shared
RUN pip install /packages/shared

COPY services/auth/requirements.txt .
RUN pip install -r requirements.txt

COPY services/auth .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
