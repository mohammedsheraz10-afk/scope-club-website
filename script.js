/**
 * SCOPE Club — Main Script
 * Features: theme toggle, nav scroll, mobile menu, scroll reveal,
 * stat counter, event filter, form validation, back-to-top,
 * button ripple click effects.
 */

(function () {
  'use strict';

  /* ── HELPERS ─────────────────────────────────────────────────── */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ── THEME ───────────────────────────────────────────────────── */
  const html  = document.documentElement;
  const themeBtn = $('#themeToggle');

  function getStoredTheme() {
    return localStorage.getItem('scope-theme') || 'dark';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('scope-theme', theme);
  }

  function toggleTheme() {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  applyTheme(getStoredTheme());
  themeBtn?.addEventListener('click', toggleTheme);

  /* ── NAV SCROLL EFFECT ───────────────────────────────────────── */
  const nav = $('#nav');

  function updateNav() {
    nav?.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ── MOBILE MENU ─────────────────────────────────────────────── */
  const burger      = $('#navBurger');
  const mobileMenu  = $('#mobileMenu');
  const mobileOverlay = $('#mobileOverlay');
  const mobileClose = $('#mobileClose');

  function openMenu() {
    mobileMenu?.classList.add('open');
    mobileOverlay?.classList.add('open');
    burger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu?.classList.remove('open');
    mobileOverlay?.classList.remove('open');
    burger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger?.addEventListener('click', openMenu);
  mobileClose?.addEventListener('click', closeMenu);
  mobileOverlay?.addEventListener('click', closeMenu);

  /* Close on link click */
  $$('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* Escape key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── SCROLL REVEAL ───────────────────────────────────────────── */
  const reveals = $$('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => revealObs.observe(el));
  } else {
    /* Fallback for older browsers */
    reveals.forEach(el => el.classList.add('revealed'));
  }

  /* ── STAT COUNTER ────────────────────────────────────────────── */
  const statNums = $$('[data-count]');

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCount(el) {
    const target   = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1800;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      el.textContent = Math.floor(easeOutQuart(progress) * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }

    requestAnimationFrame(update);
  }

  if ('IntersectionObserver' in window) {
    const statObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNums.forEach(el => statObs.observe(el));
  } else {
    statNums.forEach(el => animateCount(el));
  }

  /* ── EVENT FILTER ────────────────────────────────────────────── */
  const filterBtns  = $$('.filter-btn');
  const eventCards  = $$('.event-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      /* Update active state */
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      /* Show/hide cards with animation */
      eventCards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;

        if (show) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          card.offsetHeight; /* reflow */
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* Add keyframe if not present */
  if (!document.querySelector('#scope-keyframes')) {
    const style = document.createElement('style');
    style.id = 'scope-keyframes';
    style.textContent = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── FORM VALIDATION ─────────────────────────────────────────── */
  const form       = $('#contactForm');
  const nameInput  = $('#name');
  const emailInput = $('#email');
  const nameErr    = $('#nameError');
  const emailErr   = $('#emailError');
  const submitBtn  = $('#submitBtn');
  const successMsg = $('#formSuccess');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(input, errEl, msg) {
    input.style.borderColor = '#ef4444';
    if (errEl) errEl.textContent = msg;
  }

  function clearError(input, errEl) {
    input.style.borderColor = '';
    if (errEl) errEl.textContent = '';
  }

  nameInput?.addEventListener('input', () => {
    if (nameInput.value.trim().length > 0) clearError(nameInput, nameErr);
  });

  emailInput?.addEventListener('input', () => {
    if (validateEmail(emailInput.value.trim())) clearError(emailInput, emailErr);
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;

    if (!nameInput?.value.trim()) {
      showError(nameInput, nameErr, 'Please enter your full name.');
      valid = false;
    } else {
      clearError(nameInput, nameErr);
    }

    if (!emailInput?.value.trim() || !validateEmail(emailInput.value.trim())) {
      showError(emailInput, emailErr, 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError(emailInput, emailErr);
    }

    if (!valid) return;

    /* Simulate submission */
    const btnText = submitBtn.querySelector('.btn__text');
    const btnIcon = submitBtn.querySelector('.btn__icon');

    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Sending…';
    if (btnIcon) btnIcon.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    setTimeout(() => {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Message';
      if (btnIcon) btnIcon.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';

      form.reset();
      successMsg.hidden = false;

      setTimeout(() => { successMsg.hidden = true; }, 5000);
    }, 1400);
  });

  /* ── BACK TO TOP ─────────────────────────────────────────────── */
  const backToTop = $('#backToTop');

  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ── BUTTON RIPPLE ───────────────────────────────────────────── */
  function addRipple(e) {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x    = e.clientX - rect.left - size / 2;
    const y    = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    btn.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
  }

  $$('.btn').forEach(btn => btn.addEventListener('click', addRipple));

  /* ── SMOOTH ANCHOR SCROLL ────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = nav?.offsetHeight || 72;
        const y = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ── ACTIVE NAV LINK ─────────────────────────────────────────── */
  const sections  = $$('section[id]');
  const navLinks  = $$('.nav__link:not(.nav__link--cta)');

  function updateActiveLink() {
    const scrollPos = window.scrollY + 100;

    sections.forEach(sec => {
      const top    = sec.offsetTop;
      const bottom = top + sec.offsetHeight;

      if (scrollPos >= top && scrollPos < bottom) {
        const id = sec.getAttribute('id');
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${id}`;
          link.style.color = active
            ? 'var(--text-primary)'
            : '';
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  /* ── PARALLAX HERO ORBS ──────────────────────────────────────── */
  const orbs = $$('.hero__orb');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = 0.08 + i * 0.04;
      orb.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
    });
  }, { passive: true });

  /* ── TITLE WORD HOVER TILT ───────────────────────────────────── */
  $$('.hero__title-word').forEach(word => {
    word.addEventListener('mousemove', (e) => {
      const rect = word.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const rx   = ((e.clientY - cy) / rect.height) * -10;
      const ry   = ((e.clientX - cx) / rect.width)  *  10;
      word.style.transform = `perspective(400px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.04)`;
    });

    word.addEventListener('mouseleave', () => {
      word.style.transform = '';
    });
  });

})();

/* ── INTRO SCREEN ─────────────────────────────────────────────── */
(function () {
  const intro = document.getElementById('introScreen');
  if (!intro) return;

  /* Lock scroll while intro is visible */
  document.body.style.overflow = 'hidden';

  function dismissIntro() {
    intro.classList.add('exit');

    /* After exit animation, fully remove and unlock scroll */
    intro.addEventListener('transitionend', () => {
      intro.classList.add('hidden');
      document.body.style.overflow = '';
    }, { once: true });
  }

  /* Dismiss on click, tap, or any key press */
  intro.addEventListener('click',     dismissIntro, { once: true });
  intro.addEventListener('touchstart', dismissIntro, { once: true, passive: true });
  document.addEventListener('keydown', dismissIntro, { once: true });
})();
