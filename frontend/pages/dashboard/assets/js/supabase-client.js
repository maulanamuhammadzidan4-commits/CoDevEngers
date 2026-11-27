/* Supabase browser client. Uses only the public publishable key. */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://xeaiplkynfjzwxxledyf.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_8IQpESXlU1HHFnDXXWULTg_VqkpA2kW';

  if (!window.supabase) {
    console.error('[CoDevEnger] Supabase JavaScript library belum dimuat.');
    window.cdeSupabase = null;
    return;
  }

  window.cdeSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
})();
