#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

IMAGE_NAME="mqtt-test"
ENV_FILE="$SCRIPT_DIR/../.env"
APP_DIR="$SCRIPT_DIR/mqtt-test"

echo "Building Docker image..."

docker build \
    -t "$IMAGE_NAME" \
    "$APP_DIR"

echo "Starting MQTT test container..."

docker run -d\
    --rm \
    --env-file "$ENV_FILE" \
    -e GATEWAY_ID="TESTMQTT001" \
    -e PUBLISH_INTERVAL_SEC="10" \
    -e NETWORK_TYPE="WIFI" \
    -e RSSI="-73" \
    --name mqtt-test \
    "$IMAGE_NAME"