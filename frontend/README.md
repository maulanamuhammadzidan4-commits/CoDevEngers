# CoDevEnger — Guest Experience (frontend)

Halaman publik pengunjung: Beranda, Keunggulan, Anggota, Galeri, Ruang Wali Kelas.
Stack: HTML + Tailwind CSS (CDN) + Vanilla JS + Supabase JS SDK. Tanpa framework.

Lokasi di repo: `CoDevEngers/frontend/`

## Struktur
```
frontend/
├── index.html  keunggulan.html  anggota.html  galeri.html  wali-kelas.html
├── .gitignore                      # mengabaikan assets/js/config.js
└── assets/
    ├── css/theme.css               # animasi & efek (kartu, scroll, bat, laba-laba)
    └── js/
        ├── config.example.js       # salin -> config.js (di-gitignore)
        ├── supabase-client.js      # client (anon key saja)
        ├── data.js                 # data placeholder (camelCase)
        ├── api.js                  # SATU-SATUNYA tempat akses data publik
        ├── components.js           # nav, footer, dekorasi hero, overlay (reusable)
        ├── render.js               # render kartu dari data (escape + https-only gambar)
        ├── effects.js              # reveal, tilt kartu, scroll mengerucut, musik, intro
        └── main.js                 # entry point semua halaman
```

## Dashboard anggota & tema (baru)
- `login.html` → pilih peran (SIMULASI, bukan autentikasi) → `dashboard.html`
- `dashboard.html` + `assets/js/dashboard.js`: Beranda, Absensi, Riwayat Tugas, Tugas Deadline, Jadwal Pelajaran, Jadwal Piket, Galeri, Ruang Wali Kelas, Kata Hari Ini (NGL + moderasi admin). Data contoh disimpan di LocalStorage `cde_dash_v1`.
- `assets/js/theme.js`: mode terang/gelap di semua halaman, tersimpan di `cde_theme` (default gelap). Warna lewat CSS variable di `theme.css` (`:root` = gelap, `[data-theme="light"]` = terang).
- `assets/img/spiderman.webp`: aset ilustrasi dari desain.
- Titik integrasi backend dashboard: `load()`/`save()` di `dashboard.js` (ganti dengan API). Peran siswa/admin hanya tampilan; hak akses sebenarnya harus di backend/RLS.

## Menjalankan lokal
```bash
cd frontend
python3 -m http.server 8080        # lalu buka http://localhost:8080
```
Tidak perlu build. Default memakai data placeholder (`USE_DUMMY_DATA: true`).
Jika `config.js` tidak ada, halaman tetap jalan dengan data placeholder.

## Menyambungkan Supabase (setelah schema final dari Zidan)
1. `cp assets/js/config.example.js assets/js/config.js`
2. Isi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` (anon/publishable saja; JANGAN service_role) dan set `USE_DUMMY_DATA: false`.
3. Lengkapi fungsi di `assets/js/api.js` sesuai API contract Zidan (tabel/kolom publik). Fungsi sengaja belum diisi agar tidak mengarang kolom.
4. Gambar: pakai URL https dari Supabase Storage (`photoUrl`, `coverUrl`). Jangan simpan foto di InfinityFree.

## Deploy (InfinityFree)
Upload ISI folder `frontend/` ke `htdocs/` (index.html harus di root htdocs). Jangan upload `config.js` yang berisi secret; anon key boleh, service_role tidak pernah.

## Checklist uji manual
- [ ] Buka 5 halaman; navbar berpindah halaman dan menandai halaman aktif
- [ ] Intro tampil sekali per sesi di index.html (tab baru = tampil lagi)
- [ ] Hover kartu: miring mengikuti kursor, judul berubah warna
- [ ] Scroll naik/turun: garis mengerucut + laba-laba di tepi kiri bergerak
- [ ] Tombol musik: hidup/mati (harus diklik dulu, browser memblokir autoplay)
- [ ] Ukuran 360px, 768px, 1280px: tidak ada scroll horizontal, tulisan terbaca
- [ ] OS "Reduce motion" aktif: animasi berhenti, konten tetap tampil
- [ ] USE_DUMMY_DATA=false tanpa api.js lengkap: muncul "Konten belum tersedia" (bukan error putih)

## Catatan
- `login.html` adalah halaman Fazril (belum ada di paket ini).
- Musik berhenti saat pindah halaman (tiap halaman memuat ulang). Untuk musik tanpa putus perlu pendekatan satu halaman (SPA) -> bahas dengan Zidan/Fazril.
- Tailwind CDN dipakai untuk MVP; ganti ke Tailwind CLI bila ingin file lebih ringan.
- Lagu: musik ambient dibuat dengan Web Audio (orisinal). Jika ingin lagu sendiri, taruh file bebas hak cipta di Supabase Storage / folder assets dan ganti `initMusic()`.
