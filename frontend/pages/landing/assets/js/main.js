/* Entry point semua halaman publik. Lokasi: frontend/pages/landing/assets/js/main.js
   Urutan: pasang layout -> render data -> aktifkan efek. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', async () => {
    window.CDE_COMPONENTS.mount();
    await window.CDE_RENDER.renderLists();
    window.CDE_EFFECTS.init();
  });
})();
