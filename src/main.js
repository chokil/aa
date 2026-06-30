import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

/* --- Preloader --- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const progress = document.getElementById('preloader-progress');
  if (!preloader) return Promise.resolve();

  return new Promise((resolve) => {
    let pct = 0;
    const tick = setInterval(() => {
      pct += Math.random() * 18 + 8;
      if (pct >= 100) {
        pct = 100;
        clearInterval(tick);
        if (progress) progress.style.width = '100%';
        setTimeout(() => {
          preloader.classList.add('done');
          resolve();
        }, 400);
      } else if (progress) {
        progress.style.width = `${pct}%`;
      }
    }, 80);
  });
}

/* --- Lenis Smooth Scroll --- */
function initLenis() {
  if (prefersReducedMotion) return null;

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/* --- Custom Cursor --- */
function initCursor() {
  if (isMobile || prefersReducedMotion) return;

  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursor-dot');
  if (!cursor || !dot) return;

  let mx = 0;
  let my = 0;
  let cx = 0;
  let cy = 0;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = `${mx}px`;
    dot.style.top = `${my}px`;
  });

  const hoverables = 'a, button, .work-panel, [data-project]';
  document.addEventListener('mouseover', (e) => {
    cursor.classList.toggle('hover', !!e.target.closest(hoverables));
  });

  function tick() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    cursor.style.left = `${cx}px`;
    cursor.style.top = `${cy}px`;
    requestAnimationFrame(tick);
  }
  tick();
}

/* --- Hero Animation --- */
function initHero() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.char-wrap').forEach((el) => {
      el.style.transform = 'none';
    });
    const sub = document.getElementById('hero-sub');
    if (sub) { sub.style.opacity = '0.6'; sub.style.transform = 'none'; }
    return;
  }

  const tl = gsap.timeline({ delay: 0.3 });

  tl.to('.hero-line .char-wrap', {
    y: 0,
    duration: 1.1,
    stagger: 0.08,
    ease: 'power4.out',
  });

  tl.to('#hero-sub', {
    y: 0,
    opacity: 0.6,
    duration: 0.8,
    ease: 'power3.out',
  }, '-=0.4');
}

/* --- Marquee --- */
function initMarquee() {
  if (prefersReducedMotion || isMobile) return;

  const track = document.getElementById('marquee-track');
  if (!track) return;

  const totalWidth = track.scrollWidth / 2;

  gsap.to(track, {
    x: -totalWidth,
    duration: 20,
    ease: 'none',
    repeat: -1,
  });
}

/* --- Horizontal Works Scroll --- */
function initWorksScroll() {
  if (prefersReducedMotion || isMobile) return;

  const section = document.querySelector('.works-pin');
  const track = document.getElementById('works-track');
  if (!section || !track) return;

  const getScroll = () => track.scrollWidth - window.innerWidth + 200;

  gsap.to(track, {
    x: () => -getScroll(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => `+=${getScroll()}`,
      invalidateOnRefresh: true,
    },
  });
}

/* --- Scroll Reveals --- */
function initScrollAnimations() {
  if (prefersReducedMotion) return;

  gsap.utils.toArray('.statement-head, .works-title, .services-bleed-title, .contact-title, .voice-quote p').forEach((el) => {
    gsap.from(el, {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  gsap.utils.toArray('.service-row').forEach((el, i) => {
    gsap.from(el, {
      x: -40,
      opacity: 0,
      duration: 0.8,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/* --- Stats Counter --- */
function initCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach((el) => {
    const target = parseInt(el.dataset.target, 10);

    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          textContent: target,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
        });
      },
    });
  });
}

/* --- Dark Section Body Class --- */
function initDarkSections() {
  const darkSections = document.querySelectorAll('.hero, .services-bleed, .footer');

  darkSections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => document.body.classList.add('on-dark'),
      onLeave: () => document.body.classList.remove('on-dark'),
      onEnterBack: () => document.body.classList.add('on-dark'),
      onLeaveBack: () => document.body.classList.remove('on-dark'),
    });
  });
}

/* --- Active Nav --- */
function initActiveNav() {
  const links = document.querySelectorAll('.header-nav a[data-section]');
  const sections = [...links].map((l) => document.getElementById(l.dataset.section)).filter(Boolean);

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => setActive(section.id),
      onEnterBack: () => setActive(section.id),
    });
  });

  function setActive(id) {
    links.forEach((l) => l.classList.toggle('active', l.dataset.section === id));
  }
}

/* --- Mobile Menu --- */
let menuOpen = false;

function closeMenu() {
  const btn = document.getElementById('menu-btn');
  const overlay = document.getElementById('mobile-overlay');
  if (!btn || !overlay) return;

  menuOpen = false;
  btn.classList.remove('open');
  btn.setAttribute('aria-expanded', 'false');
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function initMobileMenu(lenis) {
  const btn = document.getElementById('menu-btn');
  const overlay = document.getElementById('mobile-overlay');
  if (!btn || !overlay) return;

  btn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    btn.classList.toggle('open', menuOpen);
    btn.setAttribute('aria-expanded', String(menuOpen));
    overlay.classList.toggle('open', menuOpen);
    overlay.setAttribute('aria-hidden', String(!menuOpen));
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (lenis) menuOpen ? lenis.stop() : lenis.start();
  });

  overlay.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      closeMenu();
      if (lenis) lenis.start();
    });
  });
}

/* --- Smooth Anchor --- */
function initAnchors(lenis) {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      closeMenu();

      if (lenis) {
        lenis.scrollTo(target, { offset: -64 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* --- Project Modal --- */
function initModal() {
  const modal = document.getElementById('modal');
  const bg = document.getElementById('modal-bg');
  const close = document.getElementById('modal-close');
  const panels = document.querySelectorAll('[data-project]');
  if (!modal) return;

  const tag = document.getElementById('modal-tag');
  const title = document.getElementById('modal-title');
  const desc = document.getElementById('modal-desc');
  const stats = document.getElementById('modal-stats');

  function open(panel) {
    tag.textContent = panel.dataset.tag || '';
    title.textContent = panel.dataset.title || '';
    desc.textContent = panel.dataset.desc || '';
    stats.textContent = panel.dataset.stats || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function shut() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  panels.forEach((p) => {
    p.addEventListener('click', () => open(p));
    p.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(p); }
    });
  });

  close?.addEventListener('click', shut);
  bg?.addEventListener('click', shut);
  modal.querySelector('.modal-cta')?.addEventListener('click', shut);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) shut();
  });
}

/* --- Contact Form --- */
function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value;
    form.innerHTML = `
      <div class="form-success">
        <h3>${name ? `Thank you, ${name}` : 'Thank you'}</h3>
        <p>2営業日以内にご返信いたします。</p>
      </div>
    `;
  });
}

/* --- Init --- */
async function init() {
  await initPreloader();

  const lenis = initLenis();
  initCursor();
  initHero();
  initMarquee();
  initWorksScroll();
  initScrollAnimations();
  initCounters();
  initDarkSections();
  initActiveNav();
  initMobileMenu(lenis);
  initAnchors(lenis);
  initModal();
  initForm();

  ScrollTrigger.refresh();
}

init();
