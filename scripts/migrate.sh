#!/usr/bin/env sh
set -eu

COMPOSE="docker compose"
DB_USER="${POSTGRES_USER:-hkm}"
DB_NAME="${POSTGRES_DB:-human_knowledge_map}"

$COMPOSE up -d postgres >/dev/null

echo "Waiting for PostgreSQL..."
until $COMPOSE exec -T postgres pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; do
  sleep 1
done

for file in db/schema.sql db/migrations/*.sql; do
  [ -f "$file" ] || continue
  echo "Applying $file"
  $COMPOSE exec -T postgres psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" < "$file"
done

echo "Database schema is up to date."
