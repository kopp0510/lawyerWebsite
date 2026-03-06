/* ========================================
   後台管理系統 — admin.js
   ======================================== */

const API_BASE = '';
let token = localStorage.getItem('admin_token');
let contentData = {};

// ===== 工具函式 =====
function api(path, options = {}) {
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (options.body && typeof options.body === 'object') options.body = JSON.stringify(options.body);
  }
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ===== 登入/登出 =====
function checkAuth() {
  if (token) {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-page').style.display = 'block';
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('admin-email').textContent = payload.email;
    loadAllData();
  }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const res = await api('/api/auth/login', { method: 'POST', body: { email, password } });
  const data = await res.json();
  if (res.ok) {
    token = data.token;
    localStorage.setItem('admin_token', token);
    checkAuth();
  } else {
    document.getElementById('login-error').textContent = data.error || '登入失敗';
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  token = null;
  localStorage.removeItem('admin_token');
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('admin-page').style.display = 'none';
  document.getElementById('login-error').textContent = '';
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
});

// ===== Tab 切換 =====
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
  });
});

// ===== 載入所有資料 =====
async function loadAllData() {
  const [contentRes, casesRes, settingsRes] = await Promise.all([
    api('/api/content'),
    api('/api/cases'),
    api('/api/settings'),
  ]);
  if (contentRes.ok) {
    contentData = await contentRes.json();
    fillHero(contentData.hero);
    fillAbout(contentData.about);
    fillServices(contentData.services);
    fillPricing(contentData.pricing);
    fillNews(contentData.news);
    fillContact(contentData.contact);
    fillFooter(contentData.footer);
  }
  if (casesRes.ok) {
    const cases = await casesRes.json();
    fillCases(cases);
  }
  if (settingsRes.ok) {
    const settings = await settingsRes.json();
    document.getElementById('carousel-display-count').value = settings.carouselDisplayCount;
  }
}

// ===== Hero =====
function fillHero(data) {
  if (!data) return;
  document.getElementById('hero-title').value = data.title || '';
  document.getElementById('hero-tagline').value = data.tagline || '';
  document.getElementById('hero-label').value = data.label || '';
  document.getElementById('hero-ctaText').value = data.ctaText || '';
  if (data.bgImageId) {
    document.getElementById('hero-bgImageId').value = data.bgImageId;
    document.getElementById('hero-bg-preview').src = `${API_BASE}/api/images/${data.bgImageId}`;
  } else if (data.bgImage) {
    document.getElementById('hero-bg-preview').src = data.bgImage;
  }
}

function collectHero() {
  return {
    title: document.getElementById('hero-title').value,
    tagline: document.getElementById('hero-tagline').value,
    label: document.getElementById('hero-label').value,
    ctaText: document.getElementById('hero-ctaText').value,
    bgImage: contentData.hero?.bgImage || '',
    bgImageId: parseInt(document.getElementById('hero-bgImageId').value) || null,
  };
}

// ===== About =====
function fillAbout(data) {
  if (!data) return;
  document.getElementById('about-name').value = data.name || '';
  document.getElementById('about-position').value = data.position || '';
  if (data.photoImageId) {
    document.getElementById('about-photoImageId').value = data.photoImageId;
    document.getElementById('about-photo-preview').src = `${API_BASE}/api/images/${data.photoImageId}`;
  } else if (data.photo) {
    document.getElementById('about-photo-preview').src = data.photo;
  }
  fillDynamicList('about-paragraphs', data.paragraphs || [], 'textarea');
  fillDynamicList('about-tags', data.tags || [], 'input');
  fillDynamicList('about-education', data.education || [], 'input');
  fillDynamicList('about-experience', data.experience || [], 'input');
}

function collectAbout() {
  return {
    name: document.getElementById('about-name').value,
    position: document.getElementById('about-position').value,
    photo: contentData.about?.photo || '',
    photoImageId: parseInt(document.getElementById('about-photoImageId').value) || null,
    paragraphs: collectDynamicList('about-paragraphs'),
    tags: collectDynamicList('about-tags'),
    education: collectDynamicList('about-education'),
    experience: collectDynamicList('about-experience'),
  };
}

// ===== Services =====
function fillServices(data) {
  if (!data || !data.cards) return;
  const container = document.getElementById('services-cards');
  container.innerHTML = '';
  data.cards.forEach((card, i) => addServiceCard(card));
}

function addServiceCard(card = { icon: '', title: '', desc: '' }) {
  const container = document.getElementById('services-cards');
  const div = document.createElement('div');
  div.className = 'card-item';
  div.innerHTML = `
    <div class="card-header"><strong>服務卡片</strong><button class="btn-sm btn-danger btn-remove-card">刪除</button></div>
    <div class="card-fields">
      <div><label>Icon</label><input type="text" class="svc-icon" value="${card.icon}"></div>
      <div><label>標題</label><input type="text" class="svc-title" value="${card.title}"></div>
      <div><label>描述</label><textarea class="svc-desc">${card.desc}</textarea></div>
    </div>
  `;
  div.querySelector('.btn-remove-card').addEventListener('click', () => div.remove());
  container.appendChild(div);
}

document.getElementById('add-service-card').addEventListener('click', () => addServiceCard());

function collectServices() {
  const cards = [];
  document.querySelectorAll('#services-cards .card-item').forEach(item => {
    cards.push({
      icon: item.querySelector('.svc-icon').value,
      title: item.querySelector('.svc-title').value,
      desc: item.querySelector('.svc-desc').value,
    });
  });
  return { cards };
}

// ===== Pricing =====
function fillPricing(data) {
  if (!data) return;
  document.getElementById('pricing-plansTitle').value = data.plansTitle || '';
  document.getElementById('pricing-plansSubtitle').value = data.plansSubtitle || '';
  document.getElementById('pricing-note').value = data.note || '';

  const rowsContainer = document.getElementById('pricing-table-rows');
  rowsContainer.innerHTML = '';
  (data.table || []).forEach(r => addPricingRow(r));

  const plansContainer = document.getElementById('pricing-plans');
  plansContainer.innerHTML = '';
  (data.plans || []).forEach(p => addPricingPlan(p));
}

function addPricingRow(row = { service: '', fee: '' }) {
  const container = document.getElementById('pricing-table-rows');
  const div = document.createElement('div');
  div.className = 'card-item';
  div.innerHTML = `
    <div class="card-header"><strong>費用項目</strong><button class="btn-sm btn-danger btn-remove-card">刪除</button></div>
    <div class="card-fields">
      <div><label>服務項目</label><input type="text" class="pr-service" value="${row.service}"></div>
      <div><label>費用</label><input type="text" class="pr-fee" value="${row.fee}"></div>
    </div>
  `;
  div.querySelector('.btn-remove-card').addEventListener('click', () => div.remove());
  container.appendChild(div);
}

function addPricingPlan(plan = { name: '', price: '', unit: '/ 年', featured: false, features: [] }) {
  const container = document.getElementById('pricing-plans');
  const div = document.createElement('div');
  div.className = 'card-item';
  div.innerHTML = `
    <div class="card-header"><strong>方案</strong><button class="btn-sm btn-danger btn-remove-card">刪除</button></div>
    <div class="card-fields">
      <div><label>方案名稱</label><input type="text" class="plan-name" value="${plan.name}"></div>
      <div><label>價格（數字）</label><input type="text" class="plan-price" value="${plan.price}"></div>
      <div><label>單位</label><input type="text" class="plan-unit" value="${plan.unit}"></div>
      <div class="checkbox-group"><input type="checkbox" class="plan-featured" ${plan.featured ? 'checked' : ''}><label>推薦方案</label></div>
      <div>
        <label>功能列表</label>
        <div class="plan-features-list">${(plan.features || []).map(f => `<div class="plan-feature-item"><input type="text" value="${f}"><button class="btn-remove">&times;</button></div>`).join('')}</div>
        <button type="button" class="btn-sm btn-add add-plan-feature" style="margin-top:4px;">+ 功能</button>
      </div>
    </div>
  `;
  div.querySelector('.btn-remove-card').addEventListener('click', () => div.remove());
  div.querySelector('.add-plan-feature').addEventListener('click', () => {
    const list = div.querySelector('.plan-features-list');
    const item = document.createElement('div');
    item.className = 'plan-feature-item';
    item.innerHTML = '<input type="text" value=""><button class="btn-remove">&times;</button>';
    item.querySelector('.btn-remove').addEventListener('click', () => item.remove());
    list.appendChild(item);
  });
  div.querySelectorAll('.plan-feature-item .btn-remove').forEach(btn => {
    btn.addEventListener('click', () => btn.parentElement.remove());
  });
  container.appendChild(div);
}

document.getElementById('add-pricing-row').addEventListener('click', () => addPricingRow());
document.getElementById('add-pricing-plan').addEventListener('click', () => addPricingPlan());

function collectPricing() {
  const table = [];
  document.querySelectorAll('#pricing-table-rows .card-item').forEach(item => {
    table.push({
      service: item.querySelector('.pr-service').value,
      fee: item.querySelector('.pr-fee').value,
    });
  });
  const plans = [];
  document.querySelectorAll('#pricing-plans .card-item').forEach(item => {
    const features = [];
    item.querySelectorAll('.plan-feature-item input').forEach(inp => {
      if (inp.value.trim()) features.push(inp.value.trim());
    });
    plans.push({
      name: item.querySelector('.plan-name').value,
      price: item.querySelector('.plan-price').value,
      unit: item.querySelector('.plan-unit').value,
      featured: item.querySelector('.plan-featured').checked,
      features,
    });
  });
  return {
    table,
    plans,
    plansTitle: document.getElementById('pricing-plansTitle').value,
    plansSubtitle: document.getElementById('pricing-plansSubtitle').value,
    note: document.getElementById('pricing-note').value,
  };
}

// ===== News =====
function fillNews(data) {
  if (!data) return;
  document.getElementById('news-title').value = data.title || '';
  if (data.photoImageId) {
    document.getElementById('news-photoImageId').value = data.photoImageId;
    document.getElementById('news-photo-preview').src = `${API_BASE}/api/images/${data.photoImageId}`;
  } else if (data.photo) {
    document.getElementById('news-photo-preview').src = data.photo;
  }
  fillDynamicList('news-items', data.items || [], 'input');
  if (data.socialLinks) {
    document.getElementById('news-linkedin').value = data.socialLinks.linkedin || '';
    document.getElementById('news-instagram').value = data.socialLinks.instagram || '';
    document.getElementById('news-line').value = data.socialLinks.line || '';
    document.getElementById('news-facebook').value = data.socialLinks.facebook || '';
  }
}

function collectNews() {
  return {
    title: document.getElementById('news-title').value,
    photo: contentData.news?.photo || '',
    photoImageId: parseInt(document.getElementById('news-photoImageId').value) || null,
    items: collectDynamicList('news-items'),
    socialLinks: {
      linkedin: document.getElementById('news-linkedin').value,
      instagram: document.getElementById('news-instagram').value,
      line: document.getElementById('news-line').value,
      facebook: document.getElementById('news-facebook').value,
    },
  };
}

// ===== Contact =====
function fillContact(data) {
  if (!data) return;
  document.getElementById('contact-address').value = data.address || '';
  document.getElementById('contact-phone').value = data.phone || '';
  document.getElementById('contact-email').value = data.email || '';
  document.getElementById('contact-mapUrl').value = data.mapUrl || '';
}

function collectContact() {
  return {
    address: document.getElementById('contact-address').value,
    phone: document.getElementById('contact-phone').value,
    email: document.getElementById('contact-email').value,
    mapUrl: document.getElementById('contact-mapUrl').value,
  };
}

// ===== Footer =====
function fillFooter(data) {
  if (!data) return;
  document.getElementById('footer-firmName').value = data.firmName || '';
  document.getElementById('footer-since').value = data.since || '';
  document.getElementById('footer-address').value = data.address || '';
  document.getElementById('footer-phone').value = data.phone || '';
  document.getElementById('footer-copyright').value = data.copyright || '';
  const container = document.getElementById('footer-institutions');
  container.innerHTML = '';
  (data.institutions || []).forEach(inst => addFooterInstitution(inst));
}

function addFooterInstitution(inst = { name: '', url: '' }) {
  const container = document.getElementById('footer-institutions');
  const div = document.createElement('div');
  div.className = 'card-item';
  div.innerHTML = `
    <div class="card-header"><strong>機構連結</strong><button class="btn-sm btn-danger btn-remove-card">刪除</button></div>
    <div class="card-fields">
      <div><label>名稱</label><input type="text" class="inst-name" value="${inst.name}"></div>
      <div><label>URL</label><input type="text" class="inst-url" value="${inst.url}"></div>
    </div>
  `;
  div.querySelector('.btn-remove-card').addEventListener('click', () => div.remove());
  container.appendChild(div);
}

document.getElementById('add-footer-institution').addEventListener('click', () => addFooterInstitution());

function collectFooter() {
  const institutions = [];
  document.querySelectorAll('#footer-institutions .card-item').forEach(item => {
    institutions.push({
      name: item.querySelector('.inst-name').value,
      url: item.querySelector('.inst-url').value,
    });
  });
  return {
    firmName: document.getElementById('footer-firmName').value,
    since: document.getElementById('footer-since').value,
    address: document.getElementById('footer-address').value,
    phone: document.getElementById('footer-phone').value,
    copyright: document.getElementById('footer-copyright').value,
    institutions,
  };
}

// ===== Cases =====
let casesData = [];

function fillCases(cases) {
  casesData = cases;
  const container = document.getElementById('cases-list');
  container.innerHTML = '';
  cases.forEach(c => {
    const div = document.createElement('div');
    div.className = 'card-item';
    const imgSrc = c.imageId ? `${API_BASE}/api/images/${c.imageId}` : (c.image ? `${API_BASE}/api/images/${c.image.id}` : '');
    div.innerHTML = `
      <div class="case-card-admin">
        <div class="case-img-wrap"><img src="${imgSrc}" alt="${c.name}"></div>
        <div class="case-info">
          <strong>${c.name}</strong>
          <span>${c.category}</span>
        </div>
        <div class="case-actions">
          <button class="btn-sm" data-action="edit" data-id="${c.id}">編輯</button>
          <button class="btn-sm btn-danger" data-action="delete" data-id="${c.id}">刪除</button>
        </div>
      </div>
    `;
    div.querySelector('[data-action="edit"]').addEventListener('click', () => openCaseEditor(c));
    div.querySelector('[data-action="delete"]').addEventListener('click', () => deleteCase(c.id));
    container.appendChild(div);
  });
}

function openCaseEditor(caseItem = null) {
  const isNew = !caseItem;
  const overlay = document.createElement('div');
  overlay.className = 'edit-modal-overlay';
  const imgSrc = caseItem?.imageId ? `${API_BASE}/api/images/${caseItem.imageId}` : (caseItem?.image ? `${API_BASE}/api/images/${caseItem.image.id}` : '');
  overlay.innerHTML = `
    <div class="edit-modal">
      <h3>${isNew ? '新增案例' : '編輯案例'}</h3>
      <div class="form-group"><label>企業名稱</label><input type="text" id="case-name" value="${caseItem?.name || ''}"></div>
      <div class="form-group"><label>分類</label><input type="text" id="case-category" value="${caseItem?.category || ''}"></div>
      <div class="form-group"><label>描述</label><textarea id="case-desc">${caseItem?.desc || ''}</textarea></div>
      <div class="form-group">
        <label>圖片</label>
        <div class="image-upload" data-target="case-imageId">
          <img class="img-preview" src="${imgSrc}" alt="">
          <input type="file" accept="image/*" class="file-input">
          <button type="button" class="btn-sm btn-upload">選擇圖片</button>
        </div>
        <input type="hidden" id="case-imageId" value="${caseItem?.imageId || ''}">
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" id="case-cancel">取消</button>
        <button class="btn-primary" id="case-submit">${isNew ? '新增' : '儲存'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  setupImageUpload(overlay);

  overlay.querySelector('#case-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector('#case-submit').addEventListener('click', async () => {
    const body = {
      name: overlay.querySelector('#case-name').value,
      category: overlay.querySelector('#case-category').value,
      desc: overlay.querySelector('#case-desc').value,
      imageId: parseInt(overlay.querySelector('#case-imageId').value) || null,
    };
    if (!body.name || !body.category || !body.desc) {
      toast('請填寫企業名稱、分類和描述', 'error');
      return;
    }
    let res;
    if (isNew) {
      res = await api('/api/cases', { method: 'POST', body });
    } else {
      res = await api(`/api/cases/${caseItem.id}`, { method: 'PUT', body });
    }
    if (res.ok) {
      toast(isNew ? '案例已新增' : '案例已更新');
      overlay.remove();
      const casesRes = await api('/api/cases');
      if (casesRes.ok) fillCases(await casesRes.json());
    } else {
      toast('操作失敗', 'error');
    }
  });
}

async function deleteCase(id) {
  if (!confirm('確定要刪除此案例？')) return;
  const res = await api(`/api/cases/${id}`, { method: 'DELETE' });
  if (res.ok) {
    toast('案例已刪除');
    const casesRes = await api('/api/cases');
    if (casesRes.ok) fillCases(await casesRes.json());
  } else {
    toast('刪除失敗', 'error');
  }
}

document.getElementById('add-case').addEventListener('click', () => openCaseEditor());

// 儲存設定（輪播數量）
document.getElementById('save-settings').addEventListener('click', async () => {
  const count = parseInt(document.getElementById('carousel-display-count').value);
  const res = await api('/api/settings', { method: 'PUT', body: { carouselDisplayCount: count } });
  if (res.ok) toast('設定已儲存');
  else toast('儲存失敗', 'error');
});

// ===== 動態列表 =====
function fillDynamicList(containerId, items, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(val => addDynamicItem(container, type, val));
}

function addDynamicItem(container, type, value = '') {
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
  if (type !== 'textarea') input.type = 'text';
  input.value = value;
  const btn = document.createElement('button');
  btn.className = 'btn-remove';
  btn.textContent = '×';
  btn.addEventListener('click', () => div.remove());
  div.appendChild(input);
  div.appendChild(btn);
  container.appendChild(div);
}

function collectDynamicList(containerId) {
  const items = [];
  document.querySelectorAll(`#${containerId} .dynamic-item`).forEach(item => {
    const input = item.querySelector('input, textarea');
    if (input && input.value.trim()) items.push(input.value.trim());
  });
  return items;
}

// 新增按鈕事件
document.querySelectorAll('.btn-add[data-list]').forEach(btn => {
  btn.addEventListener('click', () => {
    const container = document.getElementById(btn.dataset.list);
    addDynamicItem(container, btn.dataset.type);
  });
});

// ===== 圖片上傳 =====
function setupImageUpload(root = document) {
  root.querySelectorAll('.image-upload').forEach(wrap => {
    const fileInput = wrap.querySelector('.file-input');
    const uploadBtn = wrap.querySelector('.btn-upload');
    const preview = wrap.querySelector('.img-preview');
    const targetId = wrap.dataset.target;

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      // 預覽
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
      // 上傳
      const formData = new FormData();
      formData.append('image', file);
      const res = await api('/api/images', { method: 'POST', body: formData, headers: {} });
      if (res.ok) {
        const data = await res.json();
        const target = (root === document) ? document.getElementById(targetId) : root.querySelector(`#${targetId}`);
        if (target) target.value = data.id;
        preview.src = `${API_BASE}/api/images/${data.id}`;
        toast('圖片上傳成功');
      } else {
        toast('圖片上傳失敗', 'error');
      }
    });
  });
}

// ===== 儲存 Section =====
const sectionNames = {
  hero: 'Hero 區塊',
  about: '關於律師',
  services: '服務項目',
  pricing: '收費標準',
  news: '律師動態',
  contact: '聯絡律師',
  footer: 'Footer',
};

const collectors = {
  hero: collectHero,
  about: collectAbout,
  services: collectServices,
  pricing: collectPricing,
  news: collectNews,
  contact: collectContact,
  footer: collectFooter,
};

document.querySelectorAll('.btn-save').forEach(btn => {
  btn.addEventListener('click', async () => {
    const section = btn.dataset.section;
    const collector = collectors[section];
    if (!collector) return;
    btn.disabled = true;
    btn.textContent = '儲存中...';
    const body = collector();
    const res = await api(`/api/content/${section}`, { method: 'PUT', body });
    if (res.ok) {
      contentData[section] = body;
      toast(`${sectionNames[section] || section} 已儲存`);
    } else {
      toast('儲存失敗', 'error');
    }
    btn.disabled = false;
    btn.textContent = '儲存';
  });
});

// ===== 初始化 =====
setupImageUpload();
checkAuth();
