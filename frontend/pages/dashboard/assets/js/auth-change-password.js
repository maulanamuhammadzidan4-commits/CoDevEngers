(function () {
  'use strict';

  const form = document.querySelector('#change-password-form');
  const newPassword = document.querySelector('#new-password');
  const confirmPassword = document.querySelector('#confirm-password');
  const toggleNew = document.querySelector('#toggle-new');
  const submitButton = document.querySelector('#change-submit');
  const message = document.querySelector('#change-message');
  const strengthBar = document.querySelector('#strength-bar');
  const strengthText = document.querySelector('#strength-text');

  function showMessage(text) {
    message.textContent = text;
  }

  function setLoading(loading) {
    submitButton.disabled = loading;
    submitButton.textContent = loading ? 'Menyimpan...' : 'Simpan password';
  }

  async function getProfile(userId) {
    const { data, error } = await window.cdeSupabase
      .from('profiles')
      .select('id,username,full_name,role,must_change_password')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  function updateStrength() {
    const value = newPassword.value;
    let score = 0;
    if (value.length >= 6) score++;
    if (value.length >= 10) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
    const widths = ['0%', '25%', '50%', '75%', '100%'];
    const labels = ['Gunakan minimal 6 karakter.', 'Kekuatan rendah.', 'Kekuatan cukup.', 'Kekuatan baik.', 'Kekuatan kuat.'];
    const tones = ['bg-err', 'bg-err', 'bg-warn', 'bg-sky', 'bg-ok'];
    strengthBar.style.width = widths[score];
    strengthBar.className = 'h-full transition-all ' + tones[score];
    strengthText.textContent = labels[score];
  }

  newPassword.addEventListener('input', updateStrength);
  toggleNew.addEventListener('click', function () {
    const visible = newPassword.type === 'text';
    newPassword.type = visible ? 'password' : 'text';
    toggleNew.textContent = visible ? 'Lihat' : 'Sembunyi';
    toggleNew.setAttribute('aria-pressed', String(!visible));
  });

  async function initialize() {
    showMessage('');
    if (!window.cdeSupabase) {
      showMessage('Autentikasi belum dapat dijalankan.');
      return;
    }
    const { data } = await window.cdeSupabase.auth.getSession();
    if (!data.session) {
      window.location.href = 'login.html';
      return;
    }
    try {
      const profile = await getProfile(data.session.user.id);
      if (!profile) {
        showMessage('Profil akun tidak ditemukan.');
        return;
      }
      if (!profile.must_change_password) {
        window.location.href = 'dashboard.html';
      }
    } catch (_) {
      showMessage('Tidak dapat memuat profil akun.');
    }
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    showMessage('');

    const password = newPassword.value;
    const confirmation = confirmPassword.value;
    if (password.length < 6) {
      showMessage('Password baru minimal 6 karakter.');
      newPassword.focus();
      return;
    }
    if (password !== confirmation) {
      showMessage('Konfirmasi password tidak sama.');
      confirmPassword.focus();
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await window.cdeSupabase.auth.getSession();
      if (!sessionData.session) {
        window.location.href = 'login.html';
        return;
      }

      const { error } = await window.cdeSupabase.auth.updateUser({ password });
      if (error) {
        showMessage('Password gagal diperbarui. Coba lagi.');
        return;
      }

      const profile = await getProfile(sessionData.session.user.id);
      if (!profile) {
        showMessage('Profil akun tidak dapat diverifikasi.');
        return;
      }
      if (profile.must_change_password) {
        showMessage('Status perubahan password belum selesai. Coba lagi.');
        return;
      }
      window.location.href = 'dashboard.html';
    } catch (_) {
      showMessage('Password gagal diperbarui. Coba lagi.');
    } finally {
      setLoading(false);
    }
  });

  initialize();
})();
