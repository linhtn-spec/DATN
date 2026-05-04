# ⚡ Quick Start Guide - DATN E-Commerce

Hướng dẫn nhanh để khởi chạy project sau khi clone.

---

## 📦 1. Cài đặt Dependencies
Cài đặt thư viện cho cả backend và frontend:
```bash
# Thư mục gốc
npm install

# Backend
cd server-shop && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

---

## 🔑 2. Cấu hình Biến môi trường
Tạo file `.env` cho backend:
```bash
cd server-shop
cp .env.example .env
# Mở .env để chỉnh sửa các key (Cloudinary, Email, VNPAY...) nếu cần.
cd ..
```

---

## 🐳 3. Khởi chạy Database (Docker)
Project yêu cầu MongoDB Replica Set, Redis và Elasticsearch:
```bash
docker compose up -d
```
*Đợi khoảng 30s để database khởi tạo hoàn tất.*

---

## 🚀 4. Seed Data & Chạy App

### Bước 1: Khởi tạo dữ liệu mẫu
```bash
cd server-shop
npm run seed
cd ..
```

### Bước 2: Chạy Backend (Terminal 1)
```bash
cd server-shop
npm run dev
```

### Bước 3: Chạy Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

---

## 🔐 Tài khoản Admin mặc định
Sau khi `npm run seed`:
- **Username**: `admin`
- **Password**: `Admin@123456`
- **Admin Dashboard**: `http://localhost:5173/admin`

---

## 🛠️ Troubleshooting
- **Lỗi Database**: Đảm bảo Docker Desktop đã bật và chạy `docker compose up -d`.
- **Lỗi Port**: Nếu port 5000 hoặc 5173 bị chiếm, dùng `lsof -i :<port>` để kill task cũ.
- **Login lỗi**: Đảm bảo đã chạy `npm run seed`.
