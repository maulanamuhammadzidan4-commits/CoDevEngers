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

  /* ---------- Backsound: file audio (config.MUSIC_URL), fallback ke musik sintesis ----------
     Browser memblokir autoplay, jadi: coba putar saat halaman dibuka; jika ditolak, mulai otomatis
     pada interaksi pertama pengunjung (klik/tap/tombol keyboard). Posisi lagu dilanjutkan antar halaman. */
  function initMusic() {
    const btn = document.getElementById('music-btn'), label = document.getElementById('music-label');
    if (!btn) return;
    const cfg = window.APP_CONFIG || {};
    const SRC = cfg.MUSIC_URL || 'assets/audio/ini-abadi.mp3';
    const VOL = 0.35, K_ON = 'cde_music_on', K_MUTED = 'cde_music_muted', K_T = 'cde_music_t';
    const store = {
      get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
      set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* abaikan */ } },
      del: (k) => { try { sessionStorage.removeItem(k); } catch (e) { /* abaikan */ } }
    };
    const audio = new Audio();
    audio.src = SRC; audio.loop = true; audio.preload = 'metadata'; audio.volume = 0;
    let on = false, fade = null, synth = null;

    const ui = (v) => { on = v; btn.setAttribute('aria-pressed', String(v)); label.textContent = v ? 'Musik: Hidup' : 'Musik: Mati'; };
    function fadeTo(target, ms, done) {
      clearInterval(fade);
      const from = audio.volume, steps = Math.max(1, Math.round(ms / 50)); let i = 0;
      fade = setInterval(() => {
        i++; audio.volume = Math.min(1, Math.max(0, from + ((target - from) * i) / steps));
        if (i >= steps) { clearInterval(fade); if (done) done(); }
      }, 50);
    }

    /* --- fallback sintesis (dipakai hanya jika file audio gagal dimuat) --- */
    function startSynth() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC || synth) return;
      const ac = new AC(), master = ac.createGain();
      master.gain.value = 0; master.connect(ac.destination); master.gain.linearRampToValueAtTime(0.22, ac.currentTime + 1.5);
      const delay = ac.createDelay(1.0); delay.delayTime.value = 0.42;
      const fb = ac.createGain(); fb.gain.value = 0.38; const wet = ac.createGain(); wet.gain.value = 0.5;
      delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; lp.connect(master);
      [55, 82.41, 110].forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain(); o.type = i === 1 ? 'triangle' : 'sine'; o.frequency.value = f;
        g.gain.value = i === 2 ? 0.25 : 0.4; o.connect(g); g.connect(lp); o.start();
      });
      const scale = [220, 261.63, 293.66, 329.63, 392, 440, 523.25];
      const pattern = [0, 2, 4, 5, 4, 2, 3, 1, 0, 2, 4, 6, 5, 4, 2, 1, 0, 3, 4, 5, 6, 5, 4, 3, 2, 4, 5, 4, 3, 2, 1, 0];
      let step = 0;
      const tick = () => {
        const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
        o.type = 'triangle'; o.frequency.value = scale[pattern[step % pattern.length]];
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0008, t + 1.3);
        o.connect(g); g.connect(master); g.connect(delay); o.start(t); o.stop(t + 1.4); step++;
      };
      tick(); synth = { ac, master, timer: setInterval(tick, 430) };
    }
    function stopSynth() {
      if (!synth) return;
      const s = synth; synth = null; clearInterval(s.timer);
      s.master.gain.linearRampToValueAtTime(0, s.ac.currentTime + 0.4);
      setTimeout(() => s.ac.close().catch(() => { }), 600);
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
        console.warn('[CoDevEnger] File musik gagal dimuat, memakai musik sintesis.', e);
        startSynth(); ui(true); store.set(K_ON, '1'); store.del(K_MUTED);
        return true;
      }
    }
    function stop() {
      ui(false); store.del(K_ON); store.set(K_MUTED, '1');
      stopSynth(); fadeTo(0, 500, () => audio.pause());
    }

    btn.addEventListener('click', () => { if (on) stop(); else start(); });

    // simpan posisi lagu agar halaman berikutnya melanjutkan; jeda saat tab disembunyikan
    window.addEventListener('pagehide', () => { if (on) store.set(K_T, String(audio.currentTime || 0)); audio.pause(); stopSynth(); });
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