#!/bin/bash

# SafeGuard AI - Local Startup Script (Git Bash / WSL)
echo "🚀 Starting SafeGuard AI local services..."

# 1. Start Redis in background (using Docker as a sidecar)
echo "📦 Starting Redis..."
docker compose up -d redis

# 2. Start ML Service
echo "🤖 Starting ML Service..."
(cd ml-service && uv run python main.py) &
ML_PID=$!

# 3. Start Backend
echo "📡 Starting Backend..."
(cd backend && uv run python main.py) &
BACKEND_PID=$!

# 4. Start Celery Worker (Windows - solo pool)
echo "👷 Starting Celery Worker..."
(cd backend && uv run celery -A tasks worker --loglevel=info -P solo) &
WORKER_PID=$!

echo "✅ All services are starting up!"
echo "--------------------------------------------------"
echo "ML Service PID: $ML_PID"
echo "Backend PID:    $BACKEND_PID"
echo "Worker PID:     $WORKER_PID"
echo "--------------------------------------------------"
echo "Use 'kill $ML_PID $BACKEND_PID $WORKER_PID' to stop everything."

# Keep the script alive to monitor (optional) or just exit
wait
