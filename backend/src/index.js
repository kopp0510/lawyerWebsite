const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const casesRoutes = require('./routes/cases');
const imagesRoutes = require('./routes/images');
const authMiddleware = require('./middleware/auth');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/cases', casesRoutes);
app.use('/api/images', imagesRoutes);

// 全站設定
app.get('/api/settings', async (req, res) => {
  let settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) settings = await prisma.siteSettings.create({ data: {} });
  res.json(settings);
});

app.put('/api/settings', authMiddleware, async (req, res) => {
  const { carouselDisplayCount } = req.body;
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { carouselDisplayCount },
    create: { carouselDisplayCount },
  });
  res.json(settings);
});

// 健康檢查
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
