/* Render daftar kartu ke container [data-list]. Lokasi: frontend/pages/landing/assets/js/render.js
   Semua teks di-escape; URL gambar hanya https (data dari database dianggap tidak tepercaya). */
(function () {
  'use strict';
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = (u) => (typeof u === 'string' && /^https:\/\//i.test(u) ? esc(u) : '');
  const panel = 'rounded-2xl border border-line bg-panel box-border';

  const templates = {
    features: (f, i) => `
      <article class="card reveal ${panel} p-6" style="flex:1 1 min(240px,100%);--i:${i}">
        <div class="no font-display text-sm font-bold text-glow">${esc(f.no)}</div>
        <h3 class="font-display text-[22px] my-2">${esc(f.title)}</h3>
        <p class="m-0 text-[15px] text-mute">${esc(f.desc)}</p>
      </article>`,
    members: (m, i) => {
      const img = safeUrl(m.photoUrl);
      const avatar = img
        ? `<img src="${img}" alt="Foto ${esc(m.name)}" loading="lazy" class="aspect-square w-full rounded-[10px] object-cover">`
        : `<div class="flex aspect-square items-center justify-center rounded-[10px] bg-[#1B2A5C] font-display text-[44px] font-bold text-sky" aria-hidden="true">${esc(m.initial || (m.name || '?').charAt(0))}</div>`;
      return `
      <article class="card reveal ${panel} flex flex-col gap-3 p-5" style="flex:1 1 min(220px,100%);--i:${i}">
        ${avatar}
        <div><div class="nm font-display text-lg font-bold">${esc(m.name)}</div><div class="text-sm text-mute">${esc(m.bio)}</div></div>
      </article>`;
    },
    gallery: (g, i) => {
      const img = safeUrl(g.coverUrl);
      const inner = img
        ? `<img src="${img}" alt="${esc(g.title)}" loading="lazy" class="h-full w-full rounded-xl object-cover">`
        : `<svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7DB8FF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 9"/></svg><span class="text-[13px]">Foto dari Supabase Storage</span>`;
      return `
      <figure class="reveal m-0 flex flex-col gap-2.5" style="flex:1 1 min(300px,100%);--i:${i}">
        <div class="tile flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#2A4A94] bg-panel text-sky">${inner}</div>
        <figcaption class="font-semibold">${esc(g.title)}</figcaption>
      </figure>`;
    },
    notes: (n, i) => `
      <article class="card reveal box-border rounded-xl border border-line bg-ink p-5" style="flex:1 1 min(260px,100%);--i:${i}">
        <p class="m-0 mb-3 text-[15px] text-[#C9D2F0]">${esc(n.message)}</p>
        <div class="nm text-[13px] font-semibold text-sky">— ${esc(n.author)}</div>
      </article>`
  };
  const apiMap = { features: 'getFeatures', members: 'getMembers', gallery: 'getGallery', notes: 'getNotes' };

  async function renderLists() {
    const hosts = document.querySelectorAll('[data-list]');
    await Promise.all(Array.from(hosts).map(async (host) => {
      const key = host.getAttribute('data-list');
      const limit = parseInt(host.getAttribute('data-limit') || '0', 10);
      if (!templates[key]) return;
      try {
        let items = await window.CDE_API[apiMap[key]]();
        if (limit > 0) items = items.slice(0, limit);
        host.innerHTML = items.map(templates[key]).join('');
      } catch (err) {
        console.error('[CoDevEnger]', err);
        host.innerHTML = '<p class="text-mute">Konten belum tersedia.</p>';
      }
    }));
  }
  window.CDE_RENDER = { renderLists };
})();
