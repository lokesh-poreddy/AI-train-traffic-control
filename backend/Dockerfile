FROM python:3.11-slim

WORKDIR /usr/src/app
COPY backend/requirements.txt /usr/src/app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app /usr/src/app/app

ENV DEMO_MODE=true
ENV PYTHONUNBUFFERED=1

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host","0.0.0.0", "--port","8000"]
