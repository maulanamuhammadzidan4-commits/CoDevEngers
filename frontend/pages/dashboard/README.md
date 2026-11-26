# Dashboard CoDevEnger (bagian Fazril: UI/UX)

Lokasi di repo: `frontend/pages/dashboard/`

File utama dashboard:
- `login.html` — pilih peran (SIMULASI, bukan autentikasi) lalu masuk ke dashboard
- `dashboard.html` — kerangka UI dashboard
- `assets/js/dashboard.js` — halaman & interaksi; data contoh di LocalStorage `cde_dash_v1`
- `assets/js/theme.js` — mode terang/gelap, tersimpan di `cde_theme` (default gelap)
- `assets/css/dashboard.css` — token warna terang/gelap (CSS variable)
- `assets/images/spiderman.webp` — ilustrasi hero login & beranda dashboard

Halaman: Beranda, Absensi, Riwayat Tugas, Tugas Deadline, Jadwal Pelajaran, Jadwal Piket, Galeri, Ruang Wali Kelas, Kata Hari Ini (NGL + moderasi admin).

Integrasi backend: ganti `load()`/`save()` di `assets/js/dashboard.js` dengan pemanggilan API. Peran siswa/admin di frontend hanya mengatur tampilan; hak akses sebenarnya harus di backend (RLS). Jangan simpan secret key di frontend.

Tautan ke halaman publik mengarah ke `../landing/index.php` dan `../landing/anggota.php`.
