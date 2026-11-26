/* CoDevEnger – Teachers' Day Surprise
   Lokasi: frontend/pages/landing/assets/js/teachers-day.js
   Mengelola: timer pop-up 1, pop-up 1 (kotak misterius), pop-up 2 (penawaran),
              pemutaran video BSOD, dan cursor management.

   Tidak bergantung pada modul lain proyek (berdiri sendiri). */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     Konstanta
  ───────────────────────────────────────────── */
  const POPUP1_DELAY_MS = 30_000; // 30 detik

  /* ─────────────────────────────────────────────
     Referensi elemen DOM
  ───────────────────────────────────────────── */
  const popup1       = document.getElementById('td-popup-1');
  const popup2       = document.getElementById('td-popup-2');
  const videoOverlay = document.getElementById('td-video-overlay');
  const bsodVideo    = document.getElementById('td-bsod-video');
  const btnClose1    = document.getElementById('td-btn-close-1');
  const btnClaim     = document.getElementById('td-btn-claim');
  const videoError   = document.querySelector('.td-video-error');

  /* ─────────────────────────────────────────────
     State
  ───────────────────────────────────────────── */
  let popup1Timer   = null;  // ID dari setTimeout yang sedang aktif
  let popup1Opened  = false; // apakah pop-up 1 pernah dibuka (klik area dalam)

  /* ─────────────────────────────────────────────
     Helpers – tampil / sembunyikan elemen
  ───────────────────────────────────────────── */
  function show(el) {
    el.classList.remove('is-hidden');
    el.classList.add('is-visible');
  }

  function hide(el) {
    el.classList.remove('is-visible');
    el.classList.add('is-hidden');
  }

  /* ─────────────────────────────────────────────
     Timer management – pop-up 1
     Pastikan hanya satu timer berjalan setiap saat.
  ───────────────────────────────────────────── */
  function clearPopup1Timer() {
    if (popup1Timer !== null) {
      clearTimeout(popup1Timer);
      popup1Timer = null;
    }
  }

  function schedulePopup1() {
    // Jangan jadwalkan jika pop-up sudah pernah dibuka (klik area dalam)
    if (popup1Opened) return;

    clearPopup1Timer(); // pastikan tidak ada timer ganda

    popup1Timer = setTimeout(function () {
      popup1Timer = null;
      openPopup1();
    }, POPUP1_DELAY_MS);
  }

  /* ─────────────────────────────────────────────
     Pop-up 1 – buka / tutup
  ───────────────────────────────────────────── */
  function openPopup1() {
    if (popup1Opened) return; // sudah dialihkan ke pop-up 2, tidak perlu tampil lagi
    // Reset animasi agar terlihat setiap kali muncul
    const box = popup1.querySelector('.td-box-1');
    if (box) {
      box.style.animation = 'none';
      // Paksa reflow sebelum re-menerapkan animasi
      void box.offsetWidth;
      box.style.animation = '';
    }
    show(popup1);
  }

  function closePopup1() {
    hide(popup1);
  }

  /* ─────────────────────────────────────────────
     Pop-up 1 – event listener
  ───────────────────────────────────────────── */

  // Tombol X: tutup pop-up 1, jadwalkan ulang setelah 30 detik
  if (btnClose1) {
    btnClose1.addEventListener('click', function (e) {
      e.stopPropagation(); // jangan sampai meneruskan ke area klik kotak
      closePopup1();
      schedulePopup1();   // munculkan lagi 30 detik kemudian
    });
  }

  // Area dalam kotak (selain tombol X): tutup pop-up 1, buka pop-up 2
  // Gunakan delegasi pada elemen kotak; tombol X menghentikan propagasi sendiri
  if (popup1) {
    const box1 = popup1.querySelector('.td-box-1');
    if (box1) {
      box1.addEventListener('click', function () {
        popup1Opened = true;      // tandai sudah dibuka
        clearPopup1Timer();       // batalkan timer yang masih berjalan
        closePopup1();
        openPopup2();
      });
    }
  }

  /* ─────────────────────────────────────────────
     Pop-up 2 – buka / tutup
  ───────────────────────────────────────────── */
  function openPopup2() {
    // Reset animasi masuk pop-up 2
    const box2 = popup2.querySelector('.td-box-2');
    if (box2) {
      box2.style.animation = 'none';
      void box2.offsetWidth;
      box2.style.animation = '';
    }
    show(popup2);
  }

  function closePopup2() {
    hide(popup2);
  }

  /* ─────────────────────────────────────────────
     Pop-up 2 – event listener
     Hanya tombol KLAIM yang memulai video.
     Klik di luar tombol (tapi masih di dalam kotak) diabaikan.
  ───────────────────────────────────────────── */
  if (btnClaim) {
    btnClaim.addEventListener('click', function (e) {
      e.stopPropagation(); // pastikan tidak bubble
      closePopup2();
      startBSODVideo();
    });
  }

  // Klik pada overlay backdrop (di luar kotak) tidak berbuat apa-apa
  // Ini intentional: hanya tombol KLAIM yang memulai video.
  // Tidak ada listener pada #td-popup-2 secara keseluruhan yang menutup pop-up,
  // agar pengguna tidak bisa keluar dari pop-up 2 dengan sembarangan klik.

  /* ─────────────────────────────────────────────
     Video BSOD
  ───────────────────────────────────────────── */
  function startBSODVideo() {
    if (!videoOverlay || !bsodVideo) return;

    show(videoOverlay);

    // Sembunyikan kursor selama video berlangsung
    videoOverlay.classList.add('cursor-hidden');
    document.body.style.cursor = 'none';

    // Coba putar video
    bsodVideo.currentTime = 0;
    const playPromise = bsodVideo.play();

    if (playPromise !== undefined) {
      playPromise.catch(function (err) {
        console.warn('[TeachersDay] Video gagal diputar:', err.message);
        // Tampilkan pesan error yang wajar; halaman tidak rusak
        videoOverlay.classList.add('show-error');
        // Kembalikan kursor agar pengguna bisa tetap berinteraksi
        restoreCursor();
      });
    }
  }

  function stopBSODVideo() {
    if (!bsodVideo) return;
    bsodVideo.pause();
    bsodVideo.currentTime = 0;
    hide(videoOverlay);
    videoOverlay.classList.remove('cursor-hidden');
    videoOverlay.classList.remove('show-error');
    restoreCursor();
  }

  function restoreCursor() {
    document.body.style.cursor = '';
    if (videoOverlay) videoOverlay.classList.remove('cursor-hidden');
  }

  // Ketika video selesai: hentikan overlay, kembalikan kursor
  // Siapkan state untuk tahap berikutnya (terminal / kenangan)
  if (bsodVideo) {
    bsodVideo.addEventListener('ended', function () {
      stopBSODVideo();
      // Callback/state untuk tahap berikutnya dapat dipasang di sini:
      // window.dispatchEvent(new CustomEvent('td:bsod-ended'));
      console.info('[TeachersDay] Video BSOD selesai. Siap untuk tahap selanjutnya.');
    });

    // Jika file video tidak ditemukan, tampilkan pesan error konsol – halaman tetap berjalan
    bsodVideo.addEventListener('error', function () {
      const src = bsodVideo.currentSrc || bsodVideo.querySelector('source')?.src || '(tidak diketahui)';
      console.warn(
        '[TeachersDay] File video tidak ditemukan atau format tidak didukung:', src,
        '\nLetakkan file bsod-prank.mp4 di: frontend/pages/landing/assets/videos/bsod-prank.mp4'
      );
      if (videoOverlay && !videoOverlay.classList.contains('is-hidden')) {
        videoOverlay.classList.add('show-error');
        restoreCursor();
      }
    });
  }

  /* ─────────────────────────────────────────────
     Inisialisasi: mulai timer pertama
  ───────────────────────────────────────────── */
  function init() {
    // Semua elemen tersembunyi di awal (via kelas is-hidden di HTML)
    schedulePopup1();
  }

  // Jalankan setelah DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
