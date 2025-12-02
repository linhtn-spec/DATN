# 🐳 Docker Deployment Guide - DATN E-Commerce

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Local Docker Deployment](#local-docker-deployment)
5. [Production Docker Deployment](#production-docker-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Backup & Recovery](#backup--recovery)

---

## System Requirements

### Hardware

- **Minimum**: 4GB RAM, 2 CPU cores, 20GB disk
- **Recommended**: 8GB RAM, 4 CPU cores, 50GB disk

### Software

- Docker 20.10+
- Docker Compose 2.0+
- Git

### Ports Required

- 80 (Frontend - Nginx)
- 443 (Frontend - HTTPS, if configured)
- 5000 (Backend API)
- 9200 (Elasticsearch)
- 27017 (MongoDB Primary)
- 27018 (MongoDB Secondary 1)
- 27019 (MongoDB Secondary 2)
- 27020 (MongoDB Arbiter)
- 5601 (Kibana)

---

## Pre-Deployment Checklist

- [ ] Docker installed and running
- [ ] Docker Compose v2+ installed
- [ ] Ports 80, 443, 5000 available
- [ ] 20GB free disk space
- [ ] Git repository cloned
- [ ] `.env` file created with secrets
- [ ] SSL certificates ready (for HTTPS)

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/Cr4zY9uy/DATN.git
cd DATN/server-shop
```

### 2. Create .env File

For **development**:

```bash
cp .env.example .env
# Edit with local values
nano .env
```

For **production**, create `.env.production`:

```bash
cat > .env.production << 'EOF'
# ========================================
# PRODUCTION ENVIRONMENT VARIABLES
# ========================================

NODE_ENV=production
SERVER_PORT=5000

# Frontend URLs
FRONTEND_URL=https://your-domain.com
VITE_API_BASE_URL=https://your-domain.com/api/
VITE_SOCKET_ENDPOINT=https://your-domain.com
VITE_FRONTEND_URL=https://your-domain.com

# Database
URL_DB=mongodb://mongo-primary:27017,mongo-secondary1:27017,mongo-secondary2:27017/?replicaSet=rs0

# JWT Secrets - MUST CHANGE THESE!
ACCESS_TOKEN_SECRET=generate-random-string-min-32-chars
ACCESS_TOKEN_LIFE=24h
REFRESH_TOKEN_SECRET=generate-random-string-min-32-chars
REFRESH_TOKEN_LIFE=7d
SESSION_SECRET=generate-random-string-min-32-chars

# CORS whitelist
WHITE_URL_1=https://your-domain.com
WHITE_URL_2=https://your-domain.com

# Elasticsearch
ELASTICSEARCH_HOST=http://es-container:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-elasticsearch-password

# Email (Gmail App Password required)
NODEMAILER_HOST=smtp.gmail.com
NODEMAILER_PORT=465
NODEMAILER_EMAIL=your-email@gmail.com
NODEMAILER_PASSWORD=your-app-specific-password

# Cloudinary
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_APIKEY=your-api-key
CLOUDINARY_APISECRET=your-api-secret

# Optional: Payment Gateways
VNPAY_TMNCODE=your-merchant-code
VNPAY_HASH_SECRET=your-hash-secret
PAYPAL_MODE=production
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Optional: Google OAuth
CLIENT_ID=your-google-oauth-client-id
CLIENT_SECRET=your-google-oauth-client-secret
EOF
```

### 3. Generate Secure Secrets

```bash
# Generate a random 32-character string
openssl rand -base64 32

# Or use Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Update `.env.production` with generated values.

---

## Local Docker Deployment

### Quick Start (All Services)

```bash
# From server-shop directory
docker-compose up -d --build

# Wait for services to be healthy (2-3 minutes)
docker-compose ps

# Check logs
docker-compose logs -f backend

# Access
# Frontend: http://localhost
# Backend: http://localhost/api
# Kibana: http://localhost:5601
```

### Start Individual Services

```bash
# MongoDB only
docker-compose up -d mongo-primary mongo-secondary1 mongo-secondary2 mongo-arbiter mongo-setup

# Wait for mongo-setup to complete
docker-compose logs mongo-setup

# Elasticsearch + Kibana
docker-compose up -d elasticsearch kibana

# Monstache (MongoDB → Elasticsearch sync)
docker-compose up -d monstache

# Backend
docker-compose up -d backend

# Frontend (build takes ~2-3 min)
docker-compose up -d frontend
```

### Stop Services

```bash
# Stop all services (data persists)
docker-compose stop

# Stop specific service
docker-compose stop backend

# Remove all containers (keep volumes)
docker-compose down

# Remove everything (volumes, networks, containers)
docker-compose down -v
```

---

## Production Docker Deployment

### 1. Build Images

```bash
# Build backend
cd /path/to/DATN/server-shop
docker build -t your-registry/datn-backend:1.0.0 .

# Build frontend (from frontend directory)
cd /path/to/DATN/frontend
docker build -t your-registry/datn-frontend:1.0.0 .

# Push to registry
docker push your-registry/datn-backend:1.0.0
docker push your-registry/datn-frontend:1.0.0
```

### 2. Production Compose File

Update `docker-compose.yml` for production:

```yaml
services:
  backend:
    image: your-registry/datn-backend:1.0.0
    restart: always
    environment:
      NODE_ENV: production
    env_file: .env.production
    healthcheck:
      retries: 5
      start_period: 60s # Increased for production

  frontend:
    image: your-registry/datn-frontend:1.0.0
    restart: always
    env_file: .env.production
```

### 3. Deploy

```bash
# Pull latest images
docker-compose pull

# Start stack
docker-compose up -d

# Monitor startup
watch docker-compose ps
```

### 4. SSL/HTTPS Setup (Nginx)

Update `nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/certs/your-domain.com.crt;
    ssl_certificate_key /etc/nginx/certs/your-domain.com.key;

    # SSL best practices
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring & Maintenance

### Check Service Health

```bash
# All services
docker-compose ps

# Backend logs
docker-compose logs -f backend

# Frontend logs (if using nginx)
docker logs frontend-app

# MongoDB status
docker exec mongo-primary mongosh --eval "rs.status()"

# Elasticsearch status
curl http://localhost:9200/_cluster/health

# Kibana (browser)
# http://localhost:5601
```

### Resource Monitoring

```bash
# Monitor Docker resource usage
docker stats

# Monitor specific container
docker stats backend-app

# Container detailed info
docker inspect backend-app

# Check container size
docker ps --size
```

### Database Maintenance

```bash
# MongoDB backup
docker exec mongo-primary mongodump --out /backup

# Copy backup to host
docker cp mongo-primary:/backup ./backup

# MongoDB restore
docker cp ./backup mongo-primary:/
docker exec mongo-primary mongorestore /backup

# Elasticsearch backup
curl -X PUT "localhost:9200/_snapshot/backup" \
  -H 'Content-Type: application/json' \
  -d '{"type": "fs", "settings": {"location": "/backup"}}'

# List Elasticsearch indices
curl "localhost:9200/_cat/indices?v"
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused containers
docker container prune

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Remove everything
docker system prune -a
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Inspect container
docker inspect backend-app | grep -A 20 "Health"

# Try to rebuild
docker-compose up -d --build backend
```

### Database Connection Issues

```bash
# Check MongoDB status
docker exec mongo-primary mongosh --eval "db.adminCommand('ping')"

# Check MongoDB replSet
docker exec mongo-primary mongosh --eval "rs.status()"

# Reinitialize replSet if needed
docker exec mongo-primary mongosh --eval "rs.initiate()"
```

### Port Already in Use

```bash
# Find process using port
lsof -i :80
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change docker-compose ports
# Edit docker-compose.yml:
# ports:
#   - "8080:80"  # Instead of 80:80
```

### Elasticsearch Issues

```bash
# Check Elasticsearch health
curl http://localhost:9200/_cluster/health?pretty

# Check indices
curl http://localhost:9200/_cat/indices?v

# Delete problematic index
curl -X DELETE http://localhost:9200/products
```

### Memory/Disk Issues

```bash
# Check disk usage
df -h

# Check container logs for OOM
docker inspect backend-app | grep -i oom

# Prune unused Docker data
docker system prune -a

# Check volume sizes
docker volume ls
docker volume inspect <volume-name>
```

---

## Backup & Recovery

### Automated Backup Strategy

Create `backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/datn"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$DATE"

mkdir -p "$BACKUP_PATH"

# MongoDB backup
echo "Backing up MongoDB..."
docker exec mongo-primary mongodump --out "$BACKUP_PATH/mongo"

# Elasticsearch backup
echo "Backing up Elasticsearch..."
curl -X PUT "http://localhost:9200/_snapshot/backup/$DATE" \
  -H 'Content-Type: application/json' \
  -d "{\"type\": \"fs\", \"settings\": {\"location\": \"$BACKUP_PATH/elasticsearch\"}}"

# Compress backup
tar -czf "$BACKUP_PATH.tar.gz" "$BACKUP_PATH"

# Keep only last 7 backups
find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_PATH.tar.gz"
```

### Schedule Daily Backups

```bash
# Add to crontab
0 2 * * * /path/to/backup.sh >> /var/log/datn-backup.log 2>&1
```

### Restore from Backup

```bash
# Extract backup
tar -xzf backup_20231201_020000.tar.gz

# Restore MongoDB
docker cp ./backup_data/mongo mongo-primary:/
docker exec mongo-primary mongorestore /mongo

# Restore Elasticsearch
docker cp ./backup_data/elasticsearch mongo-primary:/
```

---

## Docker Compose Useful Commands

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend

# Start services in background
docker-compose up -d

# View logs
docker-compose logs
docker-compose logs -f backend  # Follow
docker-compose logs --tail=100 backend  # Last 100 lines

# Execute command in container
docker-compose exec backend npm run seed

# Stop services
docker-compose stop
docker-compose pause

# Resume paused services
docker-compose unpause

# Restart services
docker-compose restart backend

# Remove stopped containers
docker-compose rm

# List images
docker-compose images

# Pull latest images
docker-compose pull

# Validate compose file
docker-compose config

# Get service status
docker-compose ps
docker-compose top backend
```

---

## Performance Tuning

### Docker Limits

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
        reservations:
          cpus: "1"
          memory: 1G

  frontend:
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 512M
```

### MongoDB Optimization

```bash
# Create indexes
docker exec mongo-primary mongosh --eval "
  db.products.createIndex({ name: 'text' });
  db.orders.createIndex({ createdAt: -1 });
"

# Monitor slow queries
docker exec mongo-primary mongosh --eval "
  db.setProfilingLevel(1, { slowms: 100 })
"
```

### Elasticsearch Tuning

```bash
# Adjust heap size in docker-compose.yml
environment:
  - "ES_JAVA_OPTS=-Xms512m -Xmx1g"
```

---

## Security Best Practices

- ✅ Use `.env.production` with strong secrets (min 32 chars)
- ✅ Enable SSL/HTTPS for production
- ✅ Use environment-specific images/tags
- ✅ Don't commit `.env` files to git
- ✅ Rotate JWT secrets regularly
- ✅ Use strong MongoDB credentials
- ✅ Enable firewall rules
- ✅ Regular security updates
- ✅ Monitor access logs
- ✅ Use private Docker registry

---

## Useful Docker Commands

```bash
# View image layers
docker history datn-backend:1.0.0

# Copy files in/out of container
docker cp backend-app:/app/logs ./logs
docker cp ./config backend-app:/app/

# Inspect network
docker network inspect server-shop_shop-server

# Check port bindings
docker port backend-app

# Update container env variables
docker exec -e VAR=value backend-app node app.js

# Check running processes
docker top backend-app
```

---

## FAQ

**Q: How often should I backup?**  
A: Daily for production, weekly for development

**Q: Can I scale services?**  
A: Yes, add more backend containers behind a load balancer

**Q: How to update just the backend?**  
A: `docker-compose stop backend && docker-compose rm backend && docker-compose up -d backend`

**Q: What's the recommended uptime?**  
A: 99.9% with proper monitoring and auto-restart enabled

**Q: How much storage do I need?**  
A: ~50GB initial, +10GB per month depending on usage

---

## Support & Documentation

- Docker Docs: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose
- MongoDB Ops: https://docs.mongodb.com/manual/administration
- Nginx Docs: https://nginx.org/en/docs

---

**Last Updated**: December 2025  
**Production Ready**: ✅ Yes  
**Tested with**: Docker 24.0.0, Docker Compose 2.20.0
