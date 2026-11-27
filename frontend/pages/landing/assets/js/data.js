/* Data placeholder untuk demo/pengembangan. Lokasi: frontend/pages/landing/assets/js/data.js
   Bentuk objek memakai camelCase sesuai standar JSON proyek.
   GANTI dengan data nyata lewat api.js setelah schema final dari Zidan. */
(function () {
  'use strict';
  const d = '[Isi deskripsi keunggulan kelas]';
  window.CDE_DUMMY = {
    features: [
      { id: 'f1', no: '01', title: 'Kompak', desc: d },
      { id: 'f2', no: '02', title: 'Disiplin', desc: d },
      { id: 'f3', no: '03', title: 'Kreatif', desc: d },
      { id: 'f4', no: '04', title: 'Saling Bantu', desc: d },
      { id: 'f5', no: '05', title: 'Berani Mencoba', desc: d },
      { id: 'f6', no: '06', title: 'Peduli', desc: d }
    ],
    members: 'ABCDEFGH'.split('').map((c, i) => ({
      id: 'm' + (i + 1), name: '[Nama Siswa]', bio: '[Biodata singkat publik]', initial: c, photoUrl: null
    })),
    gallery: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ id: 'g' + n, title: '[Judul album ' + n + ']', coverUrl: null })),
    notes: [1, 2, 3, 4, 5, 6].map((n) => ({ id: 'n' + n, message: '[Ucapan apresiasi siswa ' + n + ']', author: '[Nama pengirim]' }))
  };
})();
