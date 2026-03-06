const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// 速率限制：同一 IP 每 10 分鐘最多 3 則留言
const rateMap = new Map();
const RATE_WINDOW = 10 * 60 * 1000;
const RATE_LIMIT = 3;

function checkRateLimit(ip) {
  const now = Date.now();
  const valid = (rateMap.get(ip) || []).filter(t => now - t < RATE_WINDOW);
  rateMap.set(ip, valid);
  if (valid.length >= RATE_LIMIT) return false;
  valid.push(now);
  return true;
}

// 共用錯誤處理包裝
function asyncHandler(fn) {
  return (req, res) => fn(req, res).catch(err => {
    console.error(`${req.method} ${req.originalUrl} error:`, err);
    res.status(500).json({ error: '伺服器錯誤' });
  });
}

// 取得請求的客戶端 IP
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return forwarded ? forwarded.split(',')[0].trim() : req.ip || '';
}

// POST /api/contact — 公開，接收留言
router.post('/', asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: '請填寫姓名、Email 和留言內容' });
  }
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: '留言過於頻繁，請稍後再試' });
  }
  const msg = await prisma.message.create({
    data: { name, email, phone: phone || '', message, ip },
  });
  res.status(201).json({ success: true, id: msg.id });
}));

// GET /api/contact — 需認證，列出所有留言
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const messages = await prisma.message.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(messages);
}));

// PUT /api/contact/:id/read — 需認證，標記已讀
router.put('/:id/read', authMiddleware, asyncHandler(async (req, res) => {
  const msg = await prisma.message.update({
    where: { id: parseInt(req.params.id) },
    data: { isRead: true },
  });
  res.json(msg);
}));

// DELETE /api/contact/:id — 需認證，刪除留言
router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
  await prisma.message.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
}));

module.exports = router;
