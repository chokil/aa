function esc(str) {
  const d = document.createElement('div');
  d.textContent = str ?? '';
  return d.innerHTML;
}

function setMeta(data) {
  document.title = data.meta.title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = data.meta.description;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = data.meta.ogTitle;
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = data.meta.ogDescription;
  const ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) ogImg.content = data.meta.ogImage;
}

function renderHeader(data) {
  const logo = document.querySelector('.header-logo');
  const badge = document.querySelector('.header-badge');
  if (logo) logo.textContent = data.header.logo;
  if (badge) badge.textContent = data.header.badge;
}

function renderHero(data) {
  const h = data.hero;
  const img = document.querySelector('.hero-illust img');
  if (img) {
    img.src = h.image;
    img.alt = h.imageAlt;
  }

  const meta = document.querySelector('.hero-meta');
  if (meta) meta.textContent = h.meta;

  const title = document.getElementById('hero-title');
  if (title) {
    title.innerHTML = h.titleLines.map((line, i) => {
      const cls = i === h.outlineIndex ? 'hero-line hero-line--outline' : 'hero-line';
      return `<span class="${cls}"><span class="char-wrap">${esc(line)}</span></span>`;
    }).join('');
  }

  const sub = document.getElementById('hero-sub');
  if (sub) sub.textContent = h.subtitle;

  const cta = document.querySelector('.hero-cta');
  if (cta) {
    cta.textContent = h.ctaText;
    cta.href = h.ctaHref;
  }

  const stats = document.querySelector('.hero-stats');
  if (stats) {
    stats.innerHTML = h.stats.map((s) => `
      <div>
        <dt><span class="stat-num" data-target="${s.value}">0</span>${esc(s.suffix)}</dt>
        <dd>${esc(s.label)}</dd>
      </div>
    `).join('');
  }
}

function renderTicker(data) {
  const track = document.getElementById('ticker-track');
  if (!track) return;
  const words = [...data.ticker, ...data.ticker];
  track.innerHTML = words.map((w) => `<span>${esc(w)}</span>`).join('');
}

function renderAbout(data) {
  const a = data.about;
  const section = document.getElementById('about');
  if (!section) return;

  const img = section.querySelector('.about-visual img');
  if (img) {
    img.src = a.image;
    img.alt = a.imageAlt;
  }

  const num = section.querySelector('.block-num');
  if (num) num.textContent = a.num;

  const title = section.querySelector('.block-title');
  if (title) title.innerHTML = a.title;

  const text = section.querySelector('.block-text');
  if (text) text.textContent = a.text;
}

function renderWorks(data) {
  const w = data.works;
  const section = document.getElementById('works');
  if (!section) return;

  const num = section.querySelector('.block-num');
  if (num) num.textContent = w.num;

  const title = section.querySelector('.block-title');
  if (title) title.textContent = w.title;

  const carousel = document.getElementById('works-carousel');
  if (carousel) {
    carousel.innerHTML = w.items.map((item, i) => `
      <article class="work-card" data-project tabindex="0"
        data-title="${esc(item.title)}" data-tag="${esc(item.tag)}"
        data-desc="${esc(item.desc)}" data-stats="${esc(item.stats)}"
        data-image="${esc(item.image)}">
        <div class="work-card-visual work-card-visual--illust">
          <img src="${esc(item.image)}" alt="${esc(item.title)} — 線画イラスト" width="1536" height="1024" loading="lazy" />
        </div>
        <span class="work-card-num">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.tag)}</p>
      </article>
    `).join('');
  }

  const dots = document.getElementById('carousel-dots');
  if (dots) {
    dots.innerHTML = w.items.map((_, i) =>
      `<span class="${i === 0 ? 'active' : ''}"></span>`
    ).join('');
  }
}

function renderProcess(data) {
  const p = data.process;
  const section = document.getElementById('process');
  if (!section) return;

  const num = section.querySelector('.block-num');
  if (num) num.textContent = p.num;

  const title = section.querySelector('.block-title');
  if (title) title.textContent = p.title;

  const text = section.querySelector('.block-text');
  if (text) text.textContent = p.text;

  const list = section.querySelector('.process-list');
  if (list) {
    list.innerHTML = p.steps.map((step, i) => `
      <li>
        <span class="process-step">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3>${esc(step.title)}</h3>
          <p>${esc(step.desc)}</p>
        </div>
      </li>
    `).join('');
  }
}

function renderServices(data) {
  const s = data.services;
  const section = document.getElementById('services');
  if (!section) return;

  const num = section.querySelector('.block-num');
  if (num) num.textContent = s.num;

  const title = section.querySelector('.block-title');
  if (title) title.textContent = s.title;

  const stack = section.querySelector('.service-stack');
  if (stack) {
    stack.innerHTML = s.items.map((item, i) => `
      <li>
        <span>${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.desc)}</p>
        </div>
      </li>
    `).join('');
  }
}

function renderTeam(data) {
  const t = data.team;
  const section = document.getElementById('team');
  if (!section) return;

  const num = section.querySelector('.block-num');
  if (num) num.textContent = t.num;

  const title = section.querySelector('.block-title');
  if (title) title.textContent = t.title;

  const text = section.querySelector('.block-text');
  if (text) text.textContent = t.text;

  const scroll = section.querySelector('.team-scroll');
  if (scroll) {
    scroll.innerHTML = t.members.map((m) => `
      <article class="team-card">
        <img src="${esc(m.image)}" alt="${esc(m.name)} — 線画ポートレート" width="1536" height="1024" loading="lazy" class="team-illust" />
        <h3>${esc(m.name)}</h3>
        <p>${esc(m.role)}</p>
      </article>
    `).join('');
  }
}

function renderVoices(data) {
  const v = data.voices;
  const section = document.getElementById('voices');
  if (!section) return;

  const num = section.querySelector('.block-num');
  if (num) num.textContent = v.num;

  const title = section.querySelector('.block-title');
  if (title) title.textContent = v.title;

  const text = section.querySelector('.block-text');
  if (text) text.textContent = v.text;

  const scroll = section.querySelector('.voices-scroll');
  if (scroll) {
    scroll.innerHTML = v.items.map((item) => `
      <blockquote class="voice-card">
        <figure class="voice-visual">
          <img src="${esc(item.image)}" alt="" width="1536" height="1024" loading="lazy" class="voice-illust" />
        </figure>
        <p>${esc(item.quote)}</p>
        <footer>${esc(item.attribution)}</footer>
      </blockquote>
    `).join('');
  }
}

function renderJournal(data) {
  const j = data.journal;
  const section = document.getElementById('journal');
  if (!section) return;

  const num = section.querySelector('.block-num');
  if (num) num.textContent = j.num;

  const title = section.querySelector('.block-title');
  if (title) title.textContent = j.title;

  const text = section.querySelector('.block-text');
  if (text) text.textContent = j.text;

  const list = section.querySelector('.journal-list');
  if (list) {
    list.innerHTML = j.posts.map((post) => `
      <li>
        <a href="${esc(post.url)}">
          <img src="${esc(post.image)}" alt="" width="1536" height="1024" loading="lazy" class="journal-illust" />
          <div>
            <time datetime="${esc(post.date)}">${esc(post.dateDisplay)}</time>
            <h3>${esc(post.title)}</h3>
          </div>
        </a>
      </li>
    `).join('');
  }
}

function renderFaq(data) {
  const f = data.faq;
  const section = document.getElementById('faq');
  if (!section) return;

  const num = section.querySelector('.block-num');
  if (num) num.textContent = f.num;

  const title = section.querySelector('.block-title');
  if (title) title.textContent = f.title;

  const text = section.querySelector('.block-text');
  if (text) text.textContent = f.text;

  const list = document.getElementById('faq-list');
  if (list) {
    list.innerHTML = f.items.map((item) => `
      <details class="faq-item">
        <summary>${esc(item.question)}</summary>
        <p>${esc(item.answer)}</p>
      </details>
    `).join('');
  }
}

function renderCta(data) {
  const c = data.cta;
  const band = document.querySelector('.cta-band');
  if (!band) return;

  const label = band.querySelector('.cta-band-label');
  if (label) label.textContent = c.label;

  const title = band.querySelector('.cta-band-title');
  if (title) title.innerHTML = c.title;

  const btn = band.querySelector('.cta-band-btn');
  if (btn) {
    btn.textContent = c.btnText;
    btn.href = c.btnHref;
  }
}

function renderContact(data) {
  const c = data.contact;
  const section = document.getElementById('contact');
  if (!section) return;

  const num = section.querySelector('.block-num');
  if (num) num.textContent = c.num;

  const title = section.querySelector('.block-title');
  if (title) title.textContent = c.title;

  const text = section.querySelector('.block-text');
  if (text) text.textContent = c.text;

  const email = section.querySelector('.contact-addr a');
  if (email) {
    email.href = `mailto:${c.email}`;
    email.textContent = c.email;
  }

  const addr = section.querySelector('.contact-addr span');
  if (addr) addr.textContent = c.address;

  section.dataset.successReply = c.successReply;
}

function renderFooter(data) {
  const logo = document.querySelector('.footer-logo');
  const copy = document.querySelector('.footer-copy');
  if (logo) logo.textContent = data.footer.logo;
  if (copy) copy.textContent = data.footer.copyright;
}

export function renderSite(data) {
  setMeta(data);
  renderHeader(data);
  renderHero(data);
  renderTicker(data);
  renderAbout(data);
  renderWorks(data);
  renderProcess(data);
  renderServices(data);
  renderTeam(data);
  renderVoices(data);
  renderJournal(data);
  renderFaq(data);
  renderCta(data);
  renderContact(data);
  renderFooter(data);
}
