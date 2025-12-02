#!/bin/sh
set -e

echo "Entrypoint: running bootstrap seeder if present..."
if [ -f "/app/scripts/bootstrap-seed.js" ]; then
  # run bootstrap; do not fail the container if seeding errors
  node /app/scripts/bootstrap-seed.js || true
else
  echo "Entrypoint: no bootstrap script found, skipping."
fi

echo "Entrypoint: starting the application..."
exec "$@"
