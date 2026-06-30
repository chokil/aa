/* ============================================
   翠光 SUIGO — Core Interactions
   ============================================ */

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-up');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  elements.forEach((el) => observer.observe(el));
}

function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        closeMobileMenu();
        const offset = 72;
        const position = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: position, behavior: 'smooth' });
      }
    });
  });
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target, parseInt(entry.target.dataset.target, 10));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => observer.observe(c));
}

function animateCounter(el, target) {
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value;

    form.innerHTML = `
      <div class="form-success">
        <h3>${name ? `${name} さん、ありがとうございます` : 'お問い合わせありがとうございます'}</h3>
        <p>2 営業日以内にご返信いたします。</p>
      </div>
    `;
  });
}

function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  }, { passive: true });
}

function initActiveNav() {
  const navLinks = document.querySelectorAll('.desktop-nav a[data-section]');
  const sections = Array.from(navLinks)
    .map((link) => document.getElementById(link.dataset.section))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === id);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const backdrop = document.getElementById('modal-backdrop');
  const closeBtn = document.getElementById('modal-close');
  const cards = document.querySelectorAll('.work-row[data-title]');

  if (!modal) return;

  const tagEl = document.getElementById('modal-tag');
  const titleEl = document.getElementById('modal-title');
  const descEl = document.getElementById('modal-desc');
  const statsEl = document.getElementById('modal-stats');

  function openModal(card) {
    tagEl.textContent = card.dataset.tag || '';
    titleEl.textContent = card.dataset.title || '';
    descEl.textContent = card.dataset.desc || '';
    statsEl.textContent = card.dataset.stats || '';

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  modal.querySelector('.modal-cta')?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

let mobileMenuOpen = false;

function closeMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  mobileMenuOpen = false;
  btn.classList.remove('active');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'メニューを開く');
  nav.classList.remove('open');
  nav.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    mobileMenuOpen = !mobileMenuOpen;

    if (mobileMenuOpen) {
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'メニューを閉じる');
      nav.classList.add('open');
      nav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } else {
      closeMobileMenu();
    }
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenuOpen) closeMobileMenu();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initNavbar();
  initSmoothScroll();
  initCounters();
  initContactForm();
  initScrollProgress();
  initActiveNav();
  initBackToTop();
  initProjectModal();
  initMobileMenu();
});
