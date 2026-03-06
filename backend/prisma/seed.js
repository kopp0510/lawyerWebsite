const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  // 建立管理員帳號
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'changeme123';
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { password: hashed },
    create: { email, password: hashed },
  });
  console.log(`管理員帳號已建立: ${email}`);

  // 建立全站設定
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { carouselDisplayCount: 9 },
  });

  // 圖片基底路徑
  const scrapedBase = fs.existsSync('/app/frontend/scraped')
    ? '/app/frontend/scraped'
    : path.join(__dirname, '../../frontend/scraped');

  // Hero section — 匯入背景圖
  let heroBgImageId = null;
  const heroBgPath = path.join(scrapedBase, '01_網站首頁/images/image_005.jpg');
  if (fs.existsSync(heroBgPath)) {
    const img = await prisma.image.create({
      data: { filename: 'hero_bg.jpg', mimeType: 'image/jpeg', data: fs.readFileSync(heroBgPath) },
    });
    heroBgImageId = img.id;
  }
  await upsertSection('hero', {
    label: 'Law Office',
    title: '劉鈞豪 律師事務所',
    tagline: '專業法律服務 · SINCE 2018',
    ctaText: '聯絡律師 →',
    bgImageId: heroBgImageId,
    bgImage: 'scraped/01_網站首頁/images/image_005.jpg',
  });

  // About section — 匯入律師照片
  let aboutPhotoImageId = null;
  const aboutPhotoPath = path.join(scrapedBase, '02_關於律師/images/image_001.jpg');
  if (fs.existsSync(aboutPhotoPath)) {
    const img = await prisma.image.create({
      data: { filename: 'about_photo.jpg', mimeType: 'image/jpeg', data: fs.readFileSync(aboutPhotoPath) },
    });
    aboutPhotoImageId = img.id;
  }
  await upsertSection('about', {
    name: '劉鈞豪',
    position: '主持律師 · Director',
    photoImageId: aboutPhotoImageId,
    photo: 'scraped/02_關於律師/images/image_001.jpg',
    paragraphs: [
      '成立於民國107年，承辦民事、刑事執行案件，協助企業進行商業事件、勞資事件之處理。',
      '並受聘擔任多家企業法律顧問，提供即時法律服務，同時受邀擔任消費者保護法、生活法律講座、企業法律風險管理、校園法律教育及長照人員培訓等課程之講師。',
      '致力於研究法學專業，永續經營及創造價值之態度，以專業服務客戶。',
    ],
    tags: ['民事糾紛', '家事案件', '刑事案件', '智慧財產', '民事執行', '勞資爭議', '消費爭議', '保險爭議', '信託法務', '碳法事務'],
    education: [
      '逢甲大學 財經法律研究所 碩士',
      '銘傳大學 財金法律學系 學士',
      '律師高考及格',
      '勞資事務師',
    ],
    experience: [
      '全國律師聯合會 會員代表',
      '全國律師聯合會 信託委員會委員',
      '彰化律師公會 理事',
      '彰化律師公會 秘書長',
      '台中律師公會 副秘書長',
      '111、112 經濟部中小企業處榮譽律師',
    ],
  });

  // Services section
  await upsertSection('services', {
    cards: [
      { icon: '⚖', title: '民事 / 家事訴訟', desc: '民事起訴、調解和解、異議、抗告、上訴、借名登記、分割共有物、地上權、通行權、抵押權行使、塗銷、強制執行、支付命令等事件。' },
      { icon: '⚙', title: '刑事訴訟', desc: '詐欺、背信、侵占、偽造文書、網路詐騙、誣告、恐嚇、妨害名譽、傷害、電腦網路犯罪、走私、財產犯罪、性侵、少年刑事案件等。' },
      { icon: '⚛', title: '行政 / 智慧訴訟', desc: '訴願、行政訴訟、稅務救濟、懲處案件協助。提供專業的行政法律服務，保障您的合法權益。' },
      { icon: '✎', title: '其他服務', desc: '各類型契約審閱、擬定、簽約見證、契約修改、財團/社團法人之登記、解散事件、法律顧問服務、公寓大廈法律顧問。' },
    ],
  });

  // Pricing section
  await upsertSection('pricing', {
    table: [
      { service: '線上諮詢 / 實體諮詢', fee: 'NT$3,000~5,000 /小時' },
      { service: '中文合約審閱 / 代擬', fee: 'NT$6,000 /份' },
      { service: '代擬書狀', fee: 'NT$10,000 /份' },
      { service: '聲請支付命令', fee: 'NT$10,000 /份' },
      { service: '假扣押、假處分聲請', fee: 'NT$10,000 /份' },
      { service: '民事訴訟', fee: 'NT$30,000 /審' },
      { service: '刑事訴訟', fee: 'NT$60,000~80,000 /審' },
    ],
    plansTitle: '法律顧問方案',
    plansSubtitle: '常年法律顧問收費 — 個人 / 企業 / 其他團體',
    plans: [
      { name: '基本方案', price: '5,000', unit: '/ 年', featured: false, features: ['法律顧問證書', '不定期線上法律資訊 / 課程', '事務所 LINE@ 快速服務', '累積 1 小時法律諮詢', '訴訟案件九五折計費'] },
      { name: '進階方案', price: '20,000', unit: '/ 年', featured: true, features: ['法律顧問證書', '不定期線上法律資訊 / 課程', '事務所 LINE@ 快速服務', '累積 5 小時法律諮詢', '訴訟案件九五折計費'] },
      { name: '專業方案', price: '50,000', unit: '/ 年', featured: false, features: ['法律顧問證書', '不定期線上法律資訊 / 課程', '事務所 LINE@ 快速服務', '累積 12 小時法律諮詢', '訴訟案件九折計費'] },
    ],
    note: '以上收費僅供參考，實際報價仍應視委任內容之情況而定',
  });

  // News section — 匯入動態照片
  let newsPhotoImageId = null;
  const newsPhotoPath = path.join(scrapedBase, '06_律師動態/images/image_001.jpg');
  if (fs.existsSync(newsPhotoPath)) {
    const img = await prisma.image.create({
      data: { filename: 'news_photo.jpg', mimeType: 'image/jpeg', data: fs.readFileSync(newsPhotoPath) },
    });
    newsPhotoImageId = img.id;
  }
  await upsertSection('news', {
    photoImageId: newsPhotoImageId,
    photo: 'scraped/06_律師動態/images/image_001.jpg',
    title: '現任職務與榮譽',
    items: [
      '社團法人台中律師公會 副秘書長',
      '社團法人彰化律師公會 理事',
      '全國律師聯合會 會員代表',
      '111 經濟部中小企業處 榮譽律師',
      '112 經濟部中小企業處 榮譽律師',
      '海洋公務人員福利委員會 法律顧問',
    ],
    socialLinks: { linkedin: '#', instagram: '#', line: '#', facebook: '#' },
  });

  // Contact section
  await upsertSection('contact', {
    address: '403 台中市西區市府路 1-1 號',
    phone: '04-22220093',
    email: 'info@mysite.com',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3640.5!2d120.674!3d24.148!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z5Y-w5Lit5biC6KW_5Y2A5biC5bqc6LevMS0x6Jmf!5e0!3m2!1szh-TW!2stw!4v1',
  });

  // Footer section
  await upsertSection('footer', {
    firmName: '劉鈞豪律師事務所',
    since: 'SINCE 2018',
    address: '403 台中市西區市府路 1-1 號',
    phone: '04-22220093',
    copyright: '© 2023-2025 by 劉鈞豪律師事務所 Copyright',
    institutions: [
      { name: '司法院', url: 'https://www.judicial.gov.tw' },
      { name: '最高法院', url: 'https://tps.judicial.gov.tw' },
      { name: '臺灣高等法院 臺中分院', url: 'https://tch.judicial.gov.tw' },
      { name: '臺灣高等法院 臺南分院', url: 'https://tnh.judicial.gov.tw' },
      { name: '臺灣高等法院 高雄分院', url: 'https://ksh.judicial.gov.tw' },
    ],
  });

  // 匯入案例圖片和資料
  const casesData = [
    { name: '廣鎰有限公司', img: 'image_002.jpg', category: '貿易業', desc: '提供常年法律顧問服務，協助企業合約審閱、勞資爭議處理及商業糾紛諮詢，保障企業營運的法律安全。' },
    { name: '鑫裕芳有限公司', img: 'image_003.jpg', category: '零售業', desc: '擔任企業法律顧問，提供營運法律風險評估、契約擬定及員工管理相關法律諮詢服務。' },
    { name: '裕芳食品', img: 'image_004.jpg', category: '食品業', desc: '協助食品產業法規遵循、消費者保護法相關諮詢、品牌商標保護及供應商合約管理。' },
    { name: '威鋒貿易有限公司', img: 'image_005.jpg', category: '貿易業', desc: '處理國際貿易法律事務、進出口合約審閱、貿易糾紛調解及跨國商業法律諮詢。' },
    { name: '詠裕體育事業社', img: 'image_006.jpg', category: '體育事業', desc: '提供體育事業相關法律服務，包含賽事合約、贊助協議審閱及智慧財產權保護。' },
    { name: '超湛股份有限公司', img: 'image_007.jpg', category: '製造業', desc: '擔任常年法律顧問，協助公司治理、股東權益保障及商業訴訟代理。' },
    { name: '帝崴營造股份有限公司', img: 'image_008.jpg', category: '營造業', desc: '處理營建工程法律事務、工程合約擬定與審閱、工程款糾紛及勞安法規諮詢。' },
    { name: '展豐建設股份有限公司', img: 'image_009.jpg', category: '建設業', desc: '提供不動產開發法律服務、建案契約管理、都市更新法規諮詢及購屋糾紛處理。' },
    { name: '帝旺數位刀具有限公司', img: 'image_010.jpg', category: '製造業', desc: '協助精密製造業法律顧問服務、技術授權合約、專利保護及供應鏈法律風險管理。' },
    { name: '冠俋有限公司', img: 'image_011.jpg', category: '一般企業', desc: '提供全方位企業法律顧問服務，涵蓋合約管理、勞動法規遵循及商業爭議處理。' },
    { name: '非凡光電科技有限公司', img: 'image_012.jpg', category: '科技業', desc: '處理科技產業智慧財產權保護、技術合約談判、專利申請及營業秘密保護。' },
    { name: '金將科技股份有限公司', img: 'image_013.jpg', category: '科技業', desc: '擔任科技企業法律顧問，提供公司治理、投資架構設計及技術移轉法律服務。' },
    { name: '采業室內設計工作室', img: 'image_014.jpg', category: '設計業', desc: '協助室內設計產業合約管理、設計著作權保護及工程驗收糾紛處理。' },
    { name: '昊暘科技有限公司', img: 'image_015.jpg', category: '科技業', desc: '提供科技新創企業法律服務、股權架構設計、員工股票選擇權及募資法律諮詢。' },
    { name: '忠樑精密股份有限公司', img: 'image_016.jpg', category: '精密製造', desc: '協助精密工業法律顧問服務、國際貿易合約、品質爭議及供應商管理法律諮詢。' },
    { name: '樑美室內裝修有限公司', img: 'image_017.jpg', category: '裝修業', desc: '處理室內裝修工程法律事務、裝修合約擬定、工程糾紛及消費者權益保護。' },
    { name: '印順車業', img: 'image_018.jpg', category: '汽車業', desc: '提供車業法律顧問服務，處理買賣糾紛、維修爭議及消費者保護法相關諮詢。' },
    { name: '公勝保經 / 圓桌事業部', img: 'image_019.jpg', category: '保險業', desc: '協助保險經紀業法規遵循、保險糾紛處理、理賠爭議及業務員管理法律諮詢。' },
    { name: '日月香蛋糕店', img: 'image_020.jpg', category: '食品業', desc: '提供餐飲業法律服務、食品安全法規諮詢、加盟合約管理及勞動法規遵循。' },
    { name: '禾豐工商地產有限公司', img: 'image_021.jpg', category: '不動產', desc: '處理商業不動產法律事務、租賃合約管理、不動產交易及土地開發法律諮詢。' },
    { name: '中國人壽 / 凱旋通訊處', img: 'image_022.jpg', category: '保險業', desc: '提供壽險業法律顧問服務，協助保單爭議處理、業務合規及消費者糾紛調解。' },
    { name: '九日行銷工作室', img: 'image_023.jpg', category: '行銷業', desc: '協助數位行銷產業法律諮詢、廣告法規遵循、智慧財產權保護及合約管理。' },
    { name: '今大唯貿易有限公司', img: 'image_024.jpg', category: '貿易業', desc: '處理貿易公司法律事務、國際交易合約、進出口法規遵循及貿易糾紛處理。' },
    { name: '盈寶加企業股份有限公司', img: 'image_025.jpg', category: '一般企業', desc: '擔任常年法律顧問，提供企業營運法律風險管理、勞資關係及商業訴訟代理。' },
  ];

  // 嘗試匯入圖片（Docker 環境中 scraped 資料夾在 frontend 中，可能不存在）
  // Docker 中掛載到 /app/frontend/scraped，本地開發則是相對路徑
  const imgDir = path.join(scrapedBase, '05_企業委任/images');
  const existingCases = await prisma.case.count();
  if (existingCases === 0) {
    for (let i = 0; i < casesData.length; i++) {
      const c = casesData[i];
      let imageId = null;
      const imgPath = path.join(imgDir, c.img);
      if (fs.existsSync(imgPath)) {
        const data = fs.readFileSync(imgPath);
        const ext = path.extname(c.img).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : ext === '.jpeg' ? 'image/jpeg' : 'image/jpeg';
        const image = await prisma.image.create({
          data: { filename: c.img, mimeType, data },
        });
        imageId = image.id;
      }
      await prisma.case.create({
        data: { name: c.name, category: c.category, desc: c.desc, imageId, sortOrder: i + 1 },
      });
    }
    console.log(`已匯入 ${casesData.length} 筆案例`);
  } else {
    console.log(`案例資料已存在 (${existingCases} 筆)，跳過匯入`);
  }

  console.log('Seed 完成');
}

async function upsertSection(section, content) {
  await prisma.sectionContent.upsert({
    where: { section },
    update: { content },
    create: { section, content },
  });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
