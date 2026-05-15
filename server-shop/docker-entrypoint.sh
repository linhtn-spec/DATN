#!/bin/sh
set -e

# echo "Entrypoint: running demo seeder..."
# node /app/seeders/index.js || true

echo "Entrypoint: starting the application..."
exec "$@"
