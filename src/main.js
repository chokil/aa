import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Preloader --- */
function initPreloader() {
  const el = document.getElementById('preloader');
  const bar = document.getElementById('preloader-progress');
  if (!el) return Promise.resolve();

  return new Promise((resolve) => {
    let pct = 0;
    const iv = setInterval(() => {
      pct += 22;
      if (pct >= 100) {
        clearInterval(iv);
        if (bar) bar.style.width = '100%';
        setTimeout(() => { el.classList.add('done'); resolve(); }, 300);
      } else if (bar) {
        bar.style.width = `${pct}%`;
      }
    }, 60);
  });
}

/* --- Hero --- */
function initHero() {
  if (reduced) {
    document.querySelectorAll('.char-wrap').forEach((c) => { c.style.transform = 'none'; });
    const sub = document.getElementById('hero-sub');
    if (sub) sub.style.opacity = '0.55';
    return;
  }

  const tl = gsap.timeline({ delay: 0.15 });
  tl.to('.char-wrap', { y: 0, duration: 0.9, stagger: 0.07, ease: 'power4.out' });
  tl.to('#hero-sub', { opacity: 0.55, duration: 0.6, ease: 'power2.out' }, '-=0.3');
}

/* --- Ticker --- */
function initTicker() {
  if (reduced) return;
  const track = document.getElementById('ticker-track');
  if (!track) return;

  gsap.to(track, {
    x: -(track.scrollWidth / 2),
    duration: 14,
    ease: 'none',
    repeat: -1,
  });
}

/* --- Works Carousel Dots --- */
function initCarousel() {
  const carousel = document.getElementById('works-carousel');
  const dots = document.querySelectorAll('#carousel-dots span');
  if (!carousel || !dots.length) return;

  carousel.addEventListener('scroll', () => {
    const cardW = carousel.querySelector('.work-card')?.offsetWidth || 1;
    const gap = 12;
    const idx = Math.round(carousel.scrollLeft / (cardW + gap));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }, { passive: true });
}

/* --- Counters --- */
function initCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach((el) => {
    const target = +el.dataset.target;
    if (reduced) { el.textContent = target; return; }

    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          textContent: target,
          duration: 1.5,
          ease: 'power2.out',
          snap: { textContent: 1 },
        });
      },
    });
  });
}

/* --- Scroll Reveals --- */
function initReveals() {
  if (reduced) return;

  gsap.utils.toArray('.block-title, .voice-block p').forEach((el) => {
    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });
}

/* --- Tab Bar Active --- */
function initTabbar() {
  const tabs = document.querySelectorAll('.tabbar a[data-section]');
  const sections = [...tabs].map((t) => document.getElementById(t.dataset.section)).filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          tabs.forEach((t) => t.classList.toggle('active', t.dataset.section === e.target.id));
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((s) => observer.observe(s));

  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      const href = tab.getAttribute('href');
      if (!href) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      }
    });
  });
}

/* --- Bottom Sheet --- */
function initSheet() {
  const sheet = document.getElementById('sheet');
  const bg = document.getElementById('sheet-bg');
  const close = document.getElementById('sheet-close');
  const cta = document.getElementById('sheet-cta');
  const cards = document.querySelectorAll('[data-project]');
  if (!sheet) return;

  const tag = document.getElementById('sheet-tag');
  const title = document.getElementById('sheet-title');
  const desc = document.getElementById('sheet-desc');
  const stats = document.getElementById('sheet-stats');

  function open(card) {
    tag.textContent = card.dataset.tag || '';
    title.textContent = card.dataset.title || '';
    desc.textContent = card.dataset.desc || '';
    stats.textContent = card.dataset.stats || '';
    sheet.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function shut() {
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cards.forEach((c) => {
    c.addEventListener('click', () => open(c));
  });

  close?.addEventListener('click', shut);
  bg?.addEventListener('click', shut);
  cta?.addEventListener('click', shut);

  let startY = 0;
  const panel = sheet.querySelector('.sheet-panel');
  panel?.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
  panel?.addEventListener('touchend', (e) => {
    if (e.changedTouches[0].clientY - startY > 80) shut();
  }, { passive: true });
}

/* --- Contact --- */
function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value;
    form.innerHTML = `
      <div class="form-success">
        <h3>${name ? `${name} さん、ありがとうございます` : '送信完了'}</h3>
        <p>2営業日以内にご返信します。</p>
      </div>
    `;
  });
}

/* --- Init --- */
async function init() {
  await initPreloader();
  initHero();
  initTicker();
  initCarousel();
  initCounters();
  initReveals();
  initTabbar();
  initSheet();
  initForm();
  ScrollTrigger.refresh();
}

init();
