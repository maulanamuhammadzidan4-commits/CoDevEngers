(function () {
  'use strict';

  const form = document.querySelector('#login-form');
  const usernameInput = document.querySelector('#username');
  const passwordInput = document.querySelector('#password');
  const toggleButton = document.querySelector('#toggle-password');
  const submitButton = document.querySelector('#login-submit');
  const message = document.querySelector('#login-message');

  function showMessage(text) {
    message.textContent = text;
  }

  function setLoading(loading) {
    submitButton.disabled = loading;
    submitButton.textContent = loading ? 'Memproses...' : 'Masuk';
  }

  toggleButton.addEventListener('click', function () {
    const visible = passwordInput.type === 'text';
    passwordInput.type = visible ? 'password' : 'text';
    toggleButton.setAttribute('aria-pressed', String(!visible));
    toggleButton.setAttribute('aria-label', visible ? 'Tampilkan password' : 'Sembunyikan password');
  });

  async function getProfile(userId) {
    const { data, error } = await window.cdeSupabase
      .from('profiles')
      .select('id,username,full_name,role,must_change_password')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    showMessage('');

    if (!window.cdeSupabase) {
      showMessage('Autentikasi belum dapat dijalankan. Coba muat ulang halaman.');
      return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    if (!/^[a-z0-9._-]+$/.test(username)) {
      showMessage('Username hanya boleh berisi huruf kecil, angka, titik, garis bawah, atau strip.');
      usernameInput.focus();
      return;
    }
    if (!password) {
      showMessage('Password wajib diisi.');
      passwordInput.focus();
      return;
    }

    setLoading(true);
    try {
      const syntheticEmail = username + '@login.codevengers.invalid';
      const { data, error } = await window.cdeSupabase.auth.signInWithPassword({
        email: syntheticEmail,
        password
      });
      if (error || !data.user) {
        showMessage('Username atau password tidak sesuai.');
        return;
      }

      const profile = await getProfile(data.user.id);
      if (!profile) {
        await window.cdeSupabase.auth.signOut();
        showMessage('Profil akun tidak ditemukan. Hubungi administrator.');
        return;
      }

      window.location.href = profile.must_change_password ? 'change-password.html' : 'dashboard.html';
    } catch (error) {
      showMessage('Tidak dapat memproses login. Periksa koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  });

  window.addEventListener('DOMContentLoaded', async function () {
    if (!window.cdeSupabase) return;
    const { data } = await window.cdeSupabase.auth.getSession();
    if (data.session) {
      try {
        const profile = await getProfile(data.session.user.id);
        if (profile) {
          window.location.href = profile.must_change_password ? 'change-password.html' : 'dashboard.html';
        }
      } catch (_) {}
    }
  });
})();
