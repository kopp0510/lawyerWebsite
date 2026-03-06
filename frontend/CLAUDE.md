# Frontend — 前端指南

## 技術棧

純 HTML/CSS/JS（無框架），Nginx alpine 靜態託管，監聽 port 8080。

## 檔案結構

```
├── Dockerfile              # nginx:alpine
├── nginx.conf              # 反向代理 /api/ → backend:3000
├── index.html              # 前台首頁（所有區塊）
├── cases.html              # 案例分享獨立頁
├── admin.html              # 後台管理頁（所有 tab）
├── css/
│   ├── style.css           # 前台樣式
│   └── admin.css           # 後台樣式
└── js/
    ├── config.js            # API_BASE 設定（預設空字串，走相對路徑）
    ├── main.js              # 前台邏輯：API 載入內容，失敗 fallback 靜態 HTML
    └── admin.js             # 後台邏輯：所有 tab 的 CRUD 操作
```

## 前台頁面區塊（index.html）

Hero、關於律師、服務項目、案例分享（輪播）、收費標準、律師動態、聯絡律師（含留言表單）、Footer

## 後台 Tab（admin.html）

Hero、關於律師、服務項目、案例分享、收費標準、律師動態、聯絡律師、客戶留言、Footer

## 關鍵模式

### API 呼叫

`admin.js` 中的 `api()` 函數封裝所有 API 請求，自動帶 JWT token：
```js
async function api(url, { method, body } = {})
```

### 內容載入流程

- **前台 `main.js`**：呼叫 `/api/content` 取得所有區塊資料，失敗時保留靜態 HTML 作為 fallback
- **後台 `admin.js`**：`loadAllData()` 初始化載入，各 `fill*()` 函數填入表單，各 `collect*()` 函數收集表單資料

### 圖片處理

所有圖片透過 `/api/images/:id` 讀取，上傳使用 `uploadImage()` 函數，回傳 imageId 存入隱藏欄位。

### 共用函數（admin.js）

| 函數 | 用途 |
|------|------|
| `setImagePreview()` | 設定圖片預覽（依 imageId 或 fallback） |
| `collectSocialLink()` | 收集社群連結資料 |
| `renderBadge()` | 渲染標籤徽章 |
| `renderMessageCard()` | 渲染留言卡片 |
| `reloadCases()` | 重新載入案例列表 |
| `fillDynamicList()` / `collectDynamicList()` | 動態列表填入/收集 |

## 注意事項

- **修改後需重建容器**：`docker compose up -d --build frontend`
- **CSS 優先級**：`admin.css` 中 `.form-group input[type="number"]` 設了 `width: 100%`，行內覆蓋需加 `!important`
- **Tab 切換**：切換到「客戶留言」tab 時會自動呼叫 `loadMessages()` 重新載入
- **API_BASE**：`config.js` 中設為空字串，Nginx 反向代理處理 `/api/` 轉發
