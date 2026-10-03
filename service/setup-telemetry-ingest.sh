#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SERVICE_DIR="$SCRIPT_DIR/telemetry-ingest"
ENV_FILE="$SCRIPT_DIR/../.env"

IMAGE_NAME="telemetry-ingest"
CONTAINER_NAME="telemetry-ingest"

echo "Building telemetry ingest service..."
docker build -t "$IMAGE_NAME" "$SERVICE_DIR"

echo "Removing existing container..."
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

echo "Starting telemetry ingest service..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --env-file "$ENV_FILE" \
  "$IMAGE_NAME"

echo "Telemetry ingest service started."
docker ps --filter "name=$CONTAINER_NAME"