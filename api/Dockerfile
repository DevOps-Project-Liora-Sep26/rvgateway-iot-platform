# ============================================================
# File:         Dockerfile
# Author:       Sebastian Röwer

# Description:  Docker deployment configuration for the 
#               FastAPI backend service.
# Created At:   08.10.2026
# ============================================================

FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install gcc libmariadb-dev -y 
COPY requirements.txt requirements.txt
RUN pip install  --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]