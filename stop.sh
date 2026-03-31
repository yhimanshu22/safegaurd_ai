#!/bin/bash

# SafeGuard AI - Stop Script
echo "🛑 Stopping SafeGuard AI Services..."

# 1. Stop Docker containers
docker compose stop

# 2. Kill any lingering frontend processes
pkill -f "vite" || true

echo "✅ All services stopped."
