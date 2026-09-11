#!/usr/bin/env sh
set -eu

IMAGE_NAME="human-knowledge-map"
CONTAINER_NAME="human-knowledge-map"
PORT="${PORT:-3000}"

docker build -t "$IMAGE_NAME" .
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker run -d --name "$CONTAINER_NAME" --restart unless-stopped -p "$PORT:3000" "$IMAGE_NAME"
echo "Human Knowledge Map is running at http://localhost:$PORT"
