/* Lapisan akses data publik. Lokasi: frontend/pages/landing/assets/js/api.js
   Semua halaman memanggil CDE_API, bukan Supabase langsung -> mudah diganti saat schema final.

   ATURAN:
   - Hanya data yang dipublikasikan (RLS di backend yang menjamin, bukan frontend).
   - Jangan membaca absensi, tugas internal, identitas penulis NGL, atau data pribadi siswa.
   - Nama tabel/kolom BELUM ditetapkan: isi fungsi di bawah setelah Zidan menyerahkan schema & API contract. */
(function () {
  'use strict';
  const cfg = window.APP_CONFIG || { USE_DUMMY_DATA: true };
  const dummy = (key) => Promise.resolve(window.CDE_DUMMY[key]);
  const notReady = (name) => Promise.reject(new Error(
    'Kontrak data "' + name + '" belum ditetapkan. Set USE_DUMMY_DATA=true atau lengkapi api.js setelah schema final dari Zidan.'
  ));

  /* Pola yang akan dipakai setelah schema final (jangan diaktifkan sebelum ada kontrak):
       const { data, error } = await window.cdeSupabase.from('<tabel_publik>').select('<kolom_publik>');
       if (error) throw error;
       return data.map(mapRowToCamelCase);                                                          */

  window.CDE_API = {
    getFeatures: () => dummy('features'),                        // konten statis keunggulan kelas
    getMembers: () => (cfg.USE_DUMMY_DATA ? dummy('members') : notReady('profil publik')),
    getGallery: () => (cfg.USE_DUMMY_DATA ? dummy('gallery') : notReady('galeri publik')),
    getNotes: () => (cfg.USE_DUMMY_DATA ? dummy('notes') : notReady('apresiasi wali kelas'))
  };
})();
