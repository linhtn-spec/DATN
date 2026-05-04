# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build with a placeholder so we can substitute at runtime
# VITE_API_BASE_URL is baked at build time - we use a known placeholder
# that the entrypoint.sh will replace with the real runtime value.
ARG VITE_API_BASE_URL=http://localhost/api/
ARG VITE_SOCKET_ENDPOINT=http://localhost
ARG VITE_FRONTEND_URL=http://localhost

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_ENDPOINT=$VITE_SOCKET_ENDPOINT
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

RUN npm run build

# Runtime stage - using Nginx to serve the built app
FROM nginx:alpine

# Install envsubst (part of gettext)
RUN apk add --no-cache gettext

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy runtime entrypoint that injects env variables into built JS
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

# Run entrypoint first (injects env), then nginx
CMD ["/docker-entrypoint.sh"]
