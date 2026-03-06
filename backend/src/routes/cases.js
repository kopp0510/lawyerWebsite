const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// 取得所有案例
router.get('/', async (req, res) => {
  try {
    const cases = await prisma.case.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: { image: { select: { id: true, filename: true } } },
    });
    res.json(cases);
  } catch (err) {
    console.error('GET /cases error:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 新增案例
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, desc, imageId, sortOrder } = req.body;
    if (!name || !category || !desc) {
      return res.status(400).json({ error: '請提供 name、category、desc' });
    }
    const newCase = await prisma.case.create({
      data: { name, category, desc, imageId: imageId || null, sortOrder: sortOrder ?? null },
    });
    res.status(201).json(newCase);
  } catch (err) {
    console.error('POST /cases error:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 批次更新排序（放在 /:id 前面避免路由衝突）
router.put('/reorder', authMiddleware, async (req, res) => {
  try {
    const { orders } = req.body; // [{ id, sortOrder }]
    await prisma.$transaction(
      orders.map(o => prisma.case.update({ where: { id: o.id }, data: { sortOrder: o.sortOrder } }))
    );
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /cases/reorder error:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 更新案例
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, category, desc, imageId, sortOrder } = req.body;
    const updated = await prisma.case.update({
      where: { id: parseInt(req.params.id) },
      data: { name, category, desc, imageId: imageId ?? undefined, sortOrder: sortOrder ?? undefined },
    });
    res.json(updated);
  } catch (err) {
    console.error('PUT /cases/:id error:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

// 刪除案例
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.case.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /cases/:id error:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
