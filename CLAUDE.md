# 律師事務所網站 — 專案指南

## 專案概述

劉鈞豪律師事務所官方網站，前後端分離架構，含後台 CMS 管理系統。

## 技術棧

- **前端**：純 HTML/CSS/JS（無框架）、Nginx 靜態託管 + 反向代理
- **後端**：Node.js 20 + Express + Prisma ORM
- **資料庫**：PostgreSQL 16
- **容器化**：Docker Compose
- **部署**：Zeabur

## 專案結構

```
├── docker-compose.yml          # 服務編排（postgres, backend, frontend）
├── .env / .env.example         # 環境變數
├── frontend/
│   ├── Dockerfile              # nginx:alpine, 監聽 8080
│   ├── nginx.conf              # 反向代理 /api/ → backend:3000
│   ├── index.html              # 前台首頁
│   ├── cases.html              # 案例分享頁
│   ├── admin.html              # 後台管理頁
│   ├── css/
│   │   ├── style.css           # 前台樣式
│   │   └── admin.css           # 後台樣式
│   └── js/
│       ├── main.js             # 前台邏輯（API 載入，失敗 fallback 靜態 HTML）
│       ├── admin.js            # 後台邏輯（所有 tab 的 CRUD）
│       └── config.js           # API base URL 設定
├── backend/
│   ├── Dockerfile              # node:20-alpine
│   ├── src/
│   │   ├── index.js            # Express 入口，掛載路由 + 全站設定 API
│   │   ├── middleware/auth.js  # JWT 認證中介層
│   │   └── routes/
│   │       ├── auth.js         # 登入/登出
│   │       ├── content.js      # 區塊內容 CRUD
│   │       ├── cases.js        # 案例 CRUD
│   │       └── images.js       # 圖片上傳/讀取
│   └── prisma/
│       ├── schema.prisma       # DB Schema
│       ├── seed.js             # 初始資料匯入
│       └── migrations/         # Prisma 遷移檔
```

## DB Models

| Model | 用途 |
|-------|------|
| `User` | 管理員帳號（email + bcrypt 密碼） |
| `SectionContent` | 各區塊內容（JSON 格式，section 為 unique key） |
| `Case` | 案例分享（名稱、分類、描述、圖片關聯、排序） |
| `Image` | 圖片存儲（bytea，存入 DB 而非檔案系統） |
| `SiteSettings` | 全站設定（如輪播顯示數量） |

## API 路由

| 前綴 | 說明 |
|------|------|
| `POST /api/auth/login` | 登入，回傳 JWT（7天有效） |
| `GET/PUT /api/content/:section` | 區塊內容讀取/更新 |
| `GET/POST/PUT/DELETE /api/cases` | 案例 CRUD |
| `POST /api/images` | 圖片上傳（multer） |
| `GET /api/images/:id` | 圖片讀取 |
| `GET/PUT /api/settings` | 全站設定 |
| `GET /api/health` | 健康檢查 |

## 開發指令

```bash
# 啟動所有服務
docker compose up -d

# 重建特定容器（前端 HTML/CSS/JS 修改後需要）
docker compose up -d --build frontend

# 重建後端（程式碼或 schema 修改後）
docker compose up -d --build backend

# 查看日誌
docker compose logs -f backend

# 執行 Prisma 遷移
docker compose exec backend npx prisma migrate dev --name <name>
```

## 重要注意事項

- **前端修改需重建容器**：前端是 Nginx 靜態檔案，修改 HTML/CSS/JS 後必須 `docker compose up -d --build frontend` 才會生效
- **圖片存 DB**：所有圖片（hero、about、案例等）以 bytea 存入 Image table，透過 `/api/images/:id` 讀取，不使用檔案系統路徑
- **CSS 優先級**：`admin.css` 中 `.form-group input[type="number"]` 設了 `width: 100%`，行內覆蓋需加 `!important`
- **環境變數**：根目錄 `.env` 給 Docker Compose 用；`backend/.env` 給本地非 Docker 開發用
- **預設帳號**：`admin@example.com` / `changeme123`（由 seed.js 建立）

## 分支策略

- `main`：穩定版本，用於 PR 目標
- `dev`：開發分支，後台管理系統開發中

## Commit 風格

使用中文描述，格式：`功能區域：簡述變更內容`

範例：
- `後台案例分享：輪播數量旁顯示案例總數`
- `修復 Zeabur 部署圖片 404：將 hero/about/news 圖片存入 DB`
