#!/bin/sh
set -e

echo "Entrypoint: running demo seeder..."
node /app/seeder.js || true

echo "Entrypoint: starting the application..."
exec "$@"
