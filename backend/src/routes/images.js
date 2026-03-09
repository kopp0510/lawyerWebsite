const express = require('express');
const multer = require('multer');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// 上傳圖片
router.post('/', authMiddleware, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: '請提供圖片檔案' });
  const image = await prisma.image.create({
    data: {
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      data: req.file.buffer,
    },
  });
  res.status(201).json({ id: image.id, filename: image.filename });
}));

// 取得圖片
router.get('/:id', asyncHandler(async (req, res) => {
  const image = await prisma.image.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!image) return res.status(404).json({ error: '找不到圖片' });
  res.set('Content-Type', image.mimeType);
  res.set('Cache-Control', 'public, max-age=31536000');
  res.send(Buffer.from(image.data));
}));

module.exports = router;
