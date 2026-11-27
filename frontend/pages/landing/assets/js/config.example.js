/* Salin file ini menjadi config.js (sudah di-gitignore), lalu isi nilainya.
   HANYA gunakan anon/publishable key. JANGAN PERNAH memakai service_role / secret key di frontend. */
window.APP_CONFIG = {
  USE_DUMMY_DATA: true,           // ubah ke false setelah schema & RLS final dari Zidan
  SUPABASE_URL: '',               // contoh: https://xxxx.supabase.co
  SUPABASE_ANON_KEY: '',          // anon / publishable key saja
  MUSIC_URL: ''                   // kosongkan untuk memakai assets/audio/background-music.mp3
};
