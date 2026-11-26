# Dashboard CoDevEnger (bagian Fazril: UI/UX)

File baru (tidak mengubah file anggota lain):
- `login.html` — pilih peran (SIMULASI, bukan autentikasi) lalu masuk ke dashboard
- `dashboard.html`
- `assets/js/dashboard/app.js` — halaman & interaksi; data contoh di LocalStorage `cde_dash_v1`
- `assets/js/dashboard/theme.js` — mode terang/gelap, tersimpan di `cde_theme` (default gelap)
- `assets/css/dashboard.css` — token warna terang/gelap (CSS variable)
- `assets/img/dashboard/spiderman.webp`

Halaman: Beranda, Absensi, Riwayat Tugas, Tugas Deadline, Jadwal Pelajaran, Jadwal Piket, Galeri, Ruang Wali Kelas, Kata Hari Ini (NGL + moderasi admin).

Integrasi backend: ganti `load()`/`save()` di `app.js` dengan pemanggilan API. Peran siswa/admin di frontend hanya mengatur tampilan; hak akses sebenarnya harus di backend (RLS). Jangan simpan secret key di frontend.

Halaman pengunjung (`index.html`) dan profil anggota (`anggota.html`) belum tersedia di frontend saat ini, sehingga tautannya tidak ditampilkan. Tambahkan kembali tautan navigasi setelah halaman tujuan tersedia.
