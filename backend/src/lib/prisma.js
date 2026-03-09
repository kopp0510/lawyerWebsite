const { PrismaClient } = require('@prisma/client');

// 全域共用單一 PrismaClient 實例，避免每個路由各自建立連線
const prisma = new PrismaClient();

module.exports = prisma;
