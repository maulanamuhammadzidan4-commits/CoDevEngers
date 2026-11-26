/* Supabase client (hanya anon key). Lokasi: frontend/assets/js/supabase-client.js
   Bergantung pada: @supabase/supabase-js v2 (CDN, global `supabase`) dan config.js. */
(function () {
  'use strict';
  const cfg = window.APP_CONFIG || { USE_DUMMY_DATA: true };
  window.cdeSupabase = null;
  if (cfg.USE_DUMMY_DATA) return;
  if (!window.supabase || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
    console.warn('[CoDevEnger] Supabase belum dikonfigurasi. Periksa assets/js/config.js');
    return;
  }
  window.cdeSupabase = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
})();
