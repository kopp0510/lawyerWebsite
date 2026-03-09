const express = require('express');
const prisma = require('../lib/prisma');
const asyncHandler = require('../lib/asyncHandler');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 取得所有案例
router.get('/', asyncHandler(async (req, res) => {
  const cases = await prisma.case.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { image: { select: { id: true, filename: true } } },
  });
  res.json(cases);
}));

// 新增案例
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const { name, category, desc, imageId, sortOrder } = req.body;
  if (!name || !category || !desc) {
    return res.status(400).json({ error: '請提供 name、category、desc' });
  }
  const newCase = await prisma.case.create({
    data: { name, category, desc, imageId: imageId || null, sortOrder: sortOrder ?? null },
  });
  res.status(201).json(newCase);
}));

// 批次更新排序（放在 /:id 前面避免路由衝突）
router.put('/reorder', authMiddleware, asyncHandler(async (req, res) => {
  const { orders } = req.body; // [{ id, sortOrder }]
  await prisma.$transaction(
    orders.map(o => prisma.case.update({ where: { id: o.id }, data: { sortOrder: o.sortOrder } }))
  );
  res.json({ success: true });
}));

// 更新案例
router.put('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { name, category, desc, imageId, sortOrder } = req.body;
  const updated = await prisma.case.update({
    where: { id: parseInt(req.params.id) },
    data: { name, category, desc, imageId: imageId ?? undefined, sortOrder: sortOrder ?? undefined },
  });
  res.json(updated);
}));

// 刪除案例
router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
  await prisma.case.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
}));

module.exports = router;
