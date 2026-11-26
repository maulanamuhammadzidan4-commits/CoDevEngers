/* Efek interaksi: scroll reveal, tilt kartu, animasi scroll mengerucut, musik, intro.
   Lokasi: frontend/pages/landing/assets/js/effects.js. Tanpa library; semua menghormati "kurangi gerakan". */
(function () {
  'use strict';
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal:not(.is-visible)');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Tilt kartu mengikuti kursor (event delegation, tahan untuk kartu dinamis) ---------- */
  function initTilt() {
    if (reduce) return;
    const SEL = '.card,.tile';
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const el = e.target.closest && e.target.closest(SEL);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transition = 'transform .08s ease-out, border-color .25s';
      el.style.transform = `perspective(700px) rotateX(${((0.5 - y) * 12).toFixed(2)}deg) rotateY(${((x - 0.5) * 14).toFixed(2)}deg) translateY(-6px) scale(1.02)`;
      el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
    }, { passive: true });
    document.addEventListener('pointerout', (e) => {
      const el = e.target.closest && e.target.closest(SEL);
      if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return;
      el.style.transition = 'transform .5s ease, border-color .25s';
      el.style.transform = '';
    });
  }

  /* ---------- Animasi scroll: garis mengerucut + laba-laba menuruni benang ---------- */
  function initScrollCone() {
    if (reduce) return;
    const cone = document.getElementById('cone'), rider = document.getElementById('rider');
    if (!cone || !rider) return;
    let last = window.scrollY, timer = null, ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY, dy = y - last; last = y;
      if (Math.abs(dy) < 1) return;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      cone.classList.add('on'); cone.classList.toggle('dn', dy > 0); cone.classList.toggle('up', dy < 0);
      rider.style.setProperty('--ry', 50 + (y / max) * (window.innerHeight - 150) + 'px');
      rider.style.setProperty('--rot', dy > 0 ? '90deg' : '-90deg');
      clearTimeout(timer); timer = setTimeout(() => cone.classList.remove('on'), 280);
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  }

  /* ---------- Musik latar orisinal (Web Audio, tanpa file audio) ----------
     Browser memblokir autoplay -> musik hanya mulai setelah pengunjung menekan tombol. */
  function initMusic() {
    const btn = document.getElementById('music-btn'), label = document.getElementById('music-label');
    if (!btn) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { btn.hidden = true; return; }
    let ac = null, master = null, timer = null;

    function start() {
      ac = new AC();
      master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
      master.gain.linearRampToValueAtTime(0.22, ac.currentTime + 1.5);
      const delay = ac.createDelay(1.0); delay.delayTime.value = 0.42;
      const fb = ac.createGain(); fb.gain.value = 0.38;
      const wet = ac.createGain(); wet.gain.value = 0.5;
      delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500;
      const lfo = ac.createOscillator(); lfo.frequency.value = 0.08;
      const lfoGain = ac.createGain(); lfoGain.gain.value = 250;
      lfo.connect(lfoGain); lfoGain.connect(lp.frequency); lfo.start();
      lp.connect(master);
      [55, 82.41, 110].forEach((f, i) => {
        const o = ac.createOscillator(); o.type = i === 1 ? 'triangle' : 'sine'; o.frequency.value = f;
        const g = ac.createGain(); g.gain.value = i === 2 ? 0.25 : 0.4;
        o.connect(g); g.connect(lp); o.start();
      });
      const scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];
      const pattern = [0,2,4,5,4,2,3,1, 0,2,4,6,5,4,2,1, 0,3,4,5,6,5,4,3, 2,4,5,4,3,2,1,0];
      let step = 0;
      const tick = () => {
        const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
        o.type = 'triangle';
        o.frequency.value = scale[pattern[step % pattern.length]] * (step % 16 === 15 ? 0.5 : 1);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0008, t + 1.3);
        o.connect(g); g.connect(master); g.connect(delay);
        o.start(t); o.stop(t + 1.4); step++;
      };
      tick(); timer = setInterval(tick, 430);
    }
    function stop() {
      clearInterval(timer); timer = null;
      const ctx = ac; ac = null;
      if (ctx) { master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4); setTimeout(() => ctx.close().catch(() => {}), 600); }
    }
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      if (on) start(); else stop();
      btn.setAttribute('aria-pressed', String(on));
      label.textContent = on ? 'Musik: Hidup' : 'Musik: Mati';
    });
    window.addEventListener('pagehide', stop);
  }

  /* ---------- Intro: sekali per sesi ---------- */
  function initIntro() {
    if (document.documentElement.classList.contains('intro-on')) {
      try { sessionStorage.setItem('cde_intro', '1'); } catch (e) { /* abaikan */ }
    }
  }

  function init() {
    if (reduce) document.querySelectorAll('svg').forEach((s) => s.pauseAnimations && s.pauseAnimations());
    initIntro(); initReveal(); initTilt(); initScrollCone(); initMusic();
  }
  window.CDE_EFFECTS = { init, initReveal };
})();
