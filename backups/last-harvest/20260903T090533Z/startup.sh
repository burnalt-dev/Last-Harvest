#!/bin/bash
set -e
cd /workspace
pkill -f "vite preview" 2>/dev/null || true
if ! curl -sf -o /dev/null http://127.0.0.1:8080/; then
  npm run dev -- --host 0.0.0.0 --port 8080
else
  echo "preview already on :8080"
fi
