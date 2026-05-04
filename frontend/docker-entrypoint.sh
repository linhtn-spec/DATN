#!/bin/sh
# Runtime env injection for Vite SPA in Docker
# Vite bakes env vars at build time. This script replaces the baked-in
# placeholder values in all JS bundles with the real runtime env vars
# provided via docker-compose environment: section.
set -e

DIST_DIR=/usr/share/nginx/html
JS_DIR="$DIST_DIR/assets"

# Default values (same as Dockerfile ARG defaults — must match)
DEFAULT_API_URL="http://localhost/api/"
DEFAULT_SOCKET="http://localhost"
DEFAULT_FRONTEND="http://localhost"

RUNTIME_API_URL="${VITE_API_BASE_URL:-$DEFAULT_API_URL}"
RUNTIME_SOCKET="${VITE_SOCKET_ENDPOINT:-$DEFAULT_SOCKET}"
RUNTIME_FRONTEND="${VITE_FRONTEND_URL:-$DEFAULT_FRONTEND}"

echo "[entrypoint] Injecting runtime environment variables into JS bundles..."
echo "  VITE_API_BASE_URL  = $RUNTIME_API_URL"
echo "  VITE_SOCKET_ENDPOINT = $RUNTIME_SOCKET"
echo "  VITE_FRONTEND_URL  = $RUNTIME_FRONTEND"

# Replace occurrences in all JS files (sed -i works in alpine's busybox)
for JS_FILE in "$JS_DIR"/*.js; do
  [ -f "$JS_FILE" ] || continue
  sed -i \
    -e "s|$DEFAULT_API_URL|$RUNTIME_API_URL|g" \
    -e "s|$DEFAULT_SOCKET|$RUNTIME_SOCKET|g" \
    -e "s|$DEFAULT_FRONTEND|$RUNTIME_FRONTEND|g" \
    "$JS_FILE"
done

echo "[entrypoint] Done. Starting nginx..."
exec nginx -g "daemon off;"
