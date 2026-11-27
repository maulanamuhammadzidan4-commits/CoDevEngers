# Teacher's Day Celebration Simulation

This folder contains a standalone, browser-based Teacher's Day celebration and prank simulation. It has no CoDevEngers authentication, dashboard, or Supabase dependencies.

## Run locally

The main entry point is [`index.html`](./index.html). From this folder, start a local static server:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>. A local server is recommended over opening the file directly so browsers can load and play the video assets consistently. No build step or package installation is required.

## Assets

- `assets/css/` — all page, popup, video, terminal, and message styles.
- `assets/js/` — popup timer and the interactive celebration sequence.
- `assets/videos/` — video media used in the simulation. The expected filenames are `bsod-prank.mp4` and `teacher-memories.mp4`.

There are no local image or font assets at present. Decorative icons are text/emoji, and optional web fonts load from Google Fonts with system-font fallbacks.

## Sequence

1. A mysterious popup appears 30 seconds after opening the page.
2. Its close button dismisses it and schedules it to appear again after another 30 seconds. Clicking the popup content opens the giveaway popup.
3. Clicking a giveaway button starts `bsod-prank.mp4`.
4. When that video ends, a Windows Terminal-style screen types out a message.
5. `OPEN_SPECIAL_MESSAGE` opens `teacher-memories.mp4`; when it ends, the final Teacher's Day message appears.

The giveaway card is also visible on the page, so its button can start the video without waiting for the popups.

## Browser and safety notes

Use a modern browser with HTML5 MP4 video support. Video playback depends on the codecs available in the browser. The videos start only after a user click; if a video cannot be loaded or played, the page displays an error. Internet access is only needed for the optional Google Fonts; fallback fonts are used offline.

This is an independent website simulation only. It does not perform operating-system operations, crash or alter the operating system, lock the browser, or prevent users from leaving the page. During the video, terminal, memory-video, and final-message stages, use **Keluar dari simulasi** or press **Escape** to exit the sequence. The popup stages also have close buttons.
