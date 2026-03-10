# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init to properly handle signals
RUN apk add --no-cache dumb-init curl

# Copy node modules from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Copy scripts and entrypoint (already included in COPY . ., but ensure perms)
COPY ./scripts ./scripts
COPY ./docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh || true

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Use dumb-init to run our entrypoint which seeds then execs the CMD
ENTRYPOINT ["dumb-init", "--", "sh", "/app/docker-entrypoint.sh"]

# Start the application
CMD ["node", "server.js"]
