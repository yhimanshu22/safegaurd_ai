#!/bin/bash

# SafeGuard AI: Unified Test Runner
# This script runs the full test suite for ML-Service, Backend, and Frontend.

set -e # Exit on any failure

echo "🚀 Starting SafeGuard AI Full Test Suite..."

# 1. ML-Service Tests
echo -e "\n🤖 Running ML-Service Tests..."
cd ml-service
uv run pytest -v tests/test_main.py
cd ..

# 2. Backend Tests
echo -e "\n🔌 Running Backend Tests..."
cd backend
uv run python -m pytest -v tests/test_auth.py
cd ..

# 3. Frontend Tests
echo -e "\n💻 Running Frontend Tests..."
cd frontend
npm test
cd ..

echo -e "\n✅ All tests passed successfully! SafeGuard AI is production-ready."
