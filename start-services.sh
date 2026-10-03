#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "======================================"
echo "Starting RV Gateway backend services"
echo "======================================"

# --------------------------------------------------
# Telemetry Simulation Service
# --------------------------------------------------

echo ""
echo "Starting telemetry simulation service..."
"$SCRIPT_DIR/test/setup-mqtt-test.sh"

# --------------------------------------------------
# Telemetry Ingest Service
# --------------------------------------------------

echo ""
echo "Starting telemetry ingest service..."
"$SCRIPT_DIR/service/setup-telemetry-ingest.sh"

# --------------------------------------------------
# API Service
# --------------------------------------------------

echo ""
echo "Starting API service..."

cd "$SCRIPT_DIR/api"

"$SCRIPT_DIR/api/.venv/bin/uvicorn" main:app --reload &
API_PID=$!

# --------------------------------------------------
# Next.js Development Server
# --------------------------------------------------

echo ""
echo "Starting Next.js development server..."

cd "$SCRIPT_DIR/frontend"

npm run dev &
FRONTEND_PID=$!

# --------------------------------------------------
# Cleanup
# --------------------------------------------------

cleanup() {
    echo ""
    echo "Stopping development services..."

    kill "$API_PID" "$FRONTEND_PID" 2>/dev/null || true

    echo "Development services stopped."
}

trap cleanup EXIT INT TERM

# --------------------------------------------------
# Wait for development services
# --------------------------------------------------

wait $API_PID $FRONTEND_PID