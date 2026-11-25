/* Komponen layout reusable (nav, footer, dekorasi hero, overlay). Lokasi: frontend/assets/js/components.js
   Dipasang ke elemen [data-slot="..."] pada setiap halaman, jadi perubahan cukup dilakukan di satu tempat. */
(function () {
  'use strict';
  const LINKS = [
    ['home', 'index.html', 'Beranda'], ['keunggulan', 'keunggulan.html', 'Keunggulan'],
    ['anggota', 'anggota.html', 'Anggota'], ['galeri', 'galeri.html', 'Galeri'],
    ['wali-kelas', 'wali-kelas.html', 'Ruang Wali Kelas']
  ];
  const f1 = (n) => Math.round(n * 10) / 10;

  function spiderDefs() {
    const cfg = [[7, 25], [3, 8], [-3, -8], [-7, -25]];
    let legs = '';
    cfg.forEach(([x, a], i) => {
      [['1', '0s', '-0.3s'], ['-1', '-0.3s', '0s']].forEach(([sc, b1, b2]) => {
        const begin = i % 2 === 0 ? b1 : b2;
        legs += `<g transform="translate(${x},0) scale(1,${sc}) rotate(${a})"><g><animateTransform attributeName="transform" type="rotate" values="-12;12;-12" dur="0.6s" begin="${begin}" repeatCount="indefinite"/><path d="M0,0 L5,-12 L1,-24"/></g></g>`;
      });
    });
    return `<svg class="spiders" aria-hidden="true" width="0" height="0" style="position:absolute"><defs><g id="spider">
      <g stroke="#7DB8FF" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">${legs}</g>
      <ellipse cx="-4" cy="0" rx="11" ry="8" fill="#101A3C" stroke="#7DB8FF" stroke-width="2"/>
      <path d="M-11,0 L-5,-4 L1,0 L-5,4Z" fill="#C81D25"/>
      <circle cx="9" cy="0" r="6" fill="#101A3C" stroke="#7DB8FF" stroke-width="2"/>
      <circle cx="12" cy="-2.5" r="1.5" fill="#FF5A5F"/><circle cx="12" cy="2.5" r="1.5" fill="#FF5A5F"/></g></defs></svg>`;
  }

  function ring(r, n) {
    const pts = [];
    for (let k = 0; k < n; k++) { const a = (k * 2 * Math.PI) / n; pts.push([f1(280 + r * Math.cos(a)), f1(280 + r * Math.sin(a))]); }
    return pts;
  }
  function webSvg() {
    let spokes = '', polys = '';
    ring(260, 12).forEach(([x, y]) => { spokes += `<line x1="280" y1="280" x2="${x}" y2="${y}"/>`; });
    [60, 120, 180, 240].forEach((r) => { polys += `<polygon points="${ring(r, 12).map((p) => p.join(',')).join(' ')}"/>`; });
    const r120 = ring(120, 12);
    const hl = r120.map((p) => p.join(',')).join(' ');
    // jalur laba-laba: dari tepi, turun lewat satu benang, lalu mengelilingi cincin ke-2
    const order = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const path = 'M280,20 ' + order.map((i) => 'L' + r120[i].join(',')).join(' ') + ' L280,20 Z';
    const crawler = (scale, dur, extra) => `<g><use href="#spider" transform="scale(${scale})"/><animateMotion dur="${dur}s" repeatCount="indefinite" rotate="auto" ${extra || ''} path="${path}"/></g>`;
    return `<svg class="web spiders" aria-hidden="true" viewBox="0 0 560 560" style="position:absolute;right:-60px;top:-30px;width:640px;max-width:90%;opacity:.9">
      <g stroke="#2A4A94" stroke-width="1.5" fill="none">${spokes}${polys}</g>
      <polygon class="pulse" points="${hl}" fill="#C81D25" fill-opacity="0.18" stroke="#FF5A5F" stroke-width="2"/>
      ${crawler(0.75, 26)}${crawler(0.55, 20, 'keyPoints="1;0" keyTimes="0;1" calcMode="linear"')}</svg>
      <svg class="spiders dangle" aria-hidden="true" viewBox="0 0 90 340" style="position:absolute;right:4%;top:0;width:90px;height:340px">
      <line x1="45" y1="0" x2="45" y2="60" stroke="#7DB8FF" stroke-width="1.5" opacity="0.7"><animate attributeName="y2" values="60;190;60" keyTimes="0;0.5;1" dur="8s" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" repeatCount="indefinite"/></line>
      <g><animateTransform attributeName="transform" type="translate" values="0 0;0 130;0 0" keyTimes="0;0.5;1" dur="8s" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" repeatCount="indefinite"/>
      <g transform="translate(45,60) rotate(90) scale(.9)"><use href="#spider"/></g></g></svg>`;
  }

  function bat(style, begin, dur, swoopStyle) {
    const kt = '0;.08;.17;.26;.35;.44;.53;.62;.71;.8;.95;1';
    const wl = '0;-35;28;-35;28;-35;28;-35;28;10;10;0', wr = '0;35;-28;35;-28;35;-28;35;-28;-10;-10;0';
    const wing = (vals, left) => `<g transform="translate(32,18)"><g><animateTransform attributeName="transform" type="rotate" values="${vals}" keyTimes="${kt}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/><path d="${left
      ? 'M0,0 C-8,-12 -22,-14 -32,-6 C-26,-6 -24,-1 -21,4 C-17,-1 -12,1 -8,6 C-5,3 -2,3 0,6 Z'
      : 'M0,0 C8,-12 22,-14 32,-6 C26,-6 24,-1 21,4 C17,-1 12,1 8,6 C5,3 2,3 0,6 Z'}"/></g></g>`;
    return `<div class="bat" style="${style}"><div class="swoop" style="${swoopStyle}"><svg width="64" height="40" viewBox="0 0 64 40" style="overflow:visible">
      <g fill="#1B2A5C" stroke="#7DB8FF" stroke-width="1.4" stroke-linejoin="round">${wing(wl, true)}${wing(wr, false)}
      <ellipse cx="32" cy="20" rx="4" ry="8"/><circle cx="32" cy="11" r="3.6"/><path d="M29,9 L28,3 L31,7 Z M35,9 L36,3 L33,7 Z"/></g>
      <circle cx="30.8" cy="10.5" r=".8" fill="#FF5A5F"/><circle cx="33.2" cy="10.5" r=".8" fill="#FF5A5F"/></svg></div></div>`;
  }

  function sky() {
    let stars = '', flies = '';
    for (let i = 0; i < 18; i++) stars += `<div class="star" style="left:${(i * 53 + 11) % 97}%;top:${(i * 37 + 7) % 55}%;animation-delay:-${(i * 0.7).toFixed(1)}s;animation-duration:${2.5 + (i % 4)}s"></div>`;
    for (let i = 0; i < 8; i++) flies += `<div class="fly" style="left:${((i * 41 + 8) % 90) + 4}%;top:${40 + ((i * 23) % 40)}%;animation-delay:-${i}s,-${(i * 0.6).toFixed(1)}s;animation-duration:${6 + (i % 4)}s,${2 + (i % 3)}s"></div>`;
    return `<div aria-hidden="true" style="position:absolute;inset:0;pointer-events:none"><div class="moon"></div>${stars}${flies}
      ${bat('top:12%;animation-duration:24s', 0, 1.7, 'animation-duration:6s')}
      ${bat('top:30%;animation-duration:32s;animation-delay:-12s;transform:scale(.75)', -0.6, 2.0, 'animation-duration:7.5s;animation-delay:-2s')}
      ${bat('top:21%;animation-duration:28s;animation-delay:-20s;transform:scale(.55)', -1.1, 1.5, 'animation-duration:5s;animation-delay:-3s')}</div>`;
  }

  function skyline() {
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const b = [[115,60,60,80],[175,90,55,50],[230,40,60,100],[290,80,70,60],[360,50,55,90],[415,95,70,45],[485,30,65,110],[550,70,60,70],[610,100,80,40],[690,55,60,85],[750,85,70,55],[820,35,55,105],[875,75,75,65],[950,95,60,45],[1010,45,65,95],[1075,80,55,60],[1130,60,60,80],[1190,40,90,100]];
    let rects = '', wins = '';
    b.forEach(([x, y, w, h]) => {
      rects += `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
      for (let wx = x + 8; wx < x + w - 8; wx += 14) for (let wy = y + 10; wy < 130; wy += 16) {
        if (rnd() < 0.3) {
          const cls = ['win', 'win wb', 'win wc'][Math.floor(rnd() * 3)];
          wins += `<rect class="${cls}" x="${wx}" y="${wy}" width="6" height="8" fill="${rnd() < 0.35 ? '#FFD166' : '#7DB8FF'}"/>`;
        }
      }
    });
    const house = `<polygon points="0,95 55,58 110,95" fill="#16224A"/><rect x="10" y="95" width="90" height="45" fill="#121C42"/>
      <rect class="win" x="28" y="105" width="24" height="20" fill="#FFD166"/><path d="M28,105 L52,125 M40,105 L52,115 M28,115 L40,125" stroke="#7DB8FF" stroke-width="1" fill="none"/>
      <rect x="68" y="108" width="18" height="32" fill="#0A1128"/>
      <line x1="98" y1="95" x2="98" y2="108" stroke="#7DB8FF" stroke-width="1"><animate attributeName="y2" values="108;124;108" dur="5s" repeatCount="indefinite"/></line>
      <g><animateTransform attributeName="transform" type="translate" values="0 0;0 16;0 0" dur="5s" repeatCount="indefinite"/><g transform="translate(98,112) rotate(90) scale(.22)"><use href="#spider"/></g></g>`;
    return `<svg class="spiders anim-up" aria-hidden="true" viewBox="0 0 1280 140" preserveAspectRatio="xMidYMax slice" style="position:absolute;left:0;bottom:0;width:100%;height:140px"><g fill="#0E1838">${rects}</g>${house}${wins}</svg>`;
  }

  function cornerWeb(dur) {
    const ang = [0, 22.5, 45, 67.5, 90].map((a) => (a * Math.PI) / 180);
    const pt = (r, a) => [f1(r * Math.cos(a)), f1(r * Math.sin(a))];
    const spokes = ang.map((a) => { const [x, y] = pt(140, a); return `<line x1="0" y1="0" x2="${x}" y2="${y}"/>`; }).join('');
    const rings = [130, 90, 50].map((r) => `<polyline points="${ang.map((a) => pt(r, a).join(',')).join(' ')}"/>`).join('');
    const p90 = ang.map((a) => pt(90, a));
    const path = 'M' + p90.map((p) => p.join(',')).join(' L') + ' L' + p90.slice(0, -1).reverse().map((p) => p.join(',')).join(' L') + ' Z';
    return `<svg class="spiders corner" aria-hidden="true" viewBox="0 0 140 140" style="position:absolute;right:0;top:0;width:140px;height:140px;transform:scaleX(-1);pointer-events:none">
      <g stroke="#2A4A94" stroke-width="1.5" fill="none">${spokes}${rings}</g>
      <g><use href="#spider" transform="scale(.3)"/><animateMotion dur="${dur}s" repeatCount="indefinite" rotate="auto" path="${path}"/></g></svg>`;
  }

  function nav(active) {
    const items = LINKS.map(([key, href, label]) => `<a class="nl text-[#C9D2F0] no-underline" href="${href}"${key === active ? ' aria-current="page" style="color:#fff;font-weight:600"' : ''}>${label}</a>`).join('');
    return `<nav class="anim-drop mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6" aria-label="Navigasi utama">
      <a href="index.html" class="flex items-center gap-2.5 text-snow no-underline">
        <svg width="32" height="32" viewBox="0 0 32 32" role="img" aria-label="Logo CoDevEnger"><polygon points="16,2 28,9 28,23 16,30 4,23 4,9" fill="#C81D25"/><polygon points="16,8 22,11.5 22,20.5 16,24 10,20.5 10,11.5" fill="#0A1128"/></svg>
        <span class="font-display text-xl font-bold tracking-wide">CoDevEnger</span></a>
      <div class="flex flex-wrap items-center gap-5 text-[15px]">${items}
        <a class="btn rounded-lg bg-brand px-[22px] py-[11px] font-semibold text-white no-underline" href="login.html">Masuk Anggota</a></div></nav>`;
  }

  function overlays() {
    let lines = '';
    for (let k = 0; k < 16; k++) {
      const a = (k * 2 * Math.PI) / 16;
      lines += `<line class="cl" x1="${f1(50 + 90 * Math.cos(a))}" y1="${f1(50 + 90 * Math.sin(a))}" x2="${f1(50 + 6 * Math.cos(a))}" y2="${f1(50 + 6 * Math.sin(a))}"/>`;
    }
    return `<div id="cone" class="cone" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <g stroke="#4DA3FF" stroke-width="0.25" fill="none" opacity="0.7">${lines}</g>
      <g fill="none" stroke="#FF5A5F" stroke-width="0.3"><circle class="cr" cx="50" cy="50" r="40"/><circle class="cr" style="animation-delay:-0.3s" cx="50" cy="50" r="40"/><circle class="cr" style="animation-delay:-0.6s" cx="50" cy="50" r="40"/></g></svg></div>
      <div id="rider" class="rider" aria-hidden="true"><div class="th"></div><svg width="40" height="40" viewBox="-20 -20 40 40"><use href="#spider" transform="scale(.6)"/></svg></div>
      <button type="button" id="music-btn" class="music" aria-pressed="false" aria-label="Putar atau hentikan musik latar">
        <span class="eqs" aria-hidden="true"><i class="eq"></i><i class="eq" style="animation-delay:-.3s"></i><i class="eq" style="animation-delay:-.6s"></i></span>
        <svg class="ico-off" aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7DB8FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>
        <span id="music-label">Musik: Mati</span></button>`;
  }

  function intro() {
    return `<div class="intro" aria-hidden="true"><svg width="260" height="210" viewBox="0 0 260 210" style="max-width:80%">
      <line x1="130" y1="0" x2="130" y2="0" stroke="#7DB8FF" stroke-width="1.5"><animate attributeName="y2" from="0" to="90" dur="0.8s" fill="freeze"/></line>
      <g><animateTransform attributeName="transform" type="translate" from="0 0" to="0 90" dur="0.8s" fill="freeze"/><g transform="translate(130,0) rotate(90)"><use href="#spider"/></g></g>
      <g class="pop"><polygon points="130,128 157.7,144 157.7,176 130,192 102.3,176 102.3,144" fill="#C81D25"/><polygon points="130,144 143.9,152 143.9,168 130,176 116.1,168 116.1,152" fill="#0A1128"/></g></svg>
      <div class="font-display font-bold text-[clamp(22px,6vw,30px)] tracking-wider anim-in" style="animation-delay:.9s">CoDevEnger</div>
      <div class="h-[3px] w-40 overflow-hidden rounded-sm bg-line"><div class="bar h-full bg-glow"></div></div></div>`;
  }

  function footer() {
    return `<footer class="mx-auto mt-14 flex max-w-[1120px] flex-wrap justify-between gap-3 border-t border-line px-4 pb-8 pt-10 text-sm text-mute sm:px-6">
      <span>© 2026 CoDevEnger · Code Developer avEnger</span><span>Halaman ini hanya menampilkan informasi publik.</span></footer>`;
  }

  function mount() {
    const active = document.body.getAttribute('data-page');
    const slots = {
      intro, nav: () => nav(active), overlays, footer,
      'hero-decor': () => spiderDefs() + sky() + webSvg() + skyline(),
      'corner-web': null
    };
    document.querySelectorAll('[data-slot]').forEach((el) => {
      const name = el.getAttribute('data-slot');
      if (name === 'corner-web') { el.outerHTML = cornerWeb(parseInt(el.getAttribute('data-dur') || '12', 10)); return; }
      if (slots[name]) el.outerHTML = slots[name]();
    });
    // pastikan <defs> laba-laba ada walau halaman tanpa hero-decor
    if (!document.getElementById('spider')) document.body.insertAdjacentHTML('afterbegin', spiderDefs());
  }
  window.CDE_COMPONENTS = { mount };
})();
