<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎡 Pro Lucky Draw

Phần mềm quay số may mắn chuyên nghiệp dành cho sự kiện. Giao diện LED hoành tráng, hỗ trợ nhiều giải thưởng, lưu trữ dữ liệu người dùng trên server riêng (VPS) qua MySQL hoặc SQLite.

## ✨ Tính năng nổi bật

- 🎰 Hiệu ứng quay số 60FPS mượt mà, hỗ trợ màn hình LED lớn
- 🏆 Quản lý nhiều giải thưởng, nhiều người tham gia
- 🔐 Hệ thống tài khoản (đăng ký cần email + số điện thoại)
- 💾 Lưu trữ dữ liệu sự kiện: hỗ trợ MySQL (VPS) hoặc SQLite (local)
- 🎵 Âm thanh nền & âm thanh trúng thưởng tùy chỉnh
- 🖼️ Tùy chỉnh ảnh nền, video nền, logo sự kiện
- 📊 Xuất danh sách người trúng thưởng ra Excel
- 📱 Responsive, hỗ trợ đa nền tảng

## 🛠️ Yêu cầu hệ thống

- Node.js >= 18
- (Tùy chọn) MySQL >= 8 nếu muốn dùng database server

## ⚙️ Cài đặt & Chạy local

```bash
# 1. Cài thư viện
npm install

# 2. Tạo file .env từ mẫu
cp .env.example .env

# 3. Chạy ở chế độ dev (tự động dùng SQLite nếu không có DB_NAME trong .env)
npm run dev
```

> Mặc định ứng dụng chạy tại `http://localhost:3000`

## 🌐 Deploy lên VPS (Production)

### Yêu cầu: [vps-manager](https://github.com/leluongnghia/vps)

Dùng công cụ `vps-manager` để tự động thiết lập subdomain + Nginx Proxy + MySQL:

```bash
# 1. Chạy vps-manager trên VPS (quyền root)
vps

# 2. Vào: Quản lý Website → Thêm Tên miền mới → Chọn "3. Node.js Proxy"
# 3. Nhập subdomain & Port (mặc định 3000)
# → Script tự động tạo: Nginx config, MySQL DB, file .env
```

```bash
# Upload code lên VPS rồi vào thư mục:
cd /var/www/[subdomain]/public_html

# Clone code từ Github
git remote add origin https://github.com/leluongnghia/Pro-Lucky-Draw.git
git fetch origin
git reset --hard origin/main

# Cài thư viện & Build frontend
npm install
npm run build

# Chạy ngầm bằng PM2
NODE_ENV=production pm2 start npx --name "luckydraw" -- tsx server.ts
pm2 save
pm2 startup
```

## 🔑 Biến môi trường (`.env`)

| Biến | Mô tả | Mặc định |
|---|---|---|
| `PORT` | Cổng Express | `3000` |
| `JWT_SECRET` | Chuỗi bí mật JWT | (tự sinh) |
| `DB_HOST` | Host MySQL | `127.0.0.1` |
| `DB_NAME` | Tên database MySQL | (bỏ trống = dùng SQLite) |
| `DB_USER` | User MySQL | - |
| `DB_PASSWORD` | Mật khẩu MySQL | - |

## 📁 Cấu trúc dự án

```
pro-lucky-draw/
├── server.ts          # Backend Express API (auth, data, file upload)
├── src/
│   ├── App.tsx        # Root component
│   ├── components/
│   │   ├── LandingPage.tsx    # Trang chủ + form đăng nhập/đăng ký
│   │   ├── DrawScreen.tsx     # Màn hình quay số chính
│   │   ├── SettingsPanel.tsx  # Cài đặt sự kiện
│   │   └── LEDWrapper.tsx     # Wrapper LED display
│   └── types.ts       # TypeScript interfaces
├── dist/              # Frontend đã build (tự sinh bởi npm run build)
└── uploads/           # File ảnh/video upload
```

## 📜 License

MIT © [leluongnghia](https://github.com/leluongnghia)
