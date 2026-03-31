#!/bin/bash

echo "🚀 Starting SafeGuard AI Services..."

# -------------------------------
# 1. Start Redis (if not running)
# -------------------------------
echo "📦 Checking Redis..."
if ! pgrep -x "redis-server" > /dev/null
then
    echo "🔄 Starting Redis..."
    redis-server &
    sleep 2
else
    echo "✅ Redis already running"
fi

# -------------------------------
# 2. Start ML Service (Port 8001)
# -------------------------------
echo "🤖 Starting ML Service..."
cd ml-service || exit

nohup uv run python main.py > ml.log 2>&1 &
echo "✅ ML Service started on port 8001"

cd ..

# -------------------------------
# 3. Start Backend (Port 8000)
# -------------------------------
echo "🧠 Starting Backend..."
cd backend || exit

nohup uv run python main.py > backend.log 2>&1 &
echo "✅ Backend started on port 8000"

# -------------------------------
# 4. Start Celery Worker
# -------------------------------
echo "⚙️ Starting Celery Worker..."
nohup uv run celery -A tasks worker --loglevel=info -P solo > worker.log 2>&1 &
echo "✅ Celery Worker started"

cd ..

# -------------------------------
# 5. Start Frontend (React)
# -------------------------------
echo "🌐 Starting Frontend..."
cd frontend || exit

nohup npm run dev > frontend.log 2>&1 &
echo "✅ Frontend started"

cd ..

# -------------------------------
# Done
# -------------------------------
echo "🎉 All services started successfully!"
echo "📊 Backend: http://localhost:8000"
echo "🤖 ML Service: http://localhost:8001"
echo "🌐 Frontend: http://localhost:5173 (or shown port)"