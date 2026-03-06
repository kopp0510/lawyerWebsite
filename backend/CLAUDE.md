# Backend — 後端指南

## 技術棧

Node.js 20 + Express + Prisma ORM + PostgreSQL 16

## 檔案結構

```
├── Dockerfile              # node:20-alpine
├── .dockerignore           # 排除 node_modules
├── package.json
├── src/
│   ├── index.js            # Express 入口，掛載路由 + 全站設定 API
│   ├── middleware/
│   │   └── auth.js         # JWT 認證中介層（驗證 Bearer token）
│   └── routes/
│       ├── auth.js         # POST /api/auth/login — 登入，回傳 JWT（7天有效）
│       ├── content.js      # GET/PUT /api/content/:section — 區塊內容 CRUD
│       ├── cases.js        # GET/POST/PUT/DELETE /api/cases — 案例 CRUD
│       ├── images.js       # POST /api/images, GET /api/images/:id — 圖片上傳/讀取（multer）
│       └── contact.js      # /api/contact — 客戶留言（公開送出 + 認證管理）
└── prisma/
    ├── schema.prisma       # DB Schema（6 個 model）
    ├── seed.js             # 初始資料匯入（管理員帳號 + 預設內容）
    └── migrations/         # Prisma 遷移檔
```

## DB Models

| Model | 用途 | 關鍵欄位 |
|-------|------|----------|
| `User` | 管理員帳號 | email (unique), password (bcrypt) |
| `SectionContent` | 區塊內容 | section (unique), content (JSON) |
| `Case` | 案例分享 | name, category, desc, imageId, sortOrder |
| `Image` | 圖片存儲 | filename, mimeType, data (Bytes/bytea) |
| `SiteSettings` | 全站設定 | carouselDisplayCount (default 9) |
| `Message` | 客戶留言 | name, email, phone, message, ip, isRead, isBlocked |

## API 路由

| 路由 | 認證 | 說明 |
|------|------|------|
| `POST /api/auth/login` | 否 | 登入，回傳 JWT |
| `GET /api/content` | 否 | 取得所有區塊內容 |
| `GET /api/content/:section` | 否 | 取得特定區塊內容 |
| `PUT /api/content/:section` | 是 | 更新區塊內容 |
| `GET /api/cases` | 否 | 取得所有案例 |
| `POST /api/cases` | 是 | 新增案例 |
| `PUT /api/cases/:id` | 是 | 更新案例 |
| `DELETE /api/cases/:id` | 是 | 刪除案例 |
| `POST /api/images` | 是 | 上傳圖片（multer, 5MB 限制） |
| `GET /api/images/:id` | 否 | 讀取圖片（設定快取 7 天） |
| `POST /api/contact` | 否 | 送出留言（IP 速率限制：10 分鐘 3 則） |
| `GET /api/contact` | 是 | 列出所有留言 |
| `PUT /api/contact/:id/read` | 是 | 標記留言已讀 |
| `DELETE /api/contact/:id` | 是 | 刪除留言 |
| `GET/PUT /api/settings` | GET 否 / PUT 是 | 全站設定 |
| `GET /api/health` | 否 | 健康檢查 |

## 關鍵模式

### 圖片存儲

圖片以 bytea 存入 Image table，不使用檔案系統。上傳透過 multer 處理，讀取時設定 `Cache-Control: public, max-age=604800`。

### 認證

JWT token，7 天有效期。`middleware/auth.js` 驗證 `Authorization: Bearer <token>`。

### 速率限制（contact.js）

使用 in-memory Map 記錄 IP 請求時間戳，同一 IP 每 10 分鐘最多 3 則留言。

### 錯誤處理（contact.js）

`asyncHandler()` 包裝所有路由，統一 catch 錯誤並回傳 500。

## 開發指令

```bash
# 重建後端容器
docker compose up -d --build backend

# 查看日誌
docker compose logs -f backend

# 執行 Prisma 遷移
docker compose exec backend npx prisma migrate dev --name <name>

# 重置資料庫
docker compose exec backend npx prisma migrate reset
```

## 環境變數

| 變數 | 說明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 連線字串 |
| `JWT_SECRET` | JWT 簽名密鑰 |
| `PORT` | 伺服器埠號（預設 3000） |

## 預設帳號

`admin@example.com` / `changeme123`（由 seed.js 建立）
