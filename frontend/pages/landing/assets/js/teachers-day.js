/* CoDevEnger – Teachers' Day Surprise
   Lokasi: frontend/pages/landing/assets/js/teachers-day.js

   MODE A  (semua halaman selain teachers-day.html)
   ─ Tampilkan pop-up kotak misterius setiap 30 detik.
   ─ Pop-up TIDAK hilang sampai X ditekan.
   ─ Klik area dalam kotak → pindah ke teachers-day.html.

   MODE B  (teachers-day.html)
   ─ Tampilkan pop-up penawaran langsung saat halaman dibuka.
   ─ Tombol KLAIM SEKARANG! → mulai video BSOD.
*/

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     Deteksi halaman
  ───────────────────────────────────────────── */
  const isTeachersDay = document.body.dataset.page === 'teachers-day';

  /* ─────────────────────────────────────────────
     Konstanta
  ───────────────────────────────────────────── */
  const POPUP1_DELAY_MS = 30_000;

  /* ─────────────────────────────────────────────
     Helpers tampil / sembunyikan
  ───────────────────────────────────────────── */
  function show(el) { if (!el) return; el.classList.remove('td-hidden'); el.classList.add('td-visible'); }
  function hide(el) { if (!el) return; el.classList.remove('td-visible'); el.classList.add('td-hidden'); }

  /* ══════════════════════════════════════════════
     MODE A – Pop-up 1 (kotak misterius), semua halaman
  ═══════════════════════════════════════════════ */
  function initModeA() {
    // Buat dan sisipkan pop-up 1 ke dalam body
    const popup1 = createPopup1();
    document.body.appendChild(popup1);

    let timer = null;

    function clearTimer() {
      if (timer !== null) { clearTimeout(timer); timer = null; }
    }

    function schedulePopup() {
      clearTimer(); // pastikan tidak ada timer ganda
      timer = setTimeout(function () {
        timer = null;
        openPopup();
      }, POPUP1_DELAY_MS);
    }

    function openPopup() {
      // Reset animasi setiap kali muncul
      const box = popup1.querySelector('.td-box-1');
      if (box) { box.style.animation = 'none'; void box.offsetWidth; box.style.animation = ''; }
      show(popup1);
    }

    function closePopup() {
      hide(popup1);
    }

    // Tombol X – tutup dan jadwalkan ulang
    const btnX = popup1.querySelector('.td-btn-close-1');
    if (btnX) {
      btnX.addEventListener('click', function (e) {
        e.stopPropagation();
        closePopup();
        schedulePopup();
      });
    }

    // Klik area dalam kotak → pindah ke teachers-day.html
    const box1 = popup1.querySelector('.td-box-1');
    if (box1) {
      box1.addEventListener('click', function () {
        clearTimer();
        // Pindah ke halaman teachers-day
        window.location.href = 'teachers-day.html';
      });
    }

    // Jadwalkan pop-up pertama
    schedulePopup();
  }

  /* ══════════════════════════════════════════════
     MODE B – teachers-day.html
     Pop-up 2 muncul langsung; video BSOD dipicu tombol KLAIM
  ═══════════════════════════════════════════════ */
  function initModeB() {
    const popup2       = document.getElementById('td-popup-2');
    const videoOverlay = document.getElementById('td-video-overlay');
    const bsodVideo    = document.getElementById('td-bsod-video');
    const btnClaim     = document.getElementById('td-btn-claim');

    // Tampilkan pop-up 2 segera
    if (popup2) show(popup2);

    // Tombol KLAIM → mulai video BSOD
    if (btnClaim) {
      btnClaim.addEventListener('click', function (e) {
        e.stopPropagation();
        hide(popup2);
        startVideo();
      });
    }

    function startVideo() {
      if (!videoOverlay || !bsodVideo) return;
      show(videoOverlay);
      videoOverlay.classList.add('td-cursor-hidden');
      document.body.style.cursor = 'none';

      bsodVideo.currentTime = 0;
      const p = bsodVideo.play();
      if (p !== undefined) {
        p.catch(function (err) {
          console.warn('[TeachersDay] Video gagal diputar:', err.message);
          videoOverlay.classList.add('td-show-error');
          restoreCursor();
        });
      }
    }

    function stopVideo() {
      if (!bsodVideo) return;
      bsodVideo.pause();
      bsodVideo.currentTime = 0;
      hide(videoOverlay);
      videoOverlay.classList.remove('td-cursor-hidden', 'td-show-error');
      restoreCursor();
    }

    function restoreCursor() {
      document.body.style.cursor = '';
      if (videoOverlay) videoOverlay.classList.remove('td-cursor-hidden');
    }

    if (bsodVideo) {
      bsodVideo.addEventListener('ended', function () {
        stopVideo();
        console.info('[TeachersDay] Video BSOD selesai. Siap untuk tahap selanjutnya.');
        window.dispatchEvent(new CustomEvent('td:bsod-ended'));
      });

      bsodVideo.addEventListener('error', function () {
        const src = bsodVideo.currentSrc || '(tidak diketahui)';
        console.warn('[TeachersDay] File video tidak ditemukan:', src,
          '\nLetakkan: frontend/pages/landing/assets/videos/bsod-prank.mp4');
        if (videoOverlay && !videoOverlay.classList.contains('td-hidden')) {
          videoOverlay.classList.add('td-show-error');
          restoreCursor();
        }
      });
    }
  }

  /* ══════════════════════════════════════════════
     Pembuatan elemen Pop-up 1 secara dinamis
     (agar tidak perlu menyisipkan HTML ke setiap halaman)
  ═══════════════════════════════════════════════ */
  function createPopup1() {
    const overlay = document.createElement('div');
    overlay.id = 'td-popup-1';
    overlay.className = 'td-overlay td-hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'false');
    overlay.setAttribute('aria-label', 'Kotak misterius');

    overlay.innerHTML = `
      <div class="td-box-1" role="presentation">
        <button class="td-btn-close-1" type="button" aria-label="Tutup">✕</button>
        <div class="td-click-area" aria-hidden="true"></div>
      </div>`;

    return overlay;
  }

  /* ─────────────────────────────────────────────
     Entry point
  ───────────────────────────────────────────── */
  function init() {
    if (isTeachersDay) {
      initModeB();
    } else {
      initModeA();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
