# ⚡ Quick Start Guide - DATN E-Commerce

## 🎯 Status: READY TO RUN ✅

All dependencies installed, all code ready, configuration complete!

---

## 📦 Option 1: Quick Start (Recommended)

### Step 1: Start Database
```bash
# Using Docker (easiest)
cd /home/hieunv1/Documents/DATN
docker-compose up -d mongo-primary mongo-secondary1 mongo-secondary2 mongo-arbiter mongo-setup
sleep 30  # Wait for initialization

# OR using local MongoDB
mongod --replSet rs0
```

### Step 2: Start Backend (Terminal 2)
```bash
cd /home/hieunv1/Documents/DATN/server-shop
npm run dev
# Wait for: "Server is running on port 5000"
```

### Step 3: Start Frontend (Terminal 3)
```bash
cd /home/hieunv1/Documents/DATN/frontend
npm run dev
# Wait for: "Local: http://localhost:5173"
```

### Step 4: Seed Data (Terminal 4) - Optional
```bash
cd /home/hieunv1/Documents/DATN/server-shop
npm run seed
```

---

## 🐳 Option 2: Full Docker Deployment

```bash
cd /home/hieunv1/Documents/DATN
docker-compose up -d --build
```

- Frontend: http://localhost (port 80)
- Backend: http://localhost/api
- Kibana: http://localhost:5601

---

## 🔑 Login Credentials

After seeding database:
```
Username: admin
Password: Admin@123456
```

---

## 🔍 Verify Everything Works

### Frontend
```bash
curl http://localhost:5173
```

### Backend
```bash
curl http://localhost:5000/api/user
# Should return: 401 (need login)
```

### MongoDB
```bash
mongosh --eval "db.adminCommand('ping')"
```

---

## 📝 What's Included

✅ Admin Dashboard  
✅ Customer Interface  
✅ Product Management  
✅ Order Management  
✅ Real-time Chat  
✅ Payment Integration  
✅ User Management  
✅ Statistics & Analytics  

---

## ⚠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 5000 in use | `lsof -i :5000 && kill -9 <PID>` |
| Port 5173 in use | `lsof -i :5173 && kill -9 <PID>` |
| MongoDB error | Start: `mongod --replSet rs0` |
| API 401 errors | Ensure MongoDB is running |

---

## �� Full Documentation

- **Setup Guide**: `PROJECT_READINESS.md`
- **Architecture**: `.github/copilot-instructions.md`
- **Docker Guide**: `DOCKER_DEPLOYMENT_GUIDE.md`
- **Frontend Info**: `FRONTEND_STATUS.md`

---

**That's it! You're ready to go! 🚀**
