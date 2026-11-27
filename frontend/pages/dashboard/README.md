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

Di dashboard, kotak misterius Teachers' Day muncul setiap 30 detik. Tombol X menutup dan menjadwalkan ulang popup; klik kotak membuka halaman kejutan Teachers' Day.

Integrasi backend: ganti `load()`/`save()` di `assets/js/dashboard.js` dengan pemanggilan API. Peran siswa/admin di frontend hanya mengatur tampilan; hak akses sebenarnya harus di backend (RLS). Jangan simpan secret key di frontend.

Tautan ke halaman publik mengarah ke `../landing/index.html` dan `../landing/anggota.html`.

## Animasi & responsivitas
- Animasi masuk (`.enter`, `.stagger`) hanya dipasang saat pindah halaman (hash route); render karena filter/pencarian tidak mengulang animasi.
- Sidebar, scrim, dropdown profil, modal, dan toast memakai kelas state `.is-open` / `.is-show` (lihat `dashboard.css`), bukan `hidden`.
- Transisi tema: `theme.js` memasang kelas `theme-anim` sementara saat tombol tema ditekan. Kunci `cde_theme` tidak berubah.
- Semua animasi dimatikan otomatis oleh `prefers-reduced-motion`.
