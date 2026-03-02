/* ========================================
   劉鈞豪律師事務所 — Main JS v2
   ======================================== */

// --- Case Data ---
const CASES_DATA = [
  { name: '廣鎰有限公司', img: 'scraped/05_企業委任/images/image_002.jpg', category: '貿易業', desc: '提供常年法律顧問服務，協助企業合約審閱、勞資爭議處理及商業糾紛諮詢，保障企業營運的法律安全。' },
  { name: '鑫裕芳有限公司', img: 'scraped/05_企業委任/images/image_003.jpg', category: '零售業', desc: '擔任企業法律顧問，提供營運法律風險評估、契約擬定及員工管理相關法律諮詢服務。' },
  { name: '裕芳食品', img: 'scraped/05_企業委任/images/image_004.jpg', category: '食品業', desc: '協助食品產業法規遵循、消費者保護法相關諮詢、品牌商標保護及供應商合約管理。' },
  { name: '威鋒貿易有限公司', img: 'scraped/05_企業委任/images/image_005.jpg', category: '貿易業', desc: '處理國際貿易法律事務、進出口合約審閱、貿易糾紛調解及跨國商業法律諮詢。' },
  { name: '詠裕體育事業社', img: 'scraped/05_企業委任/images/image_006.jpg', category: '體育事業', desc: '提供體育事業相關法律服務，包含賽事合約、贊助協議審閱及智慧財產權保護。' },
  { name: '超湛股份有限公司', img: 'scraped/05_企業委任/images/image_007.jpg', category: '製造業', desc: '擔任常年法律顧問，協助公司治理、股東權益保障及商業訴訟代理。' },
  { name: '帝崴營造股份有限公司', img: 'scraped/05_企業委任/images/image_008.jpg', category: '營造業', desc: '處理營建工程法律事務、工程合約擬定與審閱、工程款糾紛及勞安法規諮詢。' },
  { name: '展豐建設股份有限公司', img: 'scraped/05_企業委任/images/image_009.jpg', category: '建設業', desc: '提供不動產開發法律服務、建案契約管理、都市更新法規諮詢及購屋糾紛處理。' },
  { name: '帝旺數位刀具有限公司', img: 'scraped/05_企業委任/images/image_010.jpg', category: '製造業', desc: '協助精密製造業法律顧問服務、技術授權合約、專利保護及供應鏈法律風險管理。' },
  { name: '冠俋有限公司', img: 'scraped/05_企業委任/images/image_011.jpg', category: '一般企業', desc: '提供全方位企業法律顧問服務，涵蓋合約管理、勞動法規遵循及商業爭議處理。' },
  { name: '非凡光電科技有限公司', img: 'scraped/05_企業委任/images/image_012.jpg', category: '科技業', desc: '處理科技產業智慧財產權保護、技術合約談判、專利申請及營業秘密保護。' },
  { name: '金將科技股份有限公司', img: 'scraped/05_企業委任/images/image_013.jpg', category: '科技業', desc: '擔任科技企業法律顧問，提供公司治理、投資架構設計及技術移轉法律服務。' },
  { name: '采業室內設計工作室', img: 'scraped/05_企業委任/images/image_014.jpg', category: '設計業', desc: '協助室內設計產業合約管理、設計著作權保護及工程驗收糾紛處理。' },
  { name: '昊暘科技有限公司', img: 'scraped/05_企業委任/images/image_015.jpg', category: '科技業', desc: '提供科技新創企業法律服務、股權架構設計、員工股票選擇權及募資法律諮詢。' },
  { name: '忠樑精密股份有限公司', img: 'scraped/05_企業委任/images/image_016.jpg', category: '精密製造', desc: '協助精密工業法律顧問服務、國際貿易合約、品質爭議及供應商管理法律諮詢。' },
  { name: '樑美室內裝修有限公司', img: 'scraped/05_企業委任/images/image_017.jpg', category: '裝修業', desc: '處理室內裝修工程法律事務、裝修合約擬定、工程糾紛及消費者權益保護。' },
  { name: '印順車業', img: 'scraped/05_企業委任/images/image_018.jpg', category: '汽車業', desc: '提供車業法律顧問服務，處理買賣糾紛、維修爭議及消費者保護法相關諮詢。' },
  { name: '公勝保經 / 圓桌事業部', img: 'scraped/05_企業委任/images/image_019.jpg', category: '保險業', desc: '協助保險經紀業法規遵循、保險糾紛處理、理賠爭議及業務員管理法律諮詢。' },
  { name: '日月香蛋糕店', img: 'scraped/05_企業委任/images/image_020.jpg', category: '食品業', desc: '提供餐飲業法律服務、食品安全法規諮詢、加盟合約管理及勞動法規遵循。' },
  { name: '禾豐工商地產有限公司', img: 'scraped/05_企業委任/images/image_021.jpg', category: '不動產', desc: '處理商業不動產法律事務、租賃合約管理、不動產交易及土地開發法律諮詢。' },
  { name: '中國人壽 / 凱旋通訊處', img: 'scraped/05_企業委任/images/image_022.jpg', category: '保險業', desc: '提供壽險業法律顧問服務，協助保單爭議處理、業務合規及消費者糾紛調解。' },
  { name: '九日行銷工作室', img: 'scraped/05_企業委任/images/image_023.jpg', category: '行銷業', desc: '協助數位行銷產業法律諮詢、廣告法規遵循、智慧財產權保護及合約管理。' },
  { name: '今大唯貿易有限公司', img: 'scraped/05_企業委任/images/image_024.jpg', category: '貿易業', desc: '處理貿易公司法律事務、國際交易合約、進出口法規遵循及貿易糾紛處理。' },
  { name: '盈寶加企業股份有限公司', img: 'scraped/05_企業委任/images/image_025.jpg', category: '一般企業', desc: '擔任常年法律顧問，提供企業營運法律風險管理、勞資關係及商業訴訟代理。' },
];

document.addEventListener('DOMContentLoaded', () => {

  // --- Navbar scroll ---
  const navbar = document.querySelector('.navbar');
  const updateNavbar = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', updateNavbar);
  updateNavbar();

  // --- Hamburger ---
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Carousel ---
  const track = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const dotsContainer = document.querySelector('.carousel-dots');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  if (track && slides.length) {
    let current = 0;
    let perView = getPerView();
    let pages = Math.ceil(slides.length / perView);
    let timer;

    function getPerView() {
      if (window.innerWidth <= 767) return 1;
      if (window.innerWidth <= 1023) return 2;
      return 3;
    }

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      for (let i = 0; i < pages; i++) {
        const d = document.createElement('span');
        d.classList.add('dot');
        if (i === 0) d.classList.add('active');
        d.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(d);
      }
    }

    function goTo(i) {
      if (i < 0) i = pages - 1;
      if (i >= pages) i = 0;
      current = i;
      track.style.transform = `translateX(-${current * perView * (100 / perView)}%)`;
      dotsContainer?.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === current));
    }

    function auto() { clearInterval(timer); timer = setInterval(() => goTo(current + 1), 5000); }

    buildDots();
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); auto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); auto(); });

    let sx = 0;
    track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; clearInterval(timer); });
    track.addEventListener('touchend', e => {
      const diff = sx - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
      auto();
    });

    window.addEventListener('resize', () => {
      const nv = getPerView();
      if (nv !== perView) { perView = nv; pages = Math.ceil(slides.length / perView); current = 0; goTo(0); buildDots(); }
    });

    const cw = document.querySelector('.carousel-wrapper');
    if (cw) { cw.addEventListener('mouseenter', () => clearInterval(timer)); cw.addEventListener('mouseleave', auto); }
    auto();
  }

  // --- Modal ---
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    const close = overlay.querySelector('.modal-close');
    const modalImg = overlay.querySelector('.modal-img');
    const modalName = overlay.querySelector('.modal-name');
    const modalCat = overlay.querySelector('.modal-cat');
    const modalDesc = overlay.querySelector('.modal-desc');
    const modalService = overlay.querySelector('.modal-service');

    function openModal(index) {
      const c = CASES_DATA[index];
      if (!c) return;
      modalImg.src = c.img;
      modalImg.alt = c.name;
      modalName.textContent = c.name;
      modalCat.textContent = c.category;
      modalDesc.textContent = c.desc;
      modalService.textContent = '常年法律顧問服務';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    close.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // Attach to all case cards
    document.querySelectorAll('.case-card[data-case-index]').forEach(card => {
      card.addEventListener('click', () => openModal(parseInt(card.dataset.caseIndex)));
    });

    // Expose globally for cases.html
    window.openCaseModal = openModal;
  }

  // --- Fade-in on scroll ---
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

  // --- Smooth scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const t = document.querySelector(this.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - 76, behavior: 'smooth' }); }
    });
  });

});
