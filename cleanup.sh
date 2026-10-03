#!/bin/bash

set -e

echo "======================================"
echo "Cleaning up RV Gateway services"
echo "======================================"

# Remove containers
echo ""
echo "Removing containers..."
docker rm -f mqtt-test 2>/dev/null || true
docker rm -f telemetry-ingest 2>/dev/null || true

# Remove images
echo ""
echo "Removing images..."
docker image rm -f mqtt-test 2>/dev/null || true
docker image rm -f telemetry-ingest 2>/dev/null || true

echo ""
echo "Cleanup complete."