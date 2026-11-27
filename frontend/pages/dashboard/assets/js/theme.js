/* Tema terang/gelap bersama. Lokasi: frontend/pages/dashboard/assets/js/theme.js
   Dimuat di <head> (sebelum render) agar tidak berkedip. Preferensi disimpan di LocalStorage "cde_theme". Default: gelap. */
(function () {
  'use strict';
  var K = 'cde_theme', root = document.documentElement;
  function read() { try { return localStorage.getItem(K); } catch (e) { return null; } }
  function label() {
    var dark = root.getAttribute('data-theme') === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', dark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap');
      b.setAttribute('title', dark ? 'Mode gelap aktif' : 'Mode terang aktif');
    });
  }
  // Transisi halus hanya saat pengguna mengganti tema (kelas dipasang sementara, tidak aktif saat load)
  var animT;
  function animate() {
    root.classList.add('theme-anim');
    clearTimeout(animT);
    animT = setTimeout(function () { root.classList.remove('theme-anim'); }, 450);
  }
  function set(t) {
    if (root.getAttribute('data-theme') !== t) animate();
    root.setAttribute('data-theme', t);
    try { localStorage.setItem(K, t); } catch (e) { /* mode privat: tema tetap berubah, hanya tidak tersimpan */ }
    label();
  }
  root.setAttribute('data-theme', read() === 'light' ? 'light' : 'dark');
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-theme-toggle]')) set(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  document.addEventListener('DOMContentLoaded', label);
  // Matahari tampil saat mode terang, bulan saat mode gelap (diatur dashboard.css)
  window.CDE_THEME = {
    set: set,
    btn: function (cls) {
      return '<button type="button" data-theme-toggle class="themebtn ' + (cls || '') + '">' +
        '<svg class="i-sun" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>' +
        '<svg class="i-moon" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg></button>';
    }
  };
})();
