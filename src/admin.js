import {
  AUTH_KEY,
  STORAGE_KEY,
  loadSiteData,
  saveSiteData,
  exportSiteData,
  clearPreviewData,
} from './data.js';

let siteData = null;
let activePanel = 'meta';

function isAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === '1';
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 2800);
}

function field(label, id, value = '', type = 'text', hint = '') {
  const input = type === 'textarea'
    ? `<textarea id="${id}" data-key="${id}">${value}</textarea>`
    : `<input type="${type}" id="${id}" data-key="${id}" value="${escAttr(value)}" />`;
  return `
    <label class="field">
      <span>${label}</span>
      ${input}
      ${hint ? `<span class="field-hint">${hint}</span>` : ''}
    </label>
  `;
}

function escAttr(str) {
  return String(str ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function getNested(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

function setNested(obj, path, val) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = val;
}

function collectFields(container) {
  container.querySelectorAll('[data-key]').forEach((el) => {
    const key = el.dataset.key;
    if (!key.includes('.')) return;
    let val = el.value;
    if (el.type === 'number') val = +val;
    setNested(siteData, key, val);
  });
}

/* --- Panel Renderers --- */

function panelMeta() {
  const d = siteData;
  return `
    <div class="panel">
      <div class="panel-head"><h2>基本設定</h2><p>サイト名・SEO・ヘッダー</p></div>
      <div class="card">
        <p class="card-title">SEO / メタ</p>
        ${field('サイトタイトル', 'meta.title', d.meta.title)}
        ${field('説明文', 'meta.description', d.meta.description, 'textarea')}
        ${field('OGタイトル', 'meta.ogTitle', d.meta.ogTitle)}
        ${field('OG説明', 'meta.ogDescription', d.meta.ogDescription)}
        ${field('OG画像パス', 'meta.ogImage', d.meta.ogImage, 'text', '/illustrations/...')}
      </div>
      <div class="card">
        <p class="card-title">ヘッダー</p>
        ${field('ロゴ', 'header.logo', d.header.logo)}
        ${field('バッジ', 'header.badge', d.header.badge)}
      </div>
      <div class="card">
        <p class="card-title">フッター</p>
        ${field('ロゴ', 'footer.logo', d.footer.logo)}
        ${field('コピーライト', 'footer.copyright', d.footer.copyright)}
      </div>
      <div class="card">
        <p class="card-title">ティッカー</p>
        ${field('単語（カンマ区切り）', 'ticker-raw', d.ticker.join(', '), 'text', '例: SUIGO, 翠光, DIGITAL, STUDIO')}
      </div>
    </div>
  `;
}

function panelHero() {
  const h = siteData.hero;
  return `
    <div class="panel">
      <div class="panel-head"><h2>ヒーロー</h2><p>トップセクションのコンテンツ</p></div>
      <div class="card">
        ${field('イラストパス', 'hero.image', h.image)}
        ${field('イラスト alt', 'hero.imageAlt', h.imageAlt)}
        ${field('メタ行', 'hero.meta', h.meta)}
        ${field('タイトル行（カンマ区切り）', 'hero-title-raw', h.titleLines.join(', '), 'text', '4行推奨')}
        ${field('アウトライン行（0始まり）', 'hero.outlineIndex', h.outlineIndex, 'number')}
        ${field('サブタイトル', 'hero.subtitle', h.subtitle)}
        <div class="field-row">
          ${field('CTAテキスト', 'hero.ctaText', h.ctaText)}
          ${field('CTAリンク', 'hero.ctaHref', h.ctaHref)}
        </div>
      </div>
      <div class="card">
        <p class="card-title">統計</p>
        <div class="item-list" id="hero-stats-list">
          ${h.stats.map((s, i) => `
            <div class="item-card" data-stat-idx="${i}">
              <div class="field-row">
                ${field('数値', `hero.stats.${i}.value`, s.value, 'number')}
                ${field('接尾辞', `hero.stats.${i}.suffix`, s.suffix)}
              </div>
              ${field('ラベル', `hero.stats.${i}.label`, s.label)}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function panelAbout() {
  const a = siteData.about;
  return `
    <div class="panel">
      <div class="panel-head"><h2>About</h2></div>
      <div class="card">
        ${field('セクション番号', 'about.num', a.num)}
        ${field('イラストパス', 'about.image', a.image)}
        ${field('イラスト alt', 'about.imageAlt', a.imageAlt)}
        ${field('タイトル（HTML可）', 'about.title', a.title, 'textarea', '<br> で改行')}
        ${field('本文', 'about.text', a.text, 'textarea')}
      </div>
    </div>
  `;
}

function renderItemList(section, fields, items, itemLabel) {
  return `
    <div class="panel">
      <div class="panel-head">
        <h2>${section}</h2>
        <p>${items.length} 件</p>
      </div>
      <div class="item-list">
        ${items.map((item, i) => `
          <div class="item-card">
            <div class="item-card-head">
              <strong>${itemLabel} ${i + 1}</strong>
              <button type="button" class="btn btn--sm btn--danger" data-remove="${section}" data-idx="${i}">削除</button>
            </div>
            ${fields(item, i).join('')}
          </div>
        `).join('')}
      </div>
      <button type="button" class="btn" data-add="${section}">+ 追加</button>
    </div>
  `;
}

function panelWorks() {
  const w = siteData.works;
  return `
    <div class="panel">
      <div class="panel-head"><h2>Works</h2></div>
      <div class="card">
        ${field('セクション番号', 'works.num', w.num)}
        ${field('タイトル', 'works.title', w.title)}
      </div>
      ${renderItemList('works', (item, i) => [
        field('タイトル', `works.items.${i}.title`, item.title),
        field('タグ', `works.items.${i}.tag`, item.tag),
        field('説明', `works.items.${i}.desc`, item.desc, 'textarea'),
        field('実績', `works.items.${i}.stats`, item.stats),
        field('画像パス', `works.items.${i}.image`, item.image),
      ], w.items, '実績')}
    </div>
  `;
}

function panelProcess() {
  const p = siteData.process;
  return `
    <div class="panel">
      <div class="panel-head"><h2>Process</h2></div>
      <div class="card">
        ${field('セクション番号', 'process.num', p.num)}
        ${field('タイトル', 'process.title', p.title)}
        ${field('説明', 'process.text', p.text, 'textarea')}
      </div>
      ${renderItemList('process', (item, i) => [
        field('タイトル', `process.steps.${i}.title`, item.title),
        field('説明', `process.steps.${i}.desc`, item.desc, 'textarea'),
      ], p.steps, 'ステップ')}
    </div>
  `;
}

function panelServices() {
  const s = siteData.services;
  return `
    <div class="panel">
      <div class="panel-head"><h2>Services</h2></div>
      <div class="card">
        ${field('セクション番号', 'services.num', s.num)}
        ${field('タイトル', 'services.title', s.title)}
      </div>
      ${renderItemList('services', (item, i) => [
        field('タイトル', `services.items.${i}.title`, item.title),
        field('説明', `services.items.${i}.desc`, item.desc, 'textarea'),
      ], s.items, 'サービス')}
    </div>
  `;
}

function panelTeam() {
  const t = siteData.team;
  return `
    <div class="panel">
      <div class="panel-head"><h2>Team</h2></div>
      <div class="card">
        ${field('セクション番号', 'team.num', t.num)}
        ${field('タイトル', 'team.title', t.title)}
        ${field('説明', 'team.text', t.text, 'textarea')}
      </div>
      ${renderItemList('team', (item, i) => [
        field('名前', `team.members.${i}.name`, item.name),
        field('役職', `team.members.${i}.role`, item.role),
        field('画像パス', `team.members.${i}.image`, item.image),
      ], t.members, 'メンバー')}
    </div>
  `;
}

function panelVoices() {
  const v = siteData.voices;
  return `
    <div class="panel">
      <div class="panel-head"><h2>Voices</h2></div>
      <div class="card">
        ${field('セクション番号', 'voices.num', v.num)}
        ${field('タイトル', 'voices.title', v.title)}
        ${field('説明', 'voices.text', v.text)}
      </div>
      ${renderItemList('voices', (item, i) => [
        field('引用', `voices.items.${i}.quote`, item.quote, 'textarea'),
        field('署名', `voices.items.${i}.attribution`, item.attribution),
        field('画像パス', `voices.items.${i}.image`, item.image),
      ], v.items, '声')}
    </div>
  `;
}

function panelJournal() {
  const j = siteData.journal;
  return `
    <div class="panel">
      <div class="panel-head"><h2>Journal</h2></div>
      <div class="card">
        ${field('セクション番号', 'journal.num', j.num)}
        ${field('タイトル', 'journal.title', j.title)}
        ${field('説明', 'journal.text', j.text)}
      </div>
      ${renderItemList('journal', (item, i) => [
        field('日付（ISO）', `journal.posts.${i}.date`, item.date),
        field('表示日付', `journal.posts.${i}.dateDisplay`, item.dateDisplay),
        field('タイトル', `journal.posts.${i}.title`, item.title),
        field('画像パス', `journal.posts.${i}.image`, item.image),
        field('リンク', `journal.posts.${i}.url`, item.url),
      ], j.posts, '記事')}
    </div>
  `;
}

function panelFaq() {
  const f = siteData.faq;
  return `
    <div class="panel">
      <div class="panel-head"><h2>FAQ</h2></div>
      <div class="card">
        ${field('セクション番号', 'faq.num', f.num)}
        ${field('タイトル', 'faq.title', f.title)}
        ${field('説明', 'faq.text', f.text)}
      </div>
      ${renderItemList('faq', (item, i) => [
        field('質問', `faq.items.${i}.question`, item.question),
        field('回答', `faq.items.${i}.answer`, item.answer, 'textarea'),
      ], f.items, 'Q&A')}
    </div>
  `;
}

function panelCta() {
  const c = siteData.cta;
  return `
    <div class="panel">
      <div class="panel-head"><h2>CTA</h2></div>
      <div class="card">
        ${field('ラベル', 'cta.label', c.label)}
        ${field('タイトル（HTML可）', 'cta.title', c.title, 'textarea')}
        <div class="field-row">
          ${field('ボタンテキスト', 'cta.btnText', c.btnText)}
          ${field('ボタンリンク', 'cta.btnHref', c.btnHref)}
        </div>
      </div>
    </div>
  `;
}

function panelContact() {
  const c = siteData.contact;
  return `
    <div class="panel">
      <div class="panel-head"><h2>Contact</h2></div>
      <div class="card">
        ${field('セクション番号', 'contact.num', c.num)}
        ${field('タイトル', 'contact.title', c.title)}
        ${field('説明', 'contact.text', c.text, 'textarea')}
        ${field('メール', 'contact.email', c.email)}
        ${field('住所', 'contact.address', c.address)}
        ${field('送信完了メッセージ', 'contact.successReply', c.successReply)}
      </div>
    </div>
  `;
}

function panelSettings() {
  return `
    <div class="panel">
      <div class="panel-head"><h2>設定</h2><p>パスワード・データ管理</p></div>
      <div class="card">
        <p class="card-title">ログインパスワード</p>
        ${field('新しいパスワード', 'admin.password', siteData.admin?.password || 'suigo2026')}
        <p class="field-hint">変更後は「保存」を押してください。</p>
      </div>
      <div class="card">
        <p class="card-title">データ管理</p>
        <p class="settings-note">
          「保存」でブラウザにプレビューデータを保存します。公開サイトは <code>?preview=1</code> でプレビュー表示できます。<br><br>
          本番反映には「JSON出力」で <code>public/data/site.json</code> を差し替えてデプロイしてください。
        </p>
        <div class="card-actions">
          <button type="button" class="btn btn--danger" id="btn-reset-preview">プレビューデータを削除</button>
        </div>
      </div>
    </div>
  `;
}

const PANELS = {
  meta: panelMeta,
  hero: panelHero,
  about: panelAbout,
  works: panelWorks,
  process: panelProcess,
  services: panelServices,
  team: panelTeam,
  voices: panelVoices,
  journal: panelJournal,
  faq: panelFaq,
  cta: panelCta,
  contact: panelContact,
  settings: panelSettings,
};

function renderPanel() {
  const main = document.getElementById('admin-main');
  if (!main || !siteData) return;

  collectSpecialFields();
  main.innerHTML = PANELS[activePanel]();

  main.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      collectFields(main);
      const section = btn.dataset.remove;
      const idx = +btn.dataset.idx;
      const listKey = {
        works: 'works.items',
        process: 'process.steps',
        services: 'services.items',
        team: 'team.members',
        voices: 'voices.items',
        journal: 'journal.posts',
        faq: 'faq.items',
      }[section];
      if (!listKey) return;
      const arr = getNested(siteData, listKey);
      arr.splice(idx, 1);
      renderPanel();
    });
  });

  main.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      collectFields(main);
      const section = btn.dataset.add;
      const templates = {
        works: { title: '新規プロジェクト', tag: 'Category', desc: '説明文', stats: '—', image: '/illustrations/work-green.png' },
        process: { title: 'Step', desc: '説明文' },
        services: { title: 'Service', desc: '説明文' },
        team: { name: '名前', role: 'Role', image: '/illustrations/team-1.png' },
        voices: { quote: '「引用文」', attribution: '名前 — 会社', image: '/illustrations/team-1.png' },
        journal: { date: '2026-01-01', dateDisplay: '2026.01.01', title: '記事タイトル', image: '/illustrations/journal-1.png', url: '#' },
        faq: { question: '質問', answer: '回答' },
      };
      const listKey = {
        works: 'works.items',
        process: 'process.steps',
        services: 'services.items',
        team: 'team.members',
        voices: 'voices.items',
        journal: 'journal.posts',
        faq: 'faq.items',
      }[section];
      if (!listKey || !templates[section]) return;
      getNested(siteData, listKey).push({ ...templates[section] });
      renderPanel();
    });
  });

  const resetBtn = main.querySelector('#btn-reset-preview');
  resetBtn?.addEventListener('click', () => {
    clearPreviewData();
    showToast('プレビューデータを削除しました');
  });
}

function collectSpecialFields() {
  const main = document.getElementById('admin-main');
  if (!main) return;
  collectFields(main);

  const tickerRaw = main.querySelector('#ticker-raw');
  if (tickerRaw) {
    siteData.ticker = tickerRaw.value.split(',').map((s) => s.trim()).filter(Boolean);
  }

  const heroTitleRaw = main.querySelector('#hero-title-raw');
  if (heroTitleRaw) {
    siteData.hero.titleLines = heroTitleRaw.value.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

function save() {
  collectSpecialFields();
  saveSiteData(siteData);
  showToast('保存しました — プレビューで確認できます');
}

function switchPanel(panel) {
  collectSpecialFields();
  activePanel = panel;
  document.querySelectorAll('.admin-nav button').forEach((b) => {
    b.classList.toggle('active', b.dataset.panel === panel);
  });
  renderPanel();
}

async function initLogin() {
  const loginScreen = document.getElementById('login-screen');
  const adminApp = document.getElementById('admin-app');
  const form = document.getElementById('login-form');
  const error = document.getElementById('login-error');

  if (isAuthed()) {
    loginScreen.hidden = true;
    adminApp.hidden = false;
    return;
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pw = document.getElementById('login-password')?.value;
    const data = await loadSiteData();
    const expected = data.admin?.password || 'suigo2026';
    if (pw === expected) {
      sessionStorage.setItem(AUTH_KEY, '1');
      loginScreen.hidden = true;
      adminApp.hidden = false;
      error.hidden = true;
      await initAdmin();
    } else {
      error.hidden = false;
    }
  });
}

async function initAdmin() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      siteData = JSON.parse(stored);
    } catch {
      siteData = await loadSiteData();
    }
  } else {
    siteData = await loadSiteData();
  }

  renderPanel();

  document.querySelectorAll('.admin-nav button').forEach((btn) => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });

  document.getElementById('btn-save')?.addEventListener('click', save);

  document.getElementById('btn-preview')?.addEventListener('click', () => {
    collectSpecialFields();
    saveSiteData(siteData);
    window.open('/?preview=1', '_blank');
  });

  document.getElementById('btn-export')?.addEventListener('click', () => {
    collectSpecialFields();
    exportSiteData(siteData);
    showToast('site.json をダウンロードしました');
  });

  document.getElementById('btn-import')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        siteData = JSON.parse(reader.result);
        renderPanel();
        showToast('JSONを読み込みました');
      } catch {
        showToast('JSONの読み込みに失敗しました');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    location.reload();
  });
}

async function init() {
  await initLogin();
  if (isAuthed()) await initAdmin();
}

init();
