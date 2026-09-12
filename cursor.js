/**
 * SCOPE Club — Canvas Cursor
 * Adapted from the useCanvasCursor hook pattern (plain JS, no React).
 * Draws a smooth trailing particle cursor with click bursts.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  /* ─── CONFIG ──────────────────────────────────────────────────── */
  const CONFIG = {
    TAIL_LENGTH:    22,
    BASE_RADIUS:     4,
    SPEED:           0.18,
    GLOW_BLUR:      18,
    CLICK_PARTICLES: 14,
  };

  /* ─── STATE ───────────────────────────────────────────────────── */
  let mouse   = { x: -200, y: -200 };
  let cursor  = { x: -200, y: -200 };
  let tail    = [];          // trailing dots
  let particles = [];        // click burst particles
  let animId  = null;
  let rafScheduled = false;

  /* ─── ACCENT COLOR (read from CSS var) ───────────────────────── */
  function accentColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'light' ? '#a07840' : '#c9a96e';
  }

  function accentColorRgb() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'light' ? '160,120,64' : '201,169,110';
  }

  /* ─── RESIZE ──────────────────────────────────────────────────── */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* ─── INIT TAIL ───────────────────────────────────────────────── */
  function initTail() {
    tail = Array.from({ length: CONFIG.TAIL_LENGTH }, () => ({
      x: -200, y: -200,
    }));
  }

  /* ─── PARTICLE CLASS ──────────────────────────────────────────── */
  function createParticles(x, y) {
    for (let i = 0; i < CONFIG.CLICK_PARTICLES; i++) {
      const angle = (Math.PI * 2 / CONFIG.CLICK_PARTICLES) * i + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 3.5;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.025 + Math.random() * 0.025,
        radius: 2 + Math.random() * 3,
      });
    }
  }

  /* ─── DRAW LOOP ───────────────────────────────────────────────── */
  function draw() {
    animId = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Smooth cursor follow */
    cursor.x += (mouse.x - cursor.x) * CONFIG.SPEED;
    cursor.y += (mouse.y - cursor.y) * CONFIG.SPEED;

    /* Update tail — each point chases the previous */
    tail[0].x += (cursor.x - tail[0].x) * 0.45;
    tail[0].y += (cursor.y - tail[0].y) * 0.45;

    for (let i = 1; i < tail.length; i++) {
      tail[i].x += (tail[i - 1].x - tail[i].x) * 0.42;
      tail[i].y += (tail[i - 1].y - tail[i].y) * 0.42;
    }

    const rgb = accentColorRgb();

    /* Draw connecting lines between tail nodes */
    for (let i = 0; i < tail.length - 1; i++) {
      const alpha = (1 - i / tail.length) * 0.35;
      ctx.beginPath();
      ctx.moveTo(tail[i].x, tail[i].y);
      ctx.lineTo(tail[i + 1].x, tail[i + 1].y);
      ctx.strokeStyle = `rgba(${rgb},${alpha})`;
      ctx.lineWidth   = (1 - i / tail.length) * 2.5;
      ctx.stroke();
    }

    /* Draw tail dots */
    for (let i = 0; i < tail.length; i++) {
      const progress = 1 - i / tail.length;
      const r        = CONFIG.BASE_RADIUS * progress;
      const alpha    = progress * 0.7;

      ctx.save();
      ctx.shadowColor = accentColor();
      ctx.shadowBlur  = CONFIG.GLOW_BLUR * progress;
      ctx.beginPath();
      ctx.arc(tail[i].x, tail[i].y, Math.max(r, 0.1), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${alpha})`;
      ctx.fill();
      ctx.restore();
    }

    /* Draw main cursor dot */
    ctx.save();
    ctx.shadowColor = accentColor();
    ctx.shadowBlur  = 24;
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, CONFIG.BASE_RADIUS + 1.5, 0, Math.PI * 2);
    ctx.fillStyle   = accentColor();
    ctx.fill();
    ctx.restore();

    /* Outer ring on cursor */
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, CONFIG.BASE_RADIUS + 8, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgb},0.25)`;
    ctx.lineWidth   = 1;
    ctx.stroke();

    /* Click burst particles */
    particles = particles.filter(p => p.life > 0);

    for (const p of particles) {
      p.x    += p.vx;
      p.y    += p.vy;
      p.vx   *= 0.93;
      p.vy   *= 0.93;
      p.life -= p.decay;

      ctx.save();
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.shadowColor = accentColor();
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      ctx.fillStyle = accentColor();
      ctx.fill();
      ctx.restore();
    }
  }

  /* ─── EVENT LISTENERS ─────────────────────────────────────────── */
  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function onClick(e) {
    createParticles(e.clientX, e.clientY);
  }

  /* Touch support */
  function onTouchMove(e) {
    const t = e.touches[0];
    if (t) { mouse.x = t.clientX; mouse.y = t.clientY; }
  }

  function onTouchStart(e) {
    const t = e.touches[0];
    if (t) createParticles(t.clientX, t.clientY);
  }

  /* ─── MAGNETIC ELEMENTS ───────────────────────────────────────── */
  function initMagnetic() {
    const magnetics = document.querySelectorAll('.btn, .nav__link--cta, .theme-toggle, .back-to-top, .team-card__social, .social-btn');

    magnetics.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect   = el.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) * 0.35;
        const dy     = (e.clientY - cy) * 0.35;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ─── CURSOR SCALE ON HOVER ───────────────────────────────────── */
  const hoverTargets = 'a, button, [role="tab"], .event-card, .resource-card, .team-card, .whatwedo__card, .tag';

  let isHovering = false;

  document.addEventListener('mouseover', (e) => {
    if (e.target.matches && e.target.closest(hoverTargets)) {
      isHovering = true;
      CONFIG.BASE_RADIUS = 7;
      CONFIG.GLOW_BLUR   = 28;
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.matches && e.target.closest(hoverTargets)) {
      isHovering = false;
      CONFIG.BASE_RADIUS = 4;
      CONFIG.GLOW_BLUR   = 18;
    }
  });

  /* ─── INIT ────────────────────────────────────────────────────── */
  function init() {
    resize();
    initTail();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click',     onClick);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchstart',onTouchStart,{ passive: true });
    draw();
    initMagnetic();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
