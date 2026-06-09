/* ============================================================
   KANWALJEET KAUR — PORTFOLIO SCRIPT
   ============================================================ */

/* ── HANGING BULB THEME TOGGLE ── */
(function initTheme() {
  const bulb  = document.getElementById('theme-bulb');
  const html  = document.documentElement;

  function applyTheme(theme) {
    html.dataset.theme = theme;
    bulb.classList.toggle('light-on', theme === 'light');
    localStorage.setItem('kk-theme', theme);
    /* notify particle system */
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  }

  /* Restore saved preference, default dark */
  applyTheme(localStorage.getItem('kk-theme') || 'dark');

  bulb.addEventListener('click', () => {
    /* Swing the bulb */
    bulb.classList.remove('swinging');
    void bulb.offsetWidth; /* force reflow to restart animation */
    bulb.classList.add('swinging');
    bulb.addEventListener('animationend', () => bulb.classList.remove('swinging'), { once: true });

    applyTheme(html.dataset.theme === 'light' ? 'dark' : 'light');
  });

  /* Keyboard accessibility */
  bulb.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bulb.click(); }
  });

  /* Hint animation is CSS-driven (bulb-auto-hint keyframe), no JS needed */
})();

/* ── NAVBAR SCROLL ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
  document.getElementById('back-to-top').classList.toggle('visible', window.scrollY > 400);
});

/* ── HAMBURGER MENU ── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ── BACK TO TOP ── */
document.getElementById('back-to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── REVEAL ON SCROLL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  const parent = el.parentElement;
  const siblings = [...parent.querySelectorAll('.reveal')];
  const idx = siblings.indexOf(el);
  el.dataset.delay = idx * 80;
  revealObserver.observe(el);
});

/* ── SKILL BAR ANIMATION ── */
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bar-fill').forEach(bar => {
        const target = bar.dataset.w;
        setTimeout(() => { bar.style.width = target + '%'; }, 200);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-cat').forEach(cat => barObserver.observe(cat));

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const step = 16;
  const increment = target / (duration / step);
  let current = 0;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current);
  }, step);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px 0px 0px' });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statObserver.observe(heroStats);

/* ── PARTICLE CANVAS ── */
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx    = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.r  = Math.random() * 1.5 + 0.3;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.gold  = Math.random() < 0.15;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10) this.reset(false);
    }
    draw() {
      const isLight = document.documentElement.dataset.theme === 'light';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.gold
        ? `rgba(201,168,76,${this.alpha})`
        : isLight
          ? `rgba(30,40,80,${this.alpha * 0.35})`
          : `rgba(148,163,184,${this.alpha * 0.6})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: 90 }, () => new Particle());
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });

    const isLight = document.documentElement.dataset.theme === 'light';
    /* draw subtle connecting lines */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const lineAlpha = 0.06 * (1 - dist / 100);
          ctx.strokeStyle = isLight
            ? `rgba(30,40,80,${lineAlpha * 0.5})`
            : `rgba(201,168,76,${lineAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  loop();
})();

/* ── TYPED TEXT EFFECT ── */
(function initTyped() {
  const phrases = [
    'scalable SaaS platforms.',
    'AI-powered applications.',
    'real-time collaboration tools.',
    'cloud-native architectures.',
    'clean, tested APIs.',
    'products that ship.',
  ];
  const el = document.getElementById('typed');
  if (!el) return;
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const phrase = phrases[phraseIdx];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++charIdx);
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(type, 2200);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }
    setTimeout(type, deleting ? 40 : 65);
  }
  setTimeout(type, 800);
})();

/* ── TESTIMONIALS SLIDER ── */
(function initSlider() {
  const track   = document.getElementById('testimonials-track');
  const dotsWrap = document.getElementById('testi-dots');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0;
  let perView = getPerView();
  let maxIdx  = Math.max(0, cards.length - perView);
  let autoTimer;

  function getPerView() {
    return 1;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const count = Math.max(1, cards.length - perView + 1);
    for (let i = 0; i < count; i++) {
      const d = document.createElement('div');
      d.className = 'testi-dot' + (i === current ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function getCardWidth() {
    return track.parentElement.offsetWidth;
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIdx));
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    updateDots();
  }

  document.getElementById('testi-prev').addEventListener('click', () => {
    goTo(current - 1);
    resetAuto();
  });
  document.getElementById('testi-next').addEventListener('click', () => {
    goTo(current + 1);
    resetAuto();
  });

  function autoPlay() {
    autoTimer = setInterval(() => {
      goTo(current < maxIdx ? current + 1 : 0);
    }, 4000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    autoPlay();
  }

  window.addEventListener('resize', () => {
    perView = getPerView();
    maxIdx  = Math.max(0, cards.length - perView);
    current = Math.min(current, maxIdx);
    buildDots();
    goTo(current);
  });

  buildDots();
  goTo(0);
  autoPlay();
})();

/* ── STAR RATING ── */
(function () {
  const stars = document.querySelectorAll('#star-rating span');
  const ratingInput = document.getElementById('r-rating');
  if (!stars.length) return;

  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      const val = +star.dataset.val;
      stars.forEach(s => s.classList.toggle('hover', +s.dataset.val <= val));
    });
    star.addEventListener('mouseout', () => {
      stars.forEach(s => s.classList.remove('hover'));
    });
    star.addEventListener('click', () => {
      const val = +star.dataset.val;
      ratingInput.value = val;
      stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= val));
    });
  });
})();

/* ── REVIEW FORM → SUPABASE ── */
document.getElementById('review-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const success = document.getElementById('review-success');
  const rating = document.getElementById('r-rating').value;
  if (!rating) { alert('Please select a star rating.'); return; }

  btn.textContent = 'Submitting…';
  btn.disabled = true;

  const reviewName    = document.getElementById('r-name').value.trim();
  const reviewRole    = document.getElementById('r-role').value.trim();
  const reviewMessage = document.getElementById('r-review').value.trim();
  const reviewRating  = parseInt(rating);

  const { error } = await _supa.from('portfolio_reviews').insert({
    name:    reviewName,
    role:    reviewRole,
    rating:  reviewRating,
    message: reviewMessage
  });

  if (error) {
    btn.textContent = 'Submit Review →';
    btn.disabled = false;
    alert('Error: ' + error.message + ' | Code: ' + error.code);
    console.error('Supabase error:', error);
    return;
  }

  /* Send email notification via EmailJS */
  emailjs.send('kanwaljeetkaur0304@gmail', 'template_tc89r0q', {
    name:    'Portfolio Review System',
    email:   'noreply@portfolio.com',
    subject: '⭐ New Review Submitted — Action Required',
    budget:  reviewRating + ' / 5 stars',
    message: '🆕 New review on your portfolio!\n\n' +
             'Name: ' + reviewName + '\n' +
             'Role: ' + reviewRole + '\n' +
             'Rating: ' + reviewRating + '/5 ⭐\n\n' +
             'Review:\n' + reviewMessage + '\n\n' +
             '👉 Approve it here:\nhttps://supabase.com/dashboard/project/xpopxgxtxaqdrfgfltjw/editor'
  }).catch(err => console.warn('Email notification failed:', err));

  btn.textContent = 'Submit Review →';
  btn.disabled = false;
  success.classList.add('show');
  this.reset();
  document.querySelectorAll('#star-rating span').forEach(s => s.classList.remove('active'));
  document.getElementById('r-rating').value = '';
  setTimeout(() => success.classList.remove('show'), 6000);
});

/* ── LOAD APPROVED REVIEWS INTO TESTIMONIALS ── */
async function loadApprovedReviews() {
  const { data, error } = await _supa
    .from('portfolio_reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return;

  const track = document.getElementById('testimonials-track');
  const dotsWrap = document.getElementById('testi-dots');

  data.forEach(review => {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const initials = review.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const card = document.createElement('div');
    card.className = 'testimonial-card glass-card';
    card.innerHTML = `
      <div class="stars">${stars}</div>
      <p class="testi-text">"${review.message}"</p>
      <div class="testi-author">
        <div class="testi-avatar">${initials}</div>
        <div>
          <p class="testi-name">${review.name}</p>
          <p class="testi-role gold">${review.role}</p>
        </div>
      </div>`;
    track.appendChild(card);
  });

  /* rebuild dots now that new cards are added */
  const allCards = track.querySelectorAll('.testimonial-card');
  dotsWrap.innerHTML = '';
  allCards.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'testi-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => {
      const w = track.parentElement.offsetWidth;
      track.style.transform = `translateX(-${i * w}px)`;
      dotsWrap.querySelectorAll('.testi-dot').forEach((dot, j) => dot.classList.toggle('active', j === i));
    });
    dotsWrap.appendChild(d);
  });
}

loadApprovedReviews();

/* ── CONTACT FORM ── */
document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const success = document.getElementById('form-success');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  emailjs.sendForm('kanwaljeetkaur0304@gmail', 'template_tc89r0q', this)
    .then(() => {
      btn.textContent = 'Send Message →';
      btn.disabled = false;
      success.textContent = '✅ Message sent! I\'ll get back to you soon.';
      success.classList.add('show');
      this.reset();
      setTimeout(() => success.classList.remove('show'), 6000);
    })
    .catch((err) => {
      btn.textContent = 'Send Message →';
      btn.disabled = false;
      success.textContent = '❌ Something went wrong. Please email me directly.';
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 6000);
      console.error('EmailJS error:', err);
    });
});

/* ── NAV PILL (sliding hover indicator) ── */
(function initNavPill() {
  const pill     = document.getElementById('nav-pill');
  const linkList = document.getElementById('nav-links');
  if (!pill || !linkList) return;

  const links = [...linkList.querySelectorAll('a:not(.nav-cta)')];

  function movePillTo(el) {
    const parentRect = linkList.getBoundingClientRect();
    const rect       = el.getBoundingClientRect();
    pill.style.left  = (rect.left - parentRect.left) + 'px';
    pill.style.width = rect.width + 'px';
    pill.classList.add('show');
  }

  links.forEach(link => {
    link.addEventListener('mouseenter', () => movePillTo(link));
  });

  linkList.addEventListener('mouseleave', () => {
    /* snap pill back to active link, or hide if none */
    const active = linkList.querySelector('a.nav-active');
    if (active) movePillTo(active);
    else pill.classList.remove('show');
  });
})();

/* ── ACTIVE NAV LINK HIGHLIGHTING ── */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('#nav-links a:not(.nav-cta)');
const pill       = document.getElementById('nav-pill');
const linkList   = document.getElementById('nav-links');

function setActiveLink(id) {
  navAnchors.forEach(a => {
    const isActive = a.getAttribute('href') === '#' + id;
    a.classList.toggle('nav-active', isActive);
  });

  /* keep pill parked on active link when mouse is away */
  const active = linkList && linkList.querySelector('a.nav-active');
  if (active && pill) {
    const parentRect = linkList.getBoundingClientRect();
    const rect       = active.getBoundingClientRect();
    pill.style.left  = (rect.left - parentRect.left) + 'px';
    pill.style.width = rect.width + 'px';
    pill.classList.add('show');
  }
}

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) setActiveLink(entry.target.id);
  });
}, { threshold: 0.35 });

sections.forEach(s => activeObserver.observe(s));
