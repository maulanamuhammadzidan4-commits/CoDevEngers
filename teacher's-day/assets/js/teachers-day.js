/* Independent Teacher's Day celebration simulation. */

(function () {
  'use strict';

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
     Pop-up 1 – kotak misterius, repeated until clicked
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

    // The feature now runs on one standalone page instead of navigating away.
    const box1 = popup1.querySelector('.td-box-1');
    if (box1) {
      box1.addEventListener('click', function () {
        clearTimer();
        hide(popup1);
        show(document.getElementById('td-popup-2'));
      });
    }

    // Jadwalkan pop-up pertama
    schedulePopup();
  }

  /* ══════════════════════════════════════════════
     Giveaway, simulated terminal, memory video, and final message
  ═══════════════════════════════════════════════ */
  function initModeB() {
    const popup2       = document.getElementById('td-popup-2');
    const videoOverlay = document.getElementById('td-video-overlay');
    const bsodVideo    = document.getElementById('td-bsod-video');
    const terminal     = document.getElementById('td-terminal-screen');
    const terminalOutput = document.getElementById('td-terminal-output');
    const terminalAction = document.getElementById('td-terminal-action');
    const openMemoryButton = document.getElementById('td-open-memory');
    const memoryOverlay = document.getElementById('td-memory-overlay');
    const memoryVideo  = document.getElementById('td-memory-video');
    const memoryError  = document.getElementById('td-memory-error');
    const finalMessage = document.getElementById('td-final-message');
    const exitButton = document.getElementById('td-exit-simulation');
    const popup2Close = document.getElementById('td-popup2-close');
    const TERMINAL_CHARACTER_DELAY_MS = 18;
    const TERMINAL_LINE_DELAY_MS = 140;
    const terminalText = [
      'Microsoft Windows [Version 10.0.22631.4391]',
      '(c) Microsoft Corporation. All rights reserved.',
      '',
      'C:\\Users\\Student> system_check --teacher',
      '',
      'Initializing memory archive...',
      'Scanning classroom memories...',
      'Checking friendship database...',
      'Loading special message...',
      '',
      '[OK] Memories found.',
      '[OK] Special message prepared.',
      '',
      'C:\\Users\\Student> open teacher_memories',
      '',
      'Opening special memory...'
    ].join('\n');
    let sequenceState = 'giveaway';
    let terminalStarted = false;
    let typingTimer = null;
    let typedCharacters = 0;

    // Both giveaway buttons start the same user-initiated simulation.
    document.querySelectorAll('.td-btn-claim').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        hide(popup2);
        startVideo();
      });
    });

    function startVideo() {
      if (!videoOverlay || !bsodVideo || sequenceState !== 'giveaway') return;
      sequenceState = 'bsod';
      show(videoOverlay);
      show(exitButton);

      bsodVideo.currentTime = 0;
      const p = bsodVideo.play();
      if (p !== undefined) {
        p.catch(function (err) {
          console.warn('[TeachersDay] Video gagal diputar:', err.message);
          videoOverlay.classList.add('td-show-error');
        });
      }
    }

    function beginTerminal() {
      if (terminalStarted || !terminal || !terminalOutput) return;
      terminalStarted = true;
      sequenceState = 'terminal';
      show(terminal);
      show(exitButton);
      typeNextCharacter();
    }

    function typeNextCharacter() {
      if (sequenceState !== 'terminal' || !terminalOutput) return;

      if (typedCharacters >= terminalText.length) {
        if (terminalAction) show(terminalAction);
        return;
      }

      const character = terminalText.charAt(typedCharacters);
      terminalOutput.textContent += character;
      typedCharacters += 1;
      typingTimer = window.setTimeout(
        typeNextCharacter,
        character === '\n' ? TERMINAL_LINE_DELAY_MS : TERMINAL_CHARACTER_DELAY_MS
      );
    }

    function openMemoryVideo() {
      if (sequenceState !== 'terminal' || !memoryOverlay || !memoryVideo) return;
      sequenceState = 'memory-video';
      if (typingTimer !== null) {
        window.clearTimeout(typingTimer);
        typingTimer = null;
      }
      hide(terminal);
      show(memoryOverlay);
      show(exitButton);

      if (memoryVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        showMemoryVideoError();
        return;
      }

      const playRequest = memoryVideo.play();
      if (playRequest !== undefined) {
        playRequest.catch(function (err) {
          console.warn('[TeachersDay] Video kenangan gagal diputar:', err.message);
          if (memoryError) show(memoryError);
        });
      }
    }

    function showFinalMessage() {
      if (sequenceState !== 'memory-video') return;
      sequenceState = 'final-message';
      hide(memoryOverlay);
      show(finalMessage);
      show(exitButton);
    }

    function showMemoryVideoError() {
      const src = memoryVideo && memoryVideo.currentSrc
        ? memoryVideo.currentSrc
        : 'assets/videos/teacher-memories.mp4';
      console.warn('[TeachersDay] Video kenangan tidak dapat dimuat:', src,
        '\nLetakkan: teacher\'s-day/assets/videos/teacher-memories.mp4');
      if (memoryError) show(memoryError);
    }

    function stopVideo() {
      if (!bsodVideo) return;
      bsodVideo.pause();
      bsodVideo.currentTime = 0;
      hide(videoOverlay);
      if (videoOverlay) videoOverlay.classList.remove('td-show-error');
    }

    if (bsodVideo) {
      bsodVideo.addEventListener('ended', function () {
        if (sequenceState !== 'bsod') return;
        stopVideo();
        beginTerminal();
        window.dispatchEvent(new CustomEvent('td:bsod-ended'));
      });

      bsodVideo.addEventListener('error', function () {
        const src = bsodVideo.currentSrc || '(tidak diketahui)';
        console.warn('[TeachersDay] File video tidak ditemukan:', src,
          '\nLetakkan: teacher\'s-day/assets/videos/bsod-prank.mp4');
        if (videoOverlay && !videoOverlay.classList.contains('td-hidden')) {
          videoOverlay.classList.add('td-show-error');
        }
      });
    }

    if (openMemoryButton) {
      openMemoryButton.addEventListener('click', openMemoryVideo);
    }

    if (memoryVideo) {
      memoryVideo.addEventListener('ended', showFinalMessage);
      memoryVideo.addEventListener('error', showMemoryVideoError);
    }

    function exitSimulation() {
      [bsodVideo, memoryVideo].forEach(function (video) {
        if (!video) return;
        video.pause();
        video.currentTime = 0;
      });
      if (typingTimer !== null) {
        window.clearTimeout(typingTimer);
        typingTimer = null;
      }
      [videoOverlay, terminal, memoryOverlay, finalMessage].forEach(hide);
      if (videoOverlay) videoOverlay.classList.remove('td-show-error');
      hide(memoryError);
      hide(terminalAction);
      if (terminalOutput) terminalOutput.textContent = '';
      terminalStarted = false;
      typedCharacters = 0;
      sequenceState = 'giveaway';
      hide(exitButton);
    }

    if (exitButton) exitButton.addEventListener('click', exitSimulation);
    if (popup2Close) {
      popup2Close.addEventListener('click', function () {
        hide(popup2);
      });
    }
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (sequenceState !== 'giveaway') {
        exitSimulation();
      } else {
        hide(popup2);
      }
    });
  }

  /* Create the first popup so its markup stays self-contained. */
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
    initModeA();
    initModeB();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
