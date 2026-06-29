/* ============================================
   翠光 SUIGO — Interactive Engine
   ============================================ */

// --- Particle System ---
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: -1000, y: -1000 };
    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  init() {
    const count = Math.min(70, Math.floor((this.width * this.height) / 16000));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.2 + 0.4,
        opacity: Math.random() * 0.4 + 0.08,
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140 && dist > 0) {
        const force = (140 - dist) / 140;
        p.vx -= (dx / dist) * force * 0.018;
        p.vy -= (dy / dist) * force * 0.018;
      }

      p.vx *= 0.99;
      p.vy *= 0.99;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(62, 207, 142, ${p.opacity})`;
      this.ctx.fill();
    }

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          const opacity = ((110 - dist) / 110) * 0.1;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.strokeStyle = `rgba(107, 140, 255, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// --- Cursor Glow ---
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  let mouseX = 0;
  let mouseY = 0;
  let glowX = 0;
  let glowY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function update() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;
    requestAnimationFrame(update);
  }

  update();
}

// --- Scroll Reveal ---
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

// --- Navbar Scroll ---
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// --- Smooth Scroll ---
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        closeMobileMenu();
        const offset = 76;
        const position = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: position, behavior: 'smooth' });
      }
    });
  });
}

// --- Counter Animation ---
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
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// --- Magnetic Buttons ---
function initMagneticButtons() {
  document.querySelectorAll('.magnetic-btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const strength = parseInt(btn.dataset.strength, 10) || 20;

      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
      const inner = btn.querySelector('span');
      if (inner) {
        inner.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      const inner = btn.querySelector('span');
      if (inner) inner.style.transform = '';
    });
  });
}

// --- Contact Form ---
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value;

    form.innerHTML = `
      <div class="form-success">
        <div class="form-success-icon">✨</div>
        <h3>${name ? `${name} さん、ありがとうございます！` : 'お問い合わせありがとうございます！'}</h3>
        <p>2営業日以内にご返信いたします。しばらくお待ちください。</p>
      </div>
    `;
  });
}

// --- Parallax ---
function initParallax() {
  const orbs = document.querySelectorAll('.orb');
  if (!orbs.length) return;

  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = (i + 1) * 0.04;
      orb.style.transform = `translateY(${scroll * speed}px)`;
    });
  });
}

// --- Mobile Menu ---
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
    if (e.key === 'Escape' && mobileMenuOpen) {
      closeMobileMenu();
    }
  });
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('particle-canvas');
  if (canvas) new ParticleSystem(canvas);

  initCursorGlow();
  initScrollReveal();
  initNavbar();
  initSmoothScroll();
  initCounters();
  initMagneticButtons();
  initContactForm();
  initParallax();
  initMobileMenu();
});
