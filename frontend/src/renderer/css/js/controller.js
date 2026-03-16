/**
 * Xbox 360 Metro Dashboard - Controller & Keyboard Navigation
 * Supports:
 *  - Xbox / generic gamepad via Gamepad API
 *  - Keyboard arrow keys for development / fallback
 *
 * Focus model: a flat list of "focusable" elements is built per tab.
 * D-Pad or arrow keys move through the list spatially (nearest-neighbour).
 */

(function () {
  'use strict';

  // ─── Config ────────────────────────────────────
  const GAMEPAD_POLL_MS = 50;
  const DEADZONE        = 0.4;
  const REPEAT_DELAY_MS = 180; // first repeat
  const REPEAT_RATE_MS  = 120; // subsequent

  // Xbox button indices (standard mapping)
  const BTN = {
    A:      0,
    B:      1,
    X:      2,
    Y:      3,
    LB:     4,
    RB:     5,
    LT:     6,
    RT:     7,
    SELECT: 8,
    START:  9,
    LS:     10,
    RS:     11,
    DPAD_U: 12,
    DPAD_D: 13,
    DPAD_L: 14,
    DPAD_R: 15,
    HOME:   16,
  };

  // ─── State ────────────────────────────────────
  let focusedIndex     = 0;
  let focusables       = [];
  let lastButtonState  = {};
  let repeatTimers     = {};
  let pollInterval     = null;

  // ─── Build focusable list for visible tab ──────
  function rebuildFocusables() {
    focusables = Array.from(
      document.querySelectorAll(
        '.tab-panel.active .focusable, .nav-item, .side-item'
      )
    ).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

    if (focusables.length > 0) {
      focusedIndex = Math.min(focusedIndex, focusables.length - 1);
      setFocus(focusedIndex);
    }
  }

  function setFocus(index) {
    focusables.forEach(el => el.classList.remove('focused'));
    if (focusables[index]) {
      focusedIndex = index;
      focusables[index].classList.add('focused');
      focusables[index].focus({ preventScroll: false });
    }
  }

  // ─── Spatial navigation helper ─────────────────
  function findNearest(dir) {
    const current = focusables[focusedIndex];
    if (!current) return focusedIndex;

    const cr = current.getBoundingClientRect();
    const cx = cr.left + cr.width  / 2;
    const cy = cr.top  + cr.height / 2;

    let bestIndex = focusedIndex;
    let bestScore = Infinity;

    focusables.forEach((el, i) => {
      if (i === focusedIndex) return;
      const r  = el.getBoundingClientRect();
      const ex = r.left + r.width  / 2;
      const ey = r.top  + r.height / 2;
      const dx = ex - cx;
      const dy = ey - cy;

      let inDirection = false;
      switch (dir) {
        case 'up':    inDirection = dy < -10; break;
        case 'down':  inDirection = dy > 10;  break;
        case 'left':  inDirection = dx < -10; break;
        case 'right': inDirection = dx > 10;  break;
      }
      if (!inDirection) return;

      // Weighted Manhattan: prefer the axis of travel
      const primary   = (dir === 'up' || dir === 'down') ? Math.abs(dy) : Math.abs(dx);
      const secondary = (dir === 'up' || dir === 'down') ? Math.abs(dx) : Math.abs(dy);
      const score     = primary + secondary * 2.5;

      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    });

    return bestIndex;
  }

  function move(dir) {
    const next = findNearest(dir);
    if (next !== focusedIndex) setFocus(next);
  }

  function activate() {
    const el = focusables[focusedIndex];
    if (el) el.click();
  }

  function goBack() {
    // Navigate to home tab on B press
    const homeTab = document.querySelector('.nav-item[data-tab="home"]');
    if (homeTab) homeTab.click();
  }

  // ─── Keyboard fallback ─────────────────────────
  document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowUp':    e.preventDefault(); move('up');    break;
      case 'ArrowDown':  e.preventDefault(); move('down');  break;
      case 'ArrowLeft':  e.preventDefault(); move('left');  break;
      case 'ArrowRight': e.preventDefault(); move('right'); break;
      case 'Enter':      e.preventDefault(); activate();    break;
      case 'Backspace':
      case 'Escape':     e.preventDefault(); goBack();      break;
    }
  });

  // ─── Gamepad API ───────────────────────────────
  function getActiveGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const pad of pads) {
      if (pad && pad.connected) return pad;
    }
    return null;
  }

  function handleButton(btnIndex, pressed) {
    const wasPressed = lastButtonState[btnIndex];
    if (pressed && !wasPressed) {
      onButtonDown(btnIndex);
      // Start repeat timer for directional buttons
      if ([BTN.DPAD_U, BTN.DPAD_D, BTN.DPAD_L, BTN.DPAD_R].includes(btnIndex)) {
        repeatTimers[btnIndex] = setTimeout(() => {
          repeatTimers[btnIndex] = setInterval(() => onButtonDown(btnIndex), REPEAT_RATE_MS);
        }, REPEAT_DELAY_MS);
      }
    } else if (!pressed && wasPressed) {
      clearTimeout(repeatTimers[btnIndex]);
      clearInterval(repeatTimers[btnIndex]);
      delete repeatTimers[btnIndex];
    }
    lastButtonState[btnIndex] = pressed;
  }

  function onButtonDown(btnIndex) {
    switch (btnIndex) {
      case BTN.DPAD_U:  move('up');    break;
      case BTN.DPAD_D:  move('down');  break;
      case BTN.DPAD_L:  move('left');  break;
      case BTN.DPAD_R:  move('right'); break;
      case BTN.A:       activate();    break;
      case BTN.B:       goBack();      break;
      case BTN.RB:      cycleTabRight(); break;
      case BTN.LB:      cycleTabLeft();  break;
      case BTN.START:   activate();    break;
    }
  }

  function handleStick(ax, ay) {
    if      (ay < -DEADZONE) move('up');
    else if (ay >  DEADZONE) move('down');
    else if (ax < -DEADZONE) move('left');
    else if (ax >  DEADZONE) move('right');
  }

  let stickCooldown = false;
  function pollGamepads() {
    const pad = getActiveGamepad();
    if (!pad) return;

    pad.buttons.forEach((btn, i) => handleButton(i, btn.pressed));

    // Left stick
    const ax = pad.axes[0] || 0;
    const ay = pad.axes[1] || 0;
    if (!stickCooldown && (Math.abs(ax) > DEADZONE || Math.abs(ay) > DEADZONE)) {
      handleStick(ax, ay);
      stickCooldown = true;
      setTimeout(() => { stickCooldown = false; }, 200);
    }
  }

  // ─── Tab cycling with bumpers ──────────────────
  const TAB_ORDER = ['bing','home','social','video','games','music','apps','settings'];

  function cycleTabRight() {
    const navItems = document.querySelectorAll('.nav-item');
    const current  = document.querySelector('.nav-item.active');
    const idx      = Array.from(navItems).indexOf(current);
    const next     = navItems[(idx + 1) % navItems.length];
    if (next) next.click();
  }

  function cycleTabLeft() {
    const navItems = document.querySelectorAll('.nav-item');
    const current  = document.querySelector('.nav-item.active');
    const idx      = Array.from(navItems).indexOf(current);
    const prev     = navItems[(idx - 1 + navItems.length) % navItems.length];
    if (prev) prev.click();
  }

  // ─── Observe tab changes ───────────────────────
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.target.classList && m.target.classList.contains('tab-panel')) {
        setTimeout(rebuildFocusables, 50); // let CSS animate first
        break;
      }
    }
  });
  document.querySelectorAll('.tab-panel').forEach(p => {
    observer.observe(p, { attributes: true, attributeFilter: ['class'] });
  });

  // ─── Gamepad connection events ─────────────────
  window.addEventListener('gamepadconnected', e => {
    console.log(`%c Gamepad connected: ${e.gamepad.id} `, 'background:#52b043;color:#fff;padding:2px 6px;border-radius:3px;');
    if (!pollInterval) pollInterval = setInterval(pollGamepads, GAMEPAD_POLL_MS);
  });

  window.addEventListener('gamepaddisconnected', e => {
    console.log(`Gamepad disconnected: ${e.gamepad.id}`);
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const anyConnected = Array.from(pads).some(p => p && p.connected);
    if (!anyConnected && pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  });

  // Start polling if gamepad already connected (e.g., page reload)
  if (getActiveGamepad()) {
    pollInterval = setInterval(pollGamepads, GAMEPAD_POLL_MS);
  }

  // ─── Init ──────────────────────────────────────
  setTimeout(rebuildFocusables, 100);

})();
