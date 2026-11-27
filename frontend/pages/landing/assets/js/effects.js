/* Efek interaksi: scroll reveal, tilt kartu, garis komik saat scroll, musik, intro.
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

  /* ---------- Animasi scroll: garis sisi + laba-laba menuruni benang ---------- */
  function initScrollCone() {
    const cone = document.getElementById('cone'), rider = document.getElementById('rider');
    const handle = rider && rider.querySelector('.rider-handle');
    if (!cone || !rider || !handle) return;
    let last = window.scrollY, timer = null, ticking = false;
    let drag = null;
    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const trackRange = () => Math.max(1, window.innerHeight - handle.offsetHeight);
    const syncHandle = () => {
      const max = maxScroll();
      const progress = max ? window.scrollY / max : 0;
      const y = handle.offsetHeight / 2 + progress * Math.max(0, window.innerHeight - handle.offsetHeight);
      rider.style.setProperty('--ry', y + 'px');
      handle.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    };
    const scrollTo = (top) => window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    const update = () => {
      ticking = false;
      const y = window.scrollY, dy = y - last; last = y;
      syncHandle();
      if (Math.abs(dy) < 1) return;
      if (!reduce) {
        cone.classList.add('on'); cone.classList.toggle('dn', dy > 0); cone.classList.toggle('up', dy < 0);
        rider.style.setProperty('--rot', dy > 0 ? '90deg' : '-90deg');
        clearTimeout(timer); timer = setTimeout(() => cone.classList.remove('on'), 280);
      }
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', syncHandle, { passive: true });
    syncHandle();

    handle.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || drag) return;
      drag = { id: e.pointerId, startY: e.clientY, startScroll: window.scrollY, moved: false };
      document.documentElement.classList.add('scroll-dragging');
      handle.setPointerCapture(e.pointerId);
      window.scrollTo({ top: window.scrollY, behavior: 'auto' });
    });
    handle.addEventListener('pointermove', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const delta = e.clientY - drag.startY;
      if (Math.abs(delta) > 3 && !drag.moved) {
        drag.moved = true;
      }
      if (drag.moved) window.scrollTo({ top: drag.startScroll + (delta * maxScroll()) / trackRange(), behavior: 'auto' });
    });
    const endDrag = (e, cancelled) => {
      if (!drag || drag.id !== e.pointerId) return;
      const moved = drag.moved;
      drag = null;
      document.documentElement.classList.remove('scroll-dragging');
      if (handle.hasPointerCapture(e.pointerId)) handle.releasePointerCapture(e.pointerId);
      if (!moved && !cancelled) scrollTo(0);
    };
    handle.addEventListener('pointerup', (e) => endDrag(e, false));
    handle.addEventListener('pointercancel', (e) => endDrag(e, true));
    handle.addEventListener('keydown', (e) => {
      let target;
      if (e.key === 'Home' || e.key === 'Enter' || e.key === ' ') target = 0;
      else if (e.key === 'End') target = maxScroll();
      else if (e.key === 'ArrowUp') target = window.scrollY - 40;
      else if (e.key === 'ArrowDown') target = window.scrollY + 40;
      else if (e.key === 'PageUp') target = window.scrollY - window.innerHeight * 0.9;
      else if (e.key === 'PageDown') target = window.scrollY + window.innerHeight * 0.9;
      else return;
      e.preventDefault();
      scrollTo(Math.max(0, Math.min(maxScroll(), target)));
    });
  }

  /* ---------- Backsound: file audio (config.MUSIC_URL) ----------
     Browser memblokir autoplay, jadi: coba putar saat halaman dibuka; jika ditolak, mulai otomatis
     pada interaksi pertama pengunjung (klik/tap/tombol keyboard). Posisi lagu dilanjutkan antar halaman. */
  function initMusic() {
    const btn = document.getElementById('music-btn'), label = document.getElementById('music-label');
    if (!btn) return;
    const cfg = window.APP_CONFIG || {};
    const SRC = cfg.MUSIC_URL || 'assets/audio/background-music.mp3';
    const VOL = 0.35, K_ON = 'cde_music_on', K_MUTED = 'cde_music_muted', K_T = 'cde_music_t';
    const store = {
      get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
      set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* abaikan */ } },
      del: (k) => { try { sessionStorage.removeItem(k); } catch (e) { /* abaikan */ } }
    };
    const audio = new Audio();
    audio.src = SRC; audio.loop = true; audio.preload = 'metadata'; audio.volume = 0;
    let on = false, fade = null;

    const ui = (v) => { on = v; btn.setAttribute('aria-pressed', String(v)); label.textContent = v ? 'Musik: Hidup' : 'Musik: Mati'; };
    function fadeTo(target, ms, done) {
      clearInterval(fade);
      const from = audio.volume, steps = Math.max(1, Math.round(ms / 50)); let i = 0;
      fade = setInterval(() => {
        i++; audio.volume = Math.min(1, Math.max(0, from + ((target - from) * i) / steps));
        if (i >= steps) { clearInterval(fade); if (done) done(); }
      }, 50);
    }

    /* --- kontrol utama --- */
    async function start() {
      try {
        const t = parseFloat(store.get(K_T) || '0');
        if (t > 0) {
          const seek = () => { try { if (audio.duration) audio.currentTime = t % audio.duration; } catch (e) { /* abaikan */ } };
          if (audio.readyState >= 1) seek(); else audio.addEventListener('loadedmetadata', seek, { once: true });
        }
        await audio.play();
        fadeTo(VOL, 1500); ui(true); store.set(K_ON, '1'); store.del(K_MUTED);
        return true;
      } catch (e) {
        if (e && e.name === 'NotAllowedError') return false;   // autoplay diblokir -> tunggu interaksi
        console.error('[CoDevEnger] File musik gagal dimuat.', e);
        return false;
      }
    }
    function stop() {
      ui(false); store.del(K_ON); store.set(K_MUTED, '1');
      fadeTo(0, 500, () => audio.pause());
    }

    btn.addEventListener('click', () => { if (on) stop(); else start(); });

    // simpan posisi lagu agar halaman berikutnya melanjutkan; jeda saat tab disembunyikan
    window.addEventListener('pagehide', () => { if (on) store.set(K_T, String(audio.currentTime || 0)); audio.pause(); });
    document.addEventListener('visibilitychange', () => {
      if (!on) return;
      if (document.hidden) audio.pause(); else audio.play().catch(() => { });
    });

    // otomatis: coba putar sekarang; bila diblokir, mulai pada interaksi pertama (kecuali pengunjung sudah mematikannya)
    if (store.get(K_MUTED) !== '1') {
      start().then((ok) => {
        if (ok) return;
        const events = ['pointerdown', 'keydown', 'touchstart'];
        const once = (e) => {
          if (e.target && e.target.closest && e.target.closest('#music-btn')) return; // biar tombol yang mengatur
          events.forEach((n) => window.removeEventListener(n, once, true));
          if (!on && store.get(K_MUTED) !== '1') start();
        };
        events.forEach((n) => window.addEventListener(n, once, true));
      });
    }
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