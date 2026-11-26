/* Dashboard anggota CoDevEnger (SIMULASI frontend). Lokasi: frontend/assets/js/dashboard/app.js
   - Data disimpan di LocalStorage ("cde_dash_v1") dan hanya contoh; belum terhubung ke backend.
   - Peran siswa/admin hanya mengatur tampilan, BUKAN keamanan. Hak akses sebenarnya harus di backend (RLS).
   - Titik integrasi backend: ganti load()/save() dengan pemanggilan API. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const T0 = new Date(); T0.setHours(0, 0, 0, 0);
  const off = (n) => { const d = new Date(T0); d.setDate(d.getDate() + n); return ymd(d); };
  const diff = (s) => Math.round((new Date(s + 'T00:00:00') - T0) / 864e5);
  const fdate = (s) => new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const TODAY = DAYS[T0.getDay()];

  /* ---------- Data contoh ---------- */
  const g = '[Nama Guru]';
  const SCHEDULE = {
    Senin: [['07.00–08.30', 'Pemrograman Web'], ['08.30–10.00', 'Basis Data'], ['10.15–11.45', 'Matematika']],
    Selasa: [['07.00–08.30', 'Bahasa Inggris'], ['08.30–10.00', 'Pemrograman Web'], ['10.15–11.45', 'PKN']],
    Rabu: [['07.00–08.30', 'Basis Data'], ['08.30–10.00', 'Bahasa Indonesia'], ['10.15–11.45', 'Pemrograman Web']],
    Kamis: [['07.00–08.30', 'Matematika'], ['08.30–10.00', 'Pemrograman Web'], ['10.15–11.45', 'Bahasa Inggris']],
    Jumat: [['07.00–08.30', 'PJOK'], ['08.30–10.00', 'Basis Data']],
    Sabtu: [], Minggu: []
  };
  const PIKET = { Senin: ['[Nama 1]', '[Nama 2]', '[Nama 3]'], Selasa: ['[Nama 4]', '[Nama 5]', '[Nama 6]'], Rabu: ['[Nama 7]', '[Nama 8]', '[Nama 9]'], Kamis: ['[Nama 10]', '[Nama 11]', '[Nama 12]'], Jumat: ['[Nama 13]', '[Nama 14]', '[Nama 15]'] };
  const seed = () => ({
    tasks: [
      { id: 1, mapel: 'Pemrograman Web', judul: 'Halaman profil kelas', desc: '[Deskripsi tugas]', due: off(-1), status: 'proses', prio: 'tinggi' },
      { id: 2, mapel: 'Basis Data', judul: 'Rancang ERD perpustakaan', desc: '[Deskripsi tugas]', due: off(1), status: 'belum', prio: 'tinggi' },
      { id: 3, mapel: 'Matematika', judul: 'Latihan soal bab 4', desc: '[Deskripsi tugas]', due: off(3), status: 'belum', prio: 'sedang' },
      { id: 4, mapel: 'Bahasa Inggris', judul: 'Presentasi singkat', desc: '[Deskripsi tugas]', due: off(6), status: 'proses', prio: 'sedang' },
      { id: 5, mapel: 'PKN', judul: 'Rangkuman materi', desc: '[Deskripsi tugas]', due: off(-4), status: 'selesai', prio: 'rendah' }],
    att: ['hadir', 'hadir', 'hadir', 'izin', 'hadir', 'sakit', 'hadir', 'alpa'].map((s, i) => ({ id: i + 1, nama: '[Nama Siswa]', tgl: off(-i - 1), status: s, ket: s === 'hadir' ? '' : '[Keterangan]', verif: i > 2 ? 'terverifikasi' : 'menunggu' }))
      .concat([{ id: 9, nama: '[Nama Siswa 2]', tgl: off(-1), status: 'hadir', ket: '', verif: 'menunggu' }, { id: 10, nama: '[Nama Siswa 2]', tgl: off(-2), status: 'sakit', ket: '[Keterangan]', verif: 'menunggu' }]),
    albums: [1, 2, 3, 4, 5, 6].map((n) => ({ id: n, title: '[Judul album ' + n + ']', desc: '[Deskripsi kegiatan]', count: 8 + n, hue: [350, 215, 355, 205, 345, 225][n - 1], pub: n % 3 !== 0 })),
    notes: [{ id: 1, author: '[Nama Siswa 1]', text: '[Ucapan apresiasi untuk wali kelas]' }, { id: 2, author: '[Nama Siswa 2]', text: '[Ucapan apresiasi untuk wali kelas]' }],
    ngl: [{ id: 1, text: '[Pesan contoh yang sudah disetujui]', status: 'disetujui' }, { id: 2, text: '[Pesan contoh menunggu moderasi]', status: 'menunggu' }]
  });
  const KEY = 'cde_dash_v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch (e) { return seed(); } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* tidak tersimpan */ } };
  let S = load();
  const role = () => { try { return localStorage.getItem('cde_role') === 'admin' ? 'admin' : 'siswa'; } catch (e) { return 'siswa'; } };
  const isAdmin = () => role() === 'admin';
  const ME = () => (isAdmin() ? 'Admin Kelas' : '[Nama Siswa]');
  const F = { from: '', st: '', task: 'semua', q: '' };
  const nextId = (a) => a.reduce((m, x) => Math.max(m, x.id), 0) + 1;
  const hit = (...t) => !F.q || t.join(' ').toLowerCase().includes(F.q.toLowerCase());

  /* ---------- Potongan UI ---------- */
  const TONE = { ok: 'bg-ok/15 text-ok', warn: 'bg-warn/15 text-warn', err: 'bg-err/15 text-err', info: 'bg-sky/15 text-sky', mute: 'bg-line/60 text-mute' };
  const B = (t, tone) => `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[tone]}">${esc(t)}</span>`;
  const ATT_T = { hadir: 'ok', izin: 'info', sakit: 'warn', alpa: 'err' }, VER_T = { terverifikasi: 'ok', menunggu: 'warn', ditolak: 'err' };
  const TASK_T = { belum: 'mute', proses: 'info', selesai: 'ok', terlambat: 'err' }, PRIO_T = { tinggi: 'err', sedang: 'warn', rendah: 'mute' };
  const tstat = (t) => (t.status !== 'selesai' && diff(t.due) < 0 ? 'terlambat' : t.status);
  const sisa = (t) => { const d = diff(t.due); return t.status === 'selesai' ? 'Selesai' : d < 0 ? 'Terlambat ' + -d + ' hari' : d === 0 ? 'Hari ini' : d === 1 ? 'Besok' : d + ' hari lagi'; };
  const head = (t, sub, act) => `<div class="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 class="text-2xl font-bold">${t}</h1>${sub ? `<p class="mt-1 text-sm text-mute">${sub}</p>` : ''}</div>${act || ''}</div>`;
  const stat = (l, v, ic, tone) => `<div class="pnl flex items-center gap-3"><span class="grid h-11 w-11 place-items-center rounded-xl ${TONE[tone]}"><i data-lucide="${ic}"></i></span><div><div class="text-2xl font-bold leading-none">${v}</div><div class="mt-1 text-xs text-mute">${l}</div></div></div>`;
  const empty = (t) => `<p class="rounded-xl border border-dashed border-line p-6 text-center text-sm text-mute">${t}</p>`;
  const deadlineRow = (t) => { const late = tstat(t) === 'terlambat'; return `<li class="flex items-center justify-between gap-3 rounded-xl border border-line p-3 ${late ? 'border-l-4 border-l-err' : ''}"><div class="min-w-0"><div class="truncate font-semibold">${esc(t.judul)}</div><div class="text-xs text-mute">${esc(t.mapel)} · ${fdate(t.due)}</div></div><div class="shrink-0 text-right">${B(sisa(t), late ? 'err' : diff(t.due) <= 1 ? 'warn' : 'mute')}<div class="mt-1">${B('Prioritas ' + t.prio, PRIO_T[t.prio])}</div></div></li>`; };
  const openTasks = () => S.tasks.filter((t) => t.status !== 'selesai').sort((a, b) => a.due.localeCompare(b.due));

  /* ---------- Halaman ---------- */
  const VIEWS = {
    home() {
      const a = openTasks(), mine = S.att.filter((x) => isAdmin() || x.nama === ME());
      const pct = mine.length ? Math.round((mine.filter((x) => x.status === 'hadir').length / mine.length) * 100) : 0;
      const jd = SCHEDULE[TODAY] || [];
      return `<section class="relative mb-5 overflow-hidden rounded-3xl bg-[#05070f] text-white">
        <img src="assets/img/dashboard/spiderman.webp" alt="" class="absolute right-0 top-0 h-full w-full object-cover object-[50%_28%] opacity-40 sm:w-1/2 sm:opacity-100" style="-webkit-mask-image:linear-gradient(to right,transparent,#000 45%);mask-image:linear-gradient(to right,transparent,#000 45%)">
        <div class="relative max-w-[560px] p-6 sm:p-9"><p class="text-sm text-[#AAB4D4]">${TODAY}, ${fdate(ymd(T0))}</p>
          <h1 class="mt-2 text-3xl font-bold leading-tight sm:text-4xl">Halo, ${esc(ME())}</h1>
          <p class="mt-3 text-[#C9D2F0]">${a.length ? `Ada ${a.length} tugas aktif, ${a.filter((t) => diff(t.due) < 0).length} di antaranya terlambat.` : 'Semua tugas sudah selesai.'}</p>
          <div class="mt-5 flex flex-wrap gap-3"><a class="bp no-underline" href="#/deadline">Lihat deadline</a><a class="inline-flex min-h-11 items-center rounded-xl border-[1.5px] border-[#4DA3FF] px-4 text-sm font-semibold text-[#B5D6FF] no-underline" href="#/absensi">Absensi</a></div></div></section>
        <div class="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">${stat('Kehadiran', pct + '%', 'calendar-check', 'ok')}${stat('Tugas aktif', a.length, 'clipboard-list', 'info')}${stat('Deadline ≤ 3 hari', a.filter((t) => diff(t.due) >= 0 && diff(t.due) <= 3).length, 'alarm-clock', 'warn')}${stat('Terlambat', a.filter((t) => diff(t.due) < 0).length, 'triangle-alert', 'err')}</div>
        <div class="grid gap-5 lg:grid-cols-5"><div class="pnl lg:col-span-3"><h2 class="mb-3 font-bold">Deadline terdekat</h2><ul class="space-y-2">${a.slice(0, 3).map(deadlineRow).join('') || empty('Tidak ada tugas aktif.')}</ul></div>
        <div class="space-y-5 lg:col-span-2"><div class="pnl"><h2 class="mb-3 font-bold">Pelajaran hari ini</h2>${jd.length ? jd.map(([j, m]) => `<div class="flex justify-between gap-2 border-b border-line py-2 text-sm last:border-0"><span>${m}</span><span class="text-mute">${j}</span></div>`).join('') : empty('Tidak ada pelajaran hari ini.')}</div>
        <div class="pnl"><h2 class="mb-3 font-bold">Piket hari ini</h2>${PIKET[TODAY] ? `<p class="text-sm">${PIKET[TODAY].map(esc).join(', ')}</p>` : empty('Tidak ada jadwal piket.')}</div></div></div>`;
    },
    absensi() {
      const rows = S.att.filter((x) => (isAdmin() || x.nama === ME()) && (!F.from || x.tgl >= F.from) && (!F.st || x.status === F.st) && hit(x.nama, x.ket, x.status)).sort((a, b) => b.tgl.localeCompare(a.tgl));
      const n = (s) => rows.filter((x) => x.status === s).length;
      return head('Absensi', isAdmin() ? 'Verifikasi laporan kehadiran siswa.' : 'Laporan kehadiran milikmu.', isAdmin() ? '' : '<button class="bp" data-act="lapor"><i data-lucide="plus"></i>Lapor absensi</button>') +
        `<div class="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">${stat('Hadir', n('hadir'), 'check', 'ok')}${stat('Izin', n('izin'), 'file-text', 'info')}${stat('Sakit', n('sakit'), 'thermometer', 'warn')}${stat('Alpa', n('alpa'), 'x', 'err')}</div>
        <div class="pnl"><div class="mb-4 grid gap-3 sm:grid-cols-3"><label class="text-xs text-mute">Mulai tanggal<input type="date" class="inp mt-1" data-chg="from" value="${F.from}"></label>
        <label class="text-xs text-mute">Status<select class="inp mt-1" data-chg="st"><option value="">Semua</option>${['hadir', 'izin', 'sakit', 'alpa'].map((s) => `<option ${F.st === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div>
        <div class="overflow-x-auto"><table class="w-full min-w-[560px]"><thead><tr><th>Tanggal</th><th>Nama</th><th>Status</th><th>Keterangan</th><th>Verifikasi</th>${isAdmin() ? '<th>Aksi</th>' : ''}</tr></thead><tbody class="divide-y divide-line">
        ${rows.map((x) => `<tr><td>${fdate(x.tgl)}</td><td>${esc(x.nama)}</td><td>${B(x.status, ATT_T[x.status])}</td><td class="text-mute">${esc(x.ket || '-')}</td><td>${B(x.verif, VER_T[x.verif])}</td>${isAdmin() ? `<td>${x.verif === 'menunggu' ? `<button class="bg2 !min-h-9 !px-3" data-act="verif" data-id="${x.id}" data-v="terverifikasi">Verifikasi</button> <button class="bg2 !min-h-9 !px-3" data-act="verif" data-id="${x.id}" data-v="ditolak">Tolak</button>` : '-'}</td>` : ''}</tr>`).join('')}</tbody></table></div>${rows.length ? '' : empty('Belum ada catatan untuk filter ini.')}</div>`;
    },
    tugas() {
      const rows = S.tasks.filter((t) => (F.task === 'semua' || tstat(t) === F.task) && hit(t.judul, t.mapel, t.desc));
      return head('Riwayat Tugas', 'Tugas yang sudah dipublikasikan.', isAdmin() ? '<button class="bp" data-act="tadd"><i data-lucide="plus"></i>Tambah tugas</button>' : '') +
        `<div class="mb-4 flex flex-wrap gap-2">${['semua', 'belum', 'proses', 'selesai', 'terlambat'].map((s) => `<button class="bg2 !min-h-9 ${F.task === s ? '!border-sky !text-sky' : ''}" data-act="tfilter" data-v="${s}">${s}</button>`).join('')}</div>
        <div class="grid gap-4 md:grid-cols-2">${rows.map((t) => `<article class="pnl flex gap-4"><div class="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-ink text-mute" title="Foto tugas (diunggah via backend)"><i data-lucide="image"></i></div><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2">${B(tstat(t), TASK_T[tstat(t)])}<span class="text-xs text-mute">${esc(t.mapel)}</span></div><h3 class="mt-1 font-bold">${esc(t.judul)}</h3><p class="text-sm text-mute">${esc(t.desc)}</p><p class="mt-1 text-xs text-mute">Deadline ${fdate(t.due)}</p>
        <label class="mt-2 block text-xs text-mute">Ubah status<select class="inp mt-1 !min-h-9" data-chg="tstatus" data-id="${t.id}">${['belum', 'proses', 'selesai'].map((s) => `<option ${t.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div></article>`).join('')}</div>${rows.length ? '' : empty('Tidak ada tugas yang cocok.')}`;
    },
    deadline() {
      const a = openTasks().filter((t) => hit(t.judul, t.mapel));
      return head('Tugas Deadline', 'Diurutkan dari deadline paling dekat.') + `<ul class="space-y-3">${a.map(deadlineRow).join('') || empty('Tidak ada tugas yang mendekati deadline.')}</ul>`;
    },
    pelajaran() {
      const d = F.day || (SCHEDULE[TODAY] ? TODAY : 'Senin'), list = SCHEDULE[d];
      return head('Jadwal Pelajaran', 'Nama guru masih contoh sampai data backend tersedia.') +
        `<div class="mb-4 flex flex-wrap gap-2" role="tablist">${DAYS.slice(1).concat(DAYS[0]).map((x) => `<button role="tab" aria-selected="${x === d}" class="bg2 !min-h-9 ${x === d ? '!border-sky !text-sky' : ''}" data-act="day" data-v="${x}">${x}${x === TODAY ? ' •' : ''}</button>`).join('')}</div>
        <div class="grid gap-3 sm:grid-cols-2">${list.filter(([, m]) => hit(m)).map(([j, m]) => `<div class="pnl"><div class="text-xs text-mute">${j}</div><div class="mt-1 font-bold">${m}</div><div class="text-sm text-mute">${g}</div></div>`).join('')}</div>${list.length ? '' : empty('Tidak ada pelajaran di hari ' + d + '.')}`;
    },
    piket() {
      return head('Jadwal Piket', 'Hari ini ditandai.') + `<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">${Object.entries(PIKET).map(([d, m]) => `<div class="pnl ${d === TODAY ? '!border-brand' : ''}"><div class="mb-2 flex items-center justify-between font-bold">${d}${d === TODAY ? B('Hari ini', 'err') : ''}</div><ul class="space-y-1 text-sm text-mute">${m.filter((n) => hit(n, d)).map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>`).join('')}</div>`;
    },
    galeri() {
      const al = S.albums.filter((a) => (isAdmin() || a.pub) && hit(a.title, a.desc));
      return head('Galeri', isAdmin() ? 'Atur album mana yang tampil ke pengunjung.' : 'Dokumentasi kegiatan kelas.') +
        `<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${al.map((a) => `<article class="pnl !p-0 overflow-hidden"><button class="block h-40 w-full" data-act="album" data-id="${a.id}" aria-label="Buka ${esc(a.title)}" style="background:linear-gradient(135deg,hsl(${a.hue} 70% 35%),hsl(${(a.hue + 40) % 360} 60% 18%))"></button><div class="p-4"><h3 class="font-bold">${esc(a.title)}</h3><p class="text-sm text-mute">${a.count} foto · ${esc(a.desc)}</p>${isAdmin() ? `<button class="bg2 mt-3 !min-h-9" data-act="pub" data-id="${a.id}">${a.pub ? 'Dipublikasikan · Sembunyikan' : 'Disembunyikan · Publikasikan'}</button>` : ''}</div></article>`).join('')}</div>${al.length ? '' : empty('Belum ada album.')}`;
    },
    wali() {
      return head('Ruang Wali Kelas', 'Ucapan dan kenangan untuk wali kelas di Hari Guru.') +
        `<div class="pnl mb-5 border-brand/40"><h2 class="font-bold">Terima kasih, [Nama Wali Kelas]</h2><p class="mt-1 text-sm text-mute">Tulis ucapan singkatmu di bawah ini.</p><div class="mt-3 flex flex-col gap-2 sm:flex-row"><input id="wtxt" maxlength="200" class="inp" placeholder="Tulis ucapan apresiasi..."><button class="bp" data-act="wsend">Kirim ucapan</button></div><p id="werr" class="mt-1 min-h-5 text-sm text-err" role="alert"></p></div>
        <div class="grid gap-3 md:grid-cols-2">${S.notes.filter((n) => hit(n.text, n.author)).map((n) => `<blockquote class="pnl"><p>${esc(n.text)}</p><footer class="mt-2 text-sm text-mute">— ${esc(n.author)}</footer></blockquote>`).join('')}</div>`;
    },
    ngl() {
      const pend = S.ngl.filter((m) => m.status === 'menunggu'), ok = S.ngl.filter((m) => m.status === 'disetujui');
      return head('Kata Hari Ini', 'Pesan anonim. Setiap pesan dimoderasi admin sebelum tampil.') +
        `<div class="pnl mb-5"><label class="font-bold" for="ntxt">Tulis pesan</label><textarea id="ntxt" maxlength="280" rows="3" class="inp mt-2 py-2" placeholder="Pesan positif untuk kelas..."></textarea><div class="mt-2 flex items-center justify-between gap-3"><p id="nerr" class="text-sm text-err" role="alert"></p><button class="bp" data-act="nsend">Kirim anonim</button></div></div>` +
        (isAdmin() ? `<h2 class="mb-2 font-bold">Moderasi (${pend.length})</h2><ul class="mb-6 space-y-2">${pend.map((m) => `<li class="pnl flex flex-wrap items-center justify-between gap-3">${B('menunggu', 'warn')}<span class="min-w-0 flex-1">${esc(m.text)}</span><span class="flex gap-2"><button class="bp !min-h-9" data-act="mod" data-id="${m.id}" data-v="disetujui">Setujui</button><button class="bg2 !min-h-9" data-act="mod" data-id="${m.id}" data-v="ditolak">Tolak</button></span></li>`).join('') || empty('Tidak ada pesan yang menunggu.')}</ul>` : '') +
        `<h2 class="mb-2 font-bold">Pesan yang tampil</h2><div class="grid gap-3 md:grid-cols-2">${ok.filter((m) => hit(m.text)).map((m) => `<div class="pnl">${esc(m.text)}<div class="mt-2">${B('disetujui', 'ok')}</div></div>`).join('') || empty('Belum ada pesan yang disetujui.')}</div>`;
    }
  };
  const MENU = [['home', 'Beranda', 'layout-dashboard'], ['absensi', 'Absensi', 'calendar-check'], ['tugas', 'Riwayat Tugas', 'clipboard-list'], ['deadline', 'Tugas Deadline', 'alarm-clock'], ['pelajaran', 'Jadwal Pelajaran', 'book-open'], ['piket', 'Jadwal Piket', 'brush'], ['galeri', 'Galeri', 'images'], ['wali', 'Ruang Wali Kelas', 'heart-handshake'], ['ngl', 'Kata Hari Ini', 'message-circle']];

  /* ---------- Render, modal, toast ---------- */
  const icons = () => { if (window.lucide) window.lucide.createIcons(); };
  const cur = () => { const k = location.hash.replace('#/', ''); return VIEWS[k] ? k : 'home'; };
  function render() {
    const k = cur();
    $('#view').innerHTML = VIEWS[k]();
    $('#menu').innerHTML = MENU.map(([id, l, ic]) => `<a class="mi no-underline" href="#/${id}"${id === k ? ' aria-current="page"' : ''}><i data-lucide="${ic}"></i>${l}</a>`).join('');
    $('#uname').textContent = ME(); $('#urole').textContent = isAdmin() ? 'Admin' : 'Siswa'; $('#avatar').textContent = isAdmin() ? 'A' : 'S';
    document.title = 'CoDevEnger — ' + (MENU.find((m) => m[0] === k) || [])[1];
    icons();
  }
  const toast = (t) => { const e = $('#toast'); e.textContent = t; e.classList.remove('hidden'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.add('hidden'), 2600); };
  const openModal = (h) => { $('#mbody').innerHTML = h; $('#modal').classList.replace('hidden', 'flex'); icons(); const f = $('#mbody input,#mbody select,#mbody textarea,#mbody button'); if (f) f.focus(); };
  const closeModal = () => $('#modal').classList.replace('flex', 'hidden');
  const fld = (n, l, t, v, o) => `<label class="block text-sm font-medium">${l}${t === 'select' ? `<select name="${n}" class="inp mt-1">${o.map((x) => `<option>${x}</option>`).join('')}</select>` : t === 'textarea' ? `<textarea name="${n}" rows="3" class="inp mt-1 py-2"></textarea>` : `<input name="${n}" type="${t}" value="${v || ''}" class="inp mt-1">`}</label>`;
  function formModal(title, fields, submit) {
    openModal(`<h2 class="mb-4 text-lg font-bold">${title}</h2><form id="mf" novalidate class="space-y-3">${fields.map((f) => fld(...f)).join('')}<p id="ferr" class="min-h-5 text-sm text-err" role="alert"></p><div class="flex justify-end gap-2"><button type="button" class="bg2" data-act="modal-close">Batal</button><button class="bp">Simpan</button></div></form>`);
    $('#mf').onsubmit = (e) => { e.preventDefault(); const err = submit(Object.fromEntries(new FormData(e.target))); if (err) $('#ferr').textContent = err; else closeModal(); };
  }

  /* ---------- Aksi ---------- */
  const ACT = {
    'menu-open': () => { $('#side').classList.remove('-translate-x-full'); $('#scrim').classList.remove('hidden'); },
    'menu-close': () => { $('#side').classList.add('-translate-x-full'); $('#scrim').classList.add('hidden'); },
    profile: () => { const m = $('#pmenu'); m.classList.toggle('hidden'); $('#pbtn').setAttribute('aria-expanded', !m.classList.contains('hidden')); },
    role: (d) => { try { localStorage.setItem('cde_role', d.v); } catch (e) { /* abaikan */ } $('#pmenu').classList.add('hidden'); render(); toast('Peran simulasi: ' + d.v); },
    bell: () => toast('Notifikasi akan tersedia setelah backend tersambung.'),
    'modal-close': closeModal,
    'modal-bg': (d, e) => { if (e.target.id === 'modal') closeModal(); },
    lapor() {
      formModal('Lapor absensi', [['tgl', 'Tanggal', 'date', ymd(T0)], ['status', 'Status', 'select', '', ['hadir', 'izin', 'sakit', 'alpa']], ['ket', 'Keterangan (wajib untuk izin/sakit)', 'textarea']], (v) => {
        if (!v.tgl) return 'Tanggal wajib diisi.';
        if (v.tgl > ymd(T0)) return 'Tanggal tidak boleh di masa depan.';
        if ((v.status === 'izin' || v.status === 'sakit') && !v.ket.trim()) return 'Keterangan wajib diisi untuk izin atau sakit.';
        if (S.att.some((x) => x.nama === ME() && x.tgl === v.tgl)) return 'Laporan untuk tanggal ini sudah ada.';
        S.att.push({ id: nextId(S.att), nama: ME(), tgl: v.tgl, status: v.status, ket: v.ket.trim(), verif: 'menunggu' }); save(); render(); toast('Laporan terkirim, menunggu verifikasi.');
      });
    },
    verif(d) { const x = S.att.find((a) => a.id == d.id); if (x) { x.verif = d.v; save(); render(); toast('Laporan ' + d.v + '.'); } },
    tfilter(d) { F.task = d.v; render(); },
    tadd() {
      formModal('Tambah tugas', [['mapel', 'Mata pelajaran', 'text'], ['judul', 'Judul', 'text'], ['desc', 'Deskripsi', 'textarea'], ['due', 'Deadline', 'date', off(3)], ['prio', 'Prioritas', 'select', '', ['tinggi', 'sedang', 'rendah']]], (v) => {
        if (!v.mapel.trim() || !v.judul.trim() || !v.due) return 'Mata pelajaran, judul, dan deadline wajib diisi.';
        S.tasks.push({ id: nextId(S.tasks), mapel: v.mapel.trim(), judul: v.judul.trim(), desc: v.desc.trim() || '-', due: v.due, status: 'belum', prio: v.prio }); save(); render(); toast('Tugas dipublikasikan.');
      });
    },
    day(d) { F.day = d.v; render(); },
    album(d) {
      const a = S.albums.find((x) => x.id == d.id);
      openModal(`<div class="h-56 rounded-xl" style="background:linear-gradient(135deg,hsl(${a.hue} 70% 35%),hsl(${(a.hue + 40) % 360} 60% 18%))"></div><h2 class="mt-4 text-lg font-bold">${esc(a.title)}</h2><p class="text-sm text-mute">${a.count} foto · ${esc(a.desc)}</p><p class="mt-2 text-xs text-mute">Foto asli akan dimuat dari penyimpanan backend.</p><button class="bg2 mt-4" data-act="modal-close">Tutup</button>`);
    },
    pub(d) { const a = S.albums.find((x) => x.id == d.id); a.pub = !a.pub; save(); render(); toast(a.pub ? 'Album dipublikasikan.' : 'Album disembunyikan.'); },
    wsend() {
      const v = $('#wtxt').value.trim();
      if (v.length < 3) { $('#werr').textContent = 'Tulis minimal 3 karakter.'; return; }
      S.notes.unshift({ id: nextId(S.notes), author: ME(), text: v }); save(); render(); toast('Ucapan terkirim.');
    },
    nsend() {
      const v = $('#ntxt').value.trim();
      if (v.length < 5) { $('#nerr').textContent = 'Tulis minimal 5 karakter.'; return; }
      S.ngl.push({ id: nextId(S.ngl), text: v, status: 'menunggu' }); save(); render(); toast('Terkirim anonim. Menunggu moderasi admin.');
    },
    mod(d) { const m = S.ngl.find((x) => x.id == d.id); m.status = d.v; save(); render(); toast('Pesan ' + d.v + '.'); }
  };
  const CHG = {
    from: (el) => { F.from = el.value; render(); }, st: (el) => { F.st = el.value; render(); },
    tstatus: (el) => { S.tasks.find((t) => t.id == el.dataset.id).status = el.value; save(); render(); toast('Status tugas diperbarui.'); }
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (el && ACT[el.dataset.act]) ACT[el.dataset.act](el.dataset, e);
    if (!e.target.closest('#pbtn,#pmenu')) { $('#pmenu').classList.add('hidden'); }
    if (e.target.closest('#menu a')) ACT['menu-close']();
  });
  document.addEventListener('change', (e) => { const el = e.target.closest('[data-chg]'); if (el && CHG[el.dataset.chg]) CHG[el.dataset.chg](el); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); ACT['menu-close'](); } });
  $('#q').addEventListener('input', (e) => { F.q = e.target.value; render(); });
  window.addEventListener('hashchange', () => { F.q = ''; $('#q').value = ''; render(); window.scrollTo(0, 0); });
  document.addEventListener('DOMContentLoaded', render);
  if (document.readyState !== 'loading') render();
})();
