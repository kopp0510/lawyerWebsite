const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// 取得所有 section 內容
router.get('/', async (req, res) => {
  const sections = await prisma.sectionContent.findMany();
  const result = {};
  sections.forEach(s => { result[s.section] = s.content; });
  res.json(result);
});

// 取得某 section 內容
router.get('/:section', async (req, res) => {
  const section = await prisma.sectionContent.findUnique({ where: { section: req.params.section } });
  if (!section) return res.status(404).json({ error: '找不到該 section' });
  res.json(section.content);
});

// 更新某 section 內容
router.put('/:section', authMiddleware, async (req, res) => {
  const section = await prisma.sectionContent.upsert({
    where: { section: req.params.section },
    update: { content: req.body },
    create: { section: req.params.section, content: req.body },
  });
  res.json(section.content);
});

module.exports = router;
