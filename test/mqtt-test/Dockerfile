FROM python:3.12-slim

WORKDIR /app

ARG GATEWAY_ID
ARG PUBLISH_INTERVAL_SEC=900

ENV GATEWAY_ID=${GATEWAY_ID}
ENV PUBLISH_INTERVAL_SEC=${PUBLISH_INTERVAL_SEC}

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["python", "-u", "main.py"]