#!/usr/bin/env sh
set -eu

ACTION="${1:-up}"
COMPOSE="docker compose"

if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running or current user cannot access it." >&2
  exit 1
fi

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Created .env from .env.example. Review POSTGRES_PASSWORD and DEEPSEEK_API_KEY before production use."
  fi
fi

case "$ACTION" in
  up)
    $COMPOSE up -d --build
    ./scripts/migrate.sh
    echo "Human Knowledge Map: http://localhost:${PORT:-3000}"
    ;;
  down)
    $COMPOSE down
    ;;
  restart)
    $COMPOSE up -d --build
    ./scripts/migrate.sh
    $COMPOSE restart app
    ;;
  logs)
    $COMPOSE logs -f --tail=200 app postgres
    ;;
  status)
    $COMPOSE ps
    ;;
  pull)
    git pull --ff-only
    $COMPOSE up -d --build
    ./scripts/migrate.sh
    ;;
  reset-db)
    echo "This removes the PostgreSQL volume and all persisted knowledge data."
    printf "Type RESET to continue: "
    read answer
    [ "$answer" = "RESET" ] || exit 1
    $COMPOSE down -v
    $COMPOSE up -d --build
    ;;
  *)
    echo "Usage: $0 {up|down|restart|logs|status|pull|reset-db}" >&2
    exit 1
    ;;
esac
