/* ========================================
   後台管理系統 — admin.js
   ======================================== */

const API_BASE = '';
let token = localStorage.getItem('admin_token');
let contentData = {};
let seoDataCache = { index: null, cases: null };

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

// 表單填入/收集工具函式
function fillForm(mapping, data) {
  for (const [id, key] of Object.entries(mapping)) {
    const el = document.getElementById(id);
    if (el) el.value = data[key] || '';
  }
}

function collectForm(mapping) {
  const result = {};
  for (const [id, key] of Object.entries(mapping)) {
    result[key] = document.getElementById(id).value;
  }
  return result;
}

// 通用卡片新增函式
function addCard(containerId, label, fieldsHtml, data) {
  const container = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = 'card-item';
  div.innerHTML = `
    <div class="card-header"><strong>${label}</strong><button class="btn-sm btn-danger btn-remove-card">刪除</button></div>
    <div class="card-fields">${fieldsHtml}</div>
  `;
  div.querySelector('.btn-remove-card').addEventListener('click', () => div.remove());
  container.appendChild(div);
  return div;
}

// JSON 驗證工具函式
function parseJsonField(inputId, errorId) {
  const str = document.getElementById(inputId).value.trim();
  const errEl = document.getElementById(errorId);
  if (!str) { errEl.textContent = ''; return { value: null, ok: true }; }
  try {
    const value = JSON.parse(str);
    errEl.textContent = '';
    return { value, ok: true };
  } catch (e) {
    errEl.textContent = 'JSON 格式錯誤：' + e.message;
    return { value: null, ok: false };
  }
}

// 設定圖片預覽（依 imageId 或 fallback 路徑）
function setImagePreview(previewId, hiddenId, imageId, fallbackPath) {
  if (imageId) {
    document.getElementById(hiddenId).value = imageId;
    document.getElementById(previewId).src = `${API_BASE}/api/images/${imageId}`;
  } else if (fallbackPath) {
    document.getElementById(previewId).src = fallbackPath;
  }
}

// 收集社群連結資料
function collectSocialLink(platform) {
  return {
    url: document.getElementById(`news-${platform}`).value,
    iconId: parseInt(document.getElementById(`news-${platform}-icon-id`).value) || null,
  };
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
    if (tab.dataset.tab === 'messages') loadMessages();
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
    // 載入 SEO 資料
    seoDataCache.index = contentData['seo-index'] || null;
    seoDataCache.cases = contentData['seo-cases'] || null;
    fillSeo(seoDataCache[document.getElementById('seo-page-select').value]);
  }
  if (casesRes.ok) {
    const cases = await casesRes.json();
    fillCases(cases);
  }
  if (settingsRes.ok) {
    const settings = await settingsRes.json();
    document.getElementById('carousel-display-count').value = settings.carouselDisplayCount;
  }
  loadMessages();
}

// ===== Hero =====
const heroMapping = { 'hero-title': 'title', 'hero-tagline': 'tagline', 'hero-label': 'label', 'hero-ctaText': 'ctaText' };

function fillHero(data) {
  if (!data) return;
  fillForm(heroMapping, data);
  setImagePreview('hero-bg-preview', 'hero-bgImageId', data.bgImageId, data.bgImage);
}

function collectHero() {
  return {
    ...collectForm(heroMapping),
    bgImage: contentData.hero?.bgImage || '',
    bgImageId: parseInt(document.getElementById('hero-bgImageId').value) || null,
  };
}

// ===== About =====
const aboutMapping = { 'about-name': 'name', 'about-position': 'position' };

function fillAbout(data) {
  if (!data) return;
  fillForm(aboutMapping, data);
  setImagePreview('about-photo-preview', 'about-photoImageId', data.photoImageId, data.photo);
  fillDynamicList('about-paragraphs', data.paragraphs || [], 'textarea');
  fillDynamicList('about-tags', data.tags || [], 'input');
  fillDynamicList('about-education', data.education || [], 'input');
  fillDynamicList('about-experience', data.experience || [], 'input');
}

function collectAbout() {
  return {
    ...collectForm(aboutMapping),
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
  data.cards.forEach(card => addServiceCard(card));
}

function addServiceCard(card = { icon: '', title: '', desc: '' }) {
  addCard('services-cards', '服務卡片', `
    <div><label>Icon</label><input type="text" class="svc-icon" value="${card.icon}"></div>
    <div><label>標題</label><input type="text" class="svc-title" value="${card.title}"></div>
    <div><label>描述</label><textarea class="svc-desc">${card.desc}</textarea></div>
  `);
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
const pricingMapping = { 'pricing-plansTitle': 'plansTitle', 'pricing-plansSubtitle': 'plansSubtitle', 'pricing-note': 'note' };

function fillPricing(data) {
  if (!data) return;
  fillForm(pricingMapping, data);

  const rowsContainer = document.getElementById('pricing-table-rows');
  rowsContainer.innerHTML = '';
  (data.table || []).forEach(r => addPricingRow(r));

  const plansContainer = document.getElementById('pricing-plans');
  plansContainer.innerHTML = '';
  (data.plans || []).forEach(p => addPricingPlan(p));
}

function addPricingRow(row = { service: '', fee: '' }) {
  addCard('pricing-table-rows', '費用項目', `
    <div><label>服務項目</label><input type="text" class="pr-service" value="${row.service}"></div>
    <div><label>費用</label><input type="text" class="pr-fee" value="${row.fee}"></div>
  `);
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
  return { table, plans, ...collectForm(pricingMapping) };
}

// ===== News =====
function fillNews(data) {
  if (!data) return;
  document.getElementById('news-title').value = data.title || '';
  setImagePreview('news-photo-preview', 'news-photoImageId', data.photoImageId, data.photo);
  fillDynamicList('news-items', data.items || [], 'input');
  if (data.socialLinks) {
    ['linkedin', 'instagram', 'line', 'facebook'].forEach(p => {
      const val = data.socialLinks[p];
      const url = typeof val === 'string' ? val : val?.url || '';
      const iconId = typeof val === 'object' ? val?.iconId : null;
      document.getElementById(`news-${p}`).value = url;
      if (!iconId) return;
      document.getElementById(`news-${p}-icon-id`).value = iconId;
      const preview = document.getElementById(`news-${p}-icon-preview`);
      preview.src = `${API_BASE}/api/images/${iconId}`;
      preview.style.display = 'block';
    });
  }
}

function collectNews() {
  return {
    title: document.getElementById('news-title').value,
    photo: contentData.news?.photo || '',
    photoImageId: parseInt(document.getElementById('news-photoImageId').value) || null,
    items: collectDynamicList('news-items'),
    socialLinks: {
      linkedin: collectSocialLink('linkedin'),
      instagram: collectSocialLink('instagram'),
      line: collectSocialLink('line'),
      facebook: collectSocialLink('facebook'),
    },
  };
}

// ===== Contact =====
const contactMapping = { 'contact-address': 'address', 'contact-phone': 'phone', 'contact-email': 'email', 'contact-mapUrl': 'mapUrl' };

function fillContact(data) {
  if (!data) return;
  fillForm(contactMapping, data);
  if (data.mapUrl) {
    document.getElementById('contact-map-iframe').src = data.mapUrl;
    document.getElementById('contact-map-preview').style.display = '';
  }
}

function collectContact() {
  return collectForm(contactMapping);
}

// ===== 客戶留言 =====
function renderBadge(text, bgColor) {
  return `<span style="background:${bgColor};color:#fff;padding:2px 8px;border-radius:4px;font-size:0.8em;">${text}</span>`;
}

function renderMessageCard(m) {
  const time = new Date(m.createdAt).toLocaleString('zh-TW');
  const readBadge = m.isRead
    ? '<span style="color:#999;font-size:0.8em;">已讀</span>'
    : renderBadge('未讀', '#e74c3c');
  const blockedBadge = m.isBlocked ? ' ' + renderBadge('已阻擋', '#c0392b') : '';
  const borderStyle = m.isBlocked ? 'border-left:4px solid #e74c3c;' : '';
  return `
    <div class="card-item" style="${borderStyle}">
      <div class="card-header">
        <strong>${m.name}</strong>
        <div>${readBadge}${blockedBadge}</div>
      </div>
      <div class="card-fields" style="font-size:0.9em;">
        <div><span style="color:var(--text-light);">時間：</span>${time}</div>
        <div><span style="color:var(--text-light);">IP：</span>${m.ip || '未知'}</div>
        <div><span style="color:var(--text-light);">Email：</span>${m.email}</div>
        ${m.phone ? `<div><span style="color:var(--text-light);">電話：</span>${m.phone}</div>` : ''}
        <div style="margin-top:6px;white-space:pre-wrap;">${m.message}</div>
      </div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        ${!m.isRead ? `<button class="btn-sm" onclick="markMessageRead(${m.id})">標記已讀</button>` : ''}
        <button class="btn-sm btn-danger" onclick="deleteMessage(${m.id})">刪除</button>
      </div>
    </div>
  `;
}

async function loadMessages() {
  const container = document.getElementById('messages-list');
  if (!container) return;
  const res = await api('/api/contact');
  if (!res.ok) { container.innerHTML = '<p>載入留言失敗</p>'; return; }
  const messages = await res.json();
  document.getElementById('messages-total-count').textContent = `（共 ${messages.length} 筆留言）`;
  if (!messages.length) { container.innerHTML = '<p style="color:var(--text-light);">目前沒有客戶留言</p>'; return; }
  container.innerHTML = messages.map(renderMessageCard).join('');
}

async function markMessageRead(id) {
  const res = await api(`/api/contact/${id}/read`, { method: 'PUT' });
  if (res.ok) { toast('已標記為已讀'); loadMessages(); }
  else toast('操作失敗', 'error');
}

async function deleteMessage(id) {
  if (!confirm('確定要刪除此留言？')) return;
  const res = await api(`/api/contact/${id}`, { method: 'DELETE' });
  if (res.ok) { toast('留言已刪除'); loadMessages(); }
  else toast('刪除失敗', 'error');
}

// ===== Footer =====
const footerMapping = { 'footer-firmName': 'firmName', 'footer-since': 'since', 'footer-address': 'address', 'footer-phone': 'phone', 'footer-copyright': 'copyright' };

function fillFooter(data) {
  if (!data) return;
  fillForm(footerMapping, data);
  const container = document.getElementById('footer-institutions');
  container.innerHTML = '';
  (data.institutions || []).forEach(inst => addFooterInstitution(inst));
}

function addFooterInstitution(inst = { name: '', url: '' }) {
  addCard('footer-institutions', '機構連結', `
    <div><label>名稱</label><input type="text" class="inst-name" value="${inst.name}"></div>
    <div><label>URL</label><input type="text" class="inst-url" value="${inst.url}"></div>
  `);
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
  return { ...collectForm(footerMapping), institutions };
}

// ===== SEO =====
const seoMetaMapping = { 'seo-meta-title': 'title', 'seo-meta-description': 'description', 'seo-meta-keywords': 'keywords' };
const seoOgMapping = { 'seo-og-type': 'type', 'seo-og-title': 'title', 'seo-og-description': 'description', 'seo-og-image': 'image', 'seo-og-url': 'url', 'seo-og-locale': 'locale', 'seo-og-siteName': 'siteName' };
const seoTwitterMapping = { 'seo-twitter-card': 'card', 'seo-twitter-title': 'title', 'seo-twitter-description': 'description', 'seo-twitter-image': 'image' };

function fillSeo(data) {
  if (!data) {
    fillForm(seoMetaMapping, {});
    fillForm(seoOgMapping, {});
    fillForm(seoTwitterMapping, {});
    document.getElementById('seo-canonical').value = '';
    document.getElementById('seo-twitter-card').value = 'summary';
    document.getElementById('seo-jsonld').value = '';
    updateSeoCharCounts();
    return;
  }
  fillForm(seoMetaMapping, data.meta || {});
  document.getElementById('seo-canonical').value = data.canonical || '';
  fillForm(seoOgMapping, data.og || {});
  fillForm(seoTwitterMapping, data.twitter || {});
  if (!(data.twitter || {}).card) document.getElementById('seo-twitter-card').value = 'summary';
  document.getElementById('seo-jsonld').value = data.jsonLd ? JSON.stringify(data.jsonLd, null, 2) : '';
  document.getElementById('seo-jsonld-error').textContent = '';
  updateSeoCharCounts();
}

function collectSeo() {
  const { value: jsonLd, ok } = parseJsonField('seo-jsonld', 'seo-jsonld-error');
  if (!ok) return null;
  return {
    meta: collectForm(seoMetaMapping),
    canonical: document.getElementById('seo-canonical').value,
    og: collectForm(seoOgMapping),
    twitter: collectForm(seoTwitterMapping),
    jsonLd,
  };
}

function updateSeoCharCounts() {
  const title = document.getElementById('seo-meta-title').value;
  const desc = document.getElementById('seo-meta-description').value;
  document.getElementById('seo-title-count').textContent = `(${title.length} 字)`;
  document.getElementById('seo-desc-count').textContent = `(${desc.length} 字)`;
}

// SEO 頁面切換
document.getElementById('seo-page-select').addEventListener('change', (e) => {
  fillSeo(seoDataCache[e.target.value]);
});

// SEO 字數即時更新
document.getElementById('seo-meta-title').addEventListener('input', updateSeoCharCounts);
document.getElementById('seo-meta-description').addEventListener('input', updateSeoCharCounts);

// JSON-LD 驗證按鈕
document.getElementById('seo-jsonld-validate').addEventListener('click', () => {
  const { ok } = parseJsonField('seo-jsonld', 'seo-jsonld-error');
  const errEl = document.getElementById('seo-jsonld-error');
  if (ok && document.getElementById('seo-jsonld').value.trim()) {
    errEl.style.color = '#27ae60';
    errEl.textContent = 'JSON 格式正確 ✓';
    setTimeout(() => { errEl.textContent = ''; errEl.style.color = '#e74c3c'; }, 2000);
  } else if (!ok) {
    errEl.style.color = '#e74c3c';
  }
});

// ===== Cases =====
let casesData = [];

function updateCasesCount() {
  const count = document.getElementById('cases-list').children.length;
  document.getElementById('cases-total-count').textContent = `（共 ${count} 筆案例）`;
}

function fillCases(cases) {
  casesData = cases;
  const container = document.getElementById('cases-list');
  container.innerHTML = '';
  cases.forEach(c => {
    const div = document.createElement('div');
    div.className = 'card-item';
    const imgId = c.imageId || c.image?.id;
    const imgSrc = imgId ? `${API_BASE}/api/images/${imgId}` : '';
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
  updateCasesCount();
}

function openCaseEditor(caseItem = null) {
  const isNew = !caseItem;
  const overlay = document.createElement('div');
  overlay.className = 'edit-modal-overlay';
  const imgId = caseItem?.imageId || caseItem?.image?.id;
  const imgSrc = imgId ? `${API_BASE}/api/images/${imgId}` : '';
  overlay.innerHTML = `
    <div class="edit-modal">
      <h3>${isNew ? '新增案例' : '編輯案例'}</h3>
      <div class="form-group"><label>企業名稱</label><input type="text" id="case-name" value="${caseItem?.name || ''}"></div>
      <div class="form-group"><label>分類</label><input type="text" id="case-category" value="${caseItem?.category || ''}"></div>
      <div class="form-group"><label>描述</label><textarea id="case-desc">${caseItem?.desc || ''}</textarea></div>
      <div class="form-group">
        <label>圖片</label>
        <p class="hint">ℹ️ 建議尺寸：400 × 180 px（約 2:1 橫式），企業 Logo 或代表圖</p>
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
    const url = isNew ? '/api/cases' : `/api/cases/${caseItem.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await api(url, { method, body });
    if (res.ok) {
      toast(isNew ? '案例已新增' : '案例已更新');
      overlay.remove();
      reloadCases();
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
    reloadCases();
  } else {
    toast('刪除失敗', 'error');
  }
}

async function reloadCases() {
  const casesRes = await api('/api/cases');
  if (casesRes.ok) fillCases(await casesRes.json());
}

document.getElementById('add-case').addEventListener('click', () => openCaseEditor());

// 地圖預覽
document.getElementById('contact-mapUrl-preview-btn').addEventListener('click', () => {
  const url = document.getElementById('contact-mapUrl').value.trim();
  const preview = document.getElementById('contact-map-preview');
  if (url) {
    document.getElementById('contact-map-iframe').src = url;
    preview.style.display = '';
  } else {
    preview.style.display = 'none';
  }
});

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
  seo: 'SEO 設定',
};

const collectors = {
  hero: collectHero,
  about: collectAbout,
  services: collectServices,
  pricing: collectPricing,
  news: collectNews,
  contact: collectContact,
  footer: collectFooter,
  seo: collectSeo,
};

document.querySelectorAll('.btn-save').forEach(btn => {
  btn.addEventListener('click', async () => {
    const section = btn.dataset.section;
    const collector = collectors[section];
    if (!collector) return;
    btn.disabled = true;
    btn.textContent = '儲存中...';
    const body = collector();
    // collectSeo 回傳 null 表示 JSON-LD 驗證失敗
    if (body === null) {
      btn.disabled = false;
      btn.textContent = '儲存';
      return;
    }
    // SEO section 需要根據下拉選擇決定實際 section name
    const actualSection = section === 'seo'
      ? `seo-${document.getElementById('seo-page-select').value}`
      : section;
    const res = await api(`/api/content/${actualSection}`, { method: 'PUT', body });
    if (res.ok) {
      if (section === 'seo') {
        const page = document.getElementById('seo-page-select').value;
        seoDataCache[page] = body;
        contentData[actualSection] = body;
      } else {
        contentData[section] = body;
      }
      toast(`${sectionNames[section] || section} 已儲存`);
    } else {
      toast('儲存失敗', 'error');
    }
    btn.disabled = false;
    btn.textContent = '儲存';
  });
});

// ===== 社群圖片上傳 =====
document.querySelectorAll('.btn-upload-icon').forEach(btn => {
  const targetId = btn.dataset.target;
  const fileInput = document.getElementById(targetId);
  const preview = document.getElementById(`${targetId}-preview`);
  const hiddenInput = document.getElementById(`${targetId}-id`);

  btn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    const formData = new FormData();
    formData.append('image', file);
    const res = await api('/api/images', { method: 'POST', body: formData, headers: {} });
    if (res.ok) {
      const data = await res.json();
      hiddenInput.value = data.id;
      preview.src = `${API_BASE}/api/images/${data.id}`;
      toast('圖片上傳成功');
    } else {
      toast('圖片上傳失敗', 'error');
    }
  });
});

// ===== 初始化 =====
setupImageUpload();
checkAuth();
