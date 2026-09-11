#!/usr/bin/env sh
set -eu

IMAGE_NAME="${IMAGE_NAME:-human-knowledge-map}"
CONTAINER_NAME="${CONTAINER_NAME:-human-knowledge-map-memory}"
PORT="${PORT:-3000}"

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running or current user cannot access it." >&2
  exit 1
fi

docker build -t "$IMAGE_NAME" .
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -e GRAPH_STORE=memory \
  -e DEEPSEEK_API_KEY="${DEEPSEEK_API_KEY:-}" \
  -e DEEPSEEK_BASE_URL="${DEEPSEEK_BASE_URL:-https://api.deepseek.com/chat/completions}" \
  -e DEEPSEEK_MODEL="${DEEPSEEK_MODEL:-deepseek-chat}" \
  -p "$PORT:3000" \
  "$IMAGE_NAME"

echo "Human Knowledge Map (memory mode) is running at http://localhost:$PORT"
