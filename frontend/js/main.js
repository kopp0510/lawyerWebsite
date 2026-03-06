/* ========================================
   劉鈞豪律師事務所 — Main JS v3 (API-driven)
   ======================================== */

const API_BASE = '';

// 備用靜態案例資料（API 失敗時使用）
const CASES_DATA_FALLBACK = [
  { name: '廣鎰有限公司', img: 'scraped/05_企業委任/images/image_002.jpg', category: '貿易業', desc: '提供常年法律顧問服務，協助企業合約審閱、勞資爭議處理及商業糾紛諮詢，保障企業營運的法律安全。' },
  { name: '鑫裕芳有限公司', img: 'scraped/05_企業委任/images/image_003.jpg', category: '零售業', desc: '擔任企業法律顧問，提供營運法律風險評估、契約擬定及員工管理相關法律諮詢服務。' },
  { name: '裕芳食品', img: 'scraped/05_企業委任/images/image_004.jpg', category: '食品業', desc: '協助食品產業法規遵循、消費者保護法相關諮詢、品牌商標保護及供應商合約管理。' },
  { name: '威鋒貿易有限公司', img: 'scraped/05_企業委任/images/image_005.jpg', category: '貿易業', desc: '處理國際貿易法律事務、進出口合約審閱、貿易糾紛調解及跨國商業法律諮詢。' },
  { name: '詠裕體育事業社', img: 'scraped/05_企業委任/images/image_006.jpg', category: '體育事業', desc: '提供體育事業相關法律服務，包含賽事合約、贊助協議審閱及智慧財產權保護。' },
  { name: '超湛股份有限公司', img: 'scraped/05_企業委任/images/image_007.jpg', category: '製造業', desc: '擔任常年法律顧問，協助公司治理、股東權益保障及商業訴訟代理。' },
  { name: '帝崴營造股份有限公司', img: 'scraped/05_企業委任/images/image_008.jpg', category: '營造業', desc: '處理營建工程法律事務、工程合約擬定與審閱、工程款糾紛及勞安法規諮詢。' },
  { name: '展豐建設股份有限公司', img: 'scraped/05_企業委任/images/image_009.jpg', category: '建設業', desc: '提供不動產開發法律服務、建案契約管理、都市更新法規諮詢及購屋糾紛處理。' },
  { name: '帝旺數位刀具有限公司', img: 'scraped/05_企業委任/images/image_010.jpg', category: '製造業', desc: '協助精密製造業法律顧問服務、技術授權合約、專利保護及供應鏈法律風險管理。' },
];

// 從 API 載入所有 section 內容
async function loadContent() {
  try {
    const [contentRes, casesRes, settingsRes] = await Promise.all([
      fetch(`${API_BASE}/api/content`),
      fetch(`${API_BASE}/api/cases`),
      fetch(`${API_BASE}/api/settings`),
    ]);
    if (contentRes.ok) {
      const content = await contentRes.json();
      renderHero(content.hero);
      renderAbout(content.about);
      renderServices(content.services);
      renderPricing(content.pricing);
      renderNews(content.news);
      renderContact(content.contact);
      renderFooter(content.footer);
    }
    if (casesRes.ok) {
      const cases = await casesRes.json();
      const settings = settingsRes.ok ? await settingsRes.json() : { carouselDisplayCount: 9 };
      window.CASES_DATA = cases;
      renderCarousel(cases, settings.carouselDisplayCount);
      renderCasesPage(cases);
    }
  } catch {
    console.log('API 載入失敗，使用原始 HTML 內容');
    // 使用備用資料初始化 modal
    window.CASES_DATA = CASES_DATA_FALLBACK;
  }
}

function getImageSrc(item) {
  if (item.imageId) return `${API_BASE}/api/images/${item.imageId}`;
  if (item.image && item.image.id) return `${API_BASE}/api/images/${item.image.id}`;
  if (item.img) return item.img;
  return '';
}

function renderHero(data) {
  if (!data) return;
  const section = document.querySelector('.hero');
  if (!section) return;
  const bg = section.querySelector('.hero-bg');
  if (bg && (data.bgImageId || data.bgImage)) {
    const src = data.bgImageId ? `${API_BASE}/api/images/${data.bgImageId}` : data.bgImage;
    bg.style.backgroundImage = `url('${src}')`;
  }
  const label = section.querySelector('.hero-label');
  if (label && data.label) label.textContent = data.label;
  const h1 = section.querySelector('h1');
  if (h1 && data.title) h1.textContent = data.title;
  const tagline = section.querySelector('.tagline');
  if (tagline && data.tagline) tagline.textContent = data.tagline;
  const cta = section.querySelector('.hero-cta');
  if (cta && data.ctaText) cta.textContent = data.ctaText;
}

function renderAbout(data) {
  if (!data) return;
  const section = document.querySelector('#about');
  if (!section) return;
  const img = section.querySelector('.about-photo img');
  if (img) {
    if (data.photoImageId) img.src = `${API_BASE}/api/images/${data.photoImageId}`;
    else if (data.photo) img.src = data.photo;
  }
  const name = section.querySelector('.about-name');
  if (name) name.textContent = data.name || '';
  const posEl = section.querySelector('.about-position');
  if (posEl) posEl.textContent = data.position || '';

  if (data.paragraphs) {
    const info = section.querySelector('.about-info');
    info.querySelectorAll('.about-text').forEach(el => el.remove());
    const anchor = info.querySelector('.about-position');
    // 反向插入，確保順序正確
    [...data.paragraphs].reverse().forEach(p => {
      const el = document.createElement('p');
      el.className = 'about-text';
      el.textContent = p;
      anchor.insertAdjacentElement('afterend', el);
    });
  }

  const tagsEl = section.querySelector('.about-tags');
  if (tagsEl && data.tags) {
    tagsEl.innerHTML = data.tags.map(t => `<span>${t}</span>`).join('');
  }

  const blocks = section.querySelectorAll('.credential-block');
  if (blocks[0] && data.education) {
    blocks[0].querySelector('ul').innerHTML = data.education.map(e => `<li>${e}</li>`).join('');
  }
  if (blocks[1] && data.experience) {
    blocks[1].querySelector('ul').innerHTML = data.experience.map(e => `<li>${e}</li>`).join('');
  }
}

function renderServices(data) {
  if (!data || !data.cards) return;
  const grid = document.querySelector('.services-grid');
  if (!grid) return;
  grid.innerHTML = data.cards.map((c, i) => `
    <div class="service-card fade-in${i > 0 ? ` fade-in-delay-${i}` : ''}">
      <div class="service-icon">${c.icon}</div>
      <h3>${c.title}</h3>
      <p>${c.desc}</p>
    </div>
  `).join('');
  grid.querySelectorAll('.fade-in').forEach(el => { if (window._obs) window._obs.observe(el); });
}

function renderCarousel(cases, displayCount) {
  const track = document.querySelector('.carousel-track');
  if (!track) return;
  const shown = cases.slice(0, displayCount);
  track.innerHTML = shown.map((c, i) => {
    const imgSrc = getImageSrc(c);
    return `<div class="carousel-slide"><div class="case-card" data-case-index="${i}"><img class="case-card-img" src="${imgSrc}" alt="${c.name}"><div class="case-card-body"><h4>${c.name}</h4></div></div></div>`;
  }).join('');
  initCarousel();
  bindCaseCards();
}

function renderCasesPage(cases) {
  const grid = document.querySelector('.cases-grid');
  if (!grid) return;
  grid.innerHTML = cases.map((c, i) => {
    const imgSrc = getImageSrc(c);
    return `<div class="case-card fade-in" data-case-index="${i}"><img class="case-card-img" src="${imgSrc}" alt="${c.name}"><div class="case-card-body"><h4>${c.name}</h4></div></div>`;
  }).join('');
  grid.querySelectorAll('.fade-in').forEach(el => { if (window._obs) window._obs.observe(el); });
  bindCaseCards();
}

function renderPricing(data) {
  if (!data) return;
  const tbody = document.querySelector('.pricing-table-wrap tbody');
  if (tbody && data.table) {
    tbody.innerHTML = data.table.map(r => `<tr><td>${r.service}</td><td>${r.fee}</td></tr>`).join('');
  }
  const grid = document.querySelector('.plans-grid');
  if (grid && data.plans) {
    grid.innerHTML = data.plans.map((p, i) => `
      <div class="plan-card${p.featured ? ' featured' : ''} fade-in${i > 0 ? ` fade-in-delay-${i}` : ''}">
        ${p.featured ? '<span class="plan-badge">推薦</span>' : ''}
        <h3>${p.name}</h3>
        <div class="price"><span class="price-prefix">NT$</span>${p.price}</div>
        <span class="price-unit">${p.unit}</span>
        <div class="plan-divider"></div>
        <ul class="plan-features">${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
      </div>
    `).join('');
    grid.querySelectorAll('.fade-in').forEach(el => { if (window._obs) window._obs.observe(el); });
  }
  const subtitle = document.querySelector('.plans-subtitle');
  if (subtitle) {
    if (data.plansTitle) subtitle.querySelector('h3').textContent = data.plansTitle;
    if (data.plansSubtitle) subtitle.querySelector('p').textContent = data.plansSubtitle;
  }
  const note = document.querySelector('.pricing-note');
  if (note && data.note) note.textContent = data.note;
}

function renderNews(data) {
  if (!data) return;
  const section = document.querySelector('#news');
  if (!section) return;
  const img = section.querySelector('.news-photo img');
  if (img) {
    if (data.photoImageId) img.src = `${API_BASE}/api/images/${data.photoImageId}`;
    else if (data.photo) img.src = data.photo;
  }
  const title = section.querySelector('.news-content h3');
  if (title) title.textContent = data.title || '';
  const list = section.querySelector('.news-list');
  if (list && data.items) {
    list.innerHTML = data.items.map(i => `<li>${i}</li>`).join('');
  }
  const social = section.querySelector('.social-links');
  if (social && data.socialLinks) {
    const labels = { linkedin: 'in', instagram: 'ig', line: 'Li', facebook: 'fb' };
    social.innerHTML = Object.entries(data.socialLinks)
      .map(([k, v]) => `<a href="${v}" aria-label="${k}">${labels[k] || k}</a>`)
      .join('');
  }
}

function renderContact(data) {
  if (!data) return;
  const section = document.querySelector('#contact');
  if (!section) return;
  const items = section.querySelectorAll('.contact-info-item');
  if (items[0] && data.address) items[0].querySelector('span:last-child').textContent = data.address;
  if (items[1] && data.phone) items[1].querySelector('span:last-child').textContent = data.phone;
  if (items[2] && data.email) items[2].querySelector('span:last-child').textContent = data.email;
  const iframe = section.querySelector('.contact-map iframe');
  if (iframe && data.mapUrl) iframe.src = data.mapUrl;
}

function renderFooter(data) {
  if (!data) return;
  const footer = document.querySelector('.footer');
  if (!footer) return;
  const grids = footer.querySelectorAll('.footer-grid > div');
  if (grids[0]) {
    grids[0].querySelector('h4').textContent = data.firmName || '';
    grids[0].querySelectorAll('p')[0].textContent = data.since || '';
    const p2 = grids[0].querySelectorAll('p')[1];
    if (p2) p2.innerHTML = `地址：${data.address || ''}<br>電話：${data.phone || ''}`;
  }
  if (grids[2] && data.institutions) {
    const links = grids[2].querySelector('.footer-links');
    if (links) links.innerHTML = data.institutions.map(i => `<a href="${i.url}" target="_blank">${i.name}</a>`).join('');
  }
  const bottom = footer.querySelector('.footer-bottom');
  if (bottom && data.copyright) bottom.innerHTML = data.copyright;
}

// --- Carousel 初始化 ---
function initCarousel() {
  const track = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.carousel-slide');
  const dotsContainer = document.querySelector('.carousel-dots');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  if (!track || !slides.length) return;

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

function bindCaseCards() {
  document.querySelectorAll('.case-card[data-case-index]').forEach(card => {
    card.addEventListener('click', () => {
      const index = parseInt(card.dataset.caseIndex);
      if (window.openCaseModal) window.openCaseModal(index);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // --- Navbar scroll ---
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const updateNavbar = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', updateNavbar);
    updateNavbar();
  }

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

  // --- Modal ---
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    const close = overlay.querySelector('.modal-close');
    const modalImg = overlay.querySelector('.modal-img');
    const modalName = overlay.querySelector('.modal-name');
    const modalCat = overlay.querySelector('.modal-cat');
    const modalDesc = overlay.querySelector('.modal-desc');
    const modalService = overlay.querySelector('.modal-service');

    window.openCaseModal = function(index) {
      const cases = window.CASES_DATA || CASES_DATA_FALLBACK;
      const c = cases[index];
      if (!c) return;
      const imgSrc = getImageSrc(c);
      modalImg.src = imgSrc;
      modalImg.alt = c.name;
      modalName.textContent = c.name;
      modalCat.textContent = c.category;
      modalDesc.textContent = c.desc;
      modalService.textContent = '常年法律顧問服務';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    function closeModal() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    close.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  // --- Fade-in on scroll ---
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
  window._obs = obs;

  // --- Smooth scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const t = document.querySelector(this.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - 76, behavior: 'smooth' }); }
    });
  });

  // 載入 API 內容
  loadContent();
});
