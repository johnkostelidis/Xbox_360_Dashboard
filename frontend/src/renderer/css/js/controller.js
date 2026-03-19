/**
 * Xbox 360 Metro Dashboard - Controller & Keyboard Navigation
 * Supports:
 *  - Xbox / generic gamepad via Gamepad API
 *  - Keyboard arrow keys for development / fallback
 *
 * Navigation model — two containers:
 *   'nav'     : the tab bar (Left/Right switch tabs, Down → content)
 *   'content' : the active tab's tiles (Up at top edge → nav, Left/Right at edge cycle tabs)
 */

(function () {
  'use strict';

  // ─── Config ────────────────────────────────────
  const GAMEPAD_POLL_MS = 50;
  const DEADZONE        = 0.4;
  const REPEAT_DELAY_MS = 180;
  const REPEAT_RATE_MS  = 120;

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

  // ─── Sounds ────────────────────────────────────
  const sndSelect  = new Audio('../../../sounds/inside_container_selection.mp3');
  sndSelect.volume = 0.8;
  const sndBetween  = new Audio('../../../sounds/between_containers.mp3');
  sndBetween.volume = 0.8;
  const sndToTab  = new Audio('../../../sounds/container_to_tab.mp3');
  sndToTab.volume = 0.8;
  const sndEnter  = new Audio('../../../sounds/enter.mp3');
  sndEnter.volume = 0.8;
  const sndBack   = new Audio('../../../sounds/back.mp3');
  sndBack.volume  = 0.8;

  // ─── State ────────────────────────────────────
  let zone         = 'content'; // 'nav' | 'content'
  let focusedIndex = 0;         // index within content focusables
  let focusables   = [];        // tiles in the active tab

  let lastButtonState = {};
  let repeatTimers    = {};
  let pollInterval    = null;

  // ─── Nav container helpers ─────────────────────
  function navItems() {
    return Array.from(document.querySelectorAll('.nav-item'));
  }

  function activeNavIndex() {
    return navItems().indexOf(document.querySelector('.nav-item.active'));
  }

  function setNavFocus(idx) {
    const items = navItems();
    items.forEach(el => el.classList.remove('nav-focused'));
    if (items[idx]) items[idx].classList.add('nav-focused');
  }

  function enterNav() {
    zone = 'nav';
    focusables.forEach(el => el.classList.remove('focused'));
    setNavFocus(activeNavIndex());
    sndToTab.currentTime = 0;
    sndToTab.play().catch(() => {});
  }

  function exitNav() {
    zone = 'content';
    navItems().forEach(el => el.classList.remove('nav-focused'));
    focusedIndex = 0;
    if (focusables.length > 0) setFocus(0);
    sndSelect.currentTime = 0;
    sndSelect.play().catch(() => {});
  }

  // ─── Content container ─────────────────────────
  function rebuildFocusables() {
    focusables = Array.from(
      document.querySelectorAll('.tab-panel.active .focusable')
    ).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

    // Always keep focusedIndex in bounds
    if (focusables.length > 0) {
      focusedIndex = Math.min(Math.max(0, focusedIndex), focusables.length - 1);
    }

    if (zone === 'nav') {
      // Stay in nav — just refresh the highlight after the tab change
      setNavFocus(activeNavIndex());
    } else if (focusables.length > 0) {
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

  // ─── Spatial navigation ────────────────────────
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

  // ─── Move — dispatches by active container ─────
  function move(dir) {
    if (zone === 'nav') {
      const idx   = activeNavIndex();
      const items = navItems();
      if (dir === 'left'  && idx > 0)                { items[idx - 1].click(); setNavFocus(idx - 1); sndBetween.currentTime = 0; sndBetween.play().catch(() => {}); }
      else if (dir === 'right' && idx < items.length - 1) { items[idx + 1].click(); setNavFocus(idx + 1); sndBetween.currentTime = 0; sndBetween.play().catch(() => {}); }
      else if (dir === 'down') { exitNav(); }
      // up: do nothing — already at top
      return;
    }

    // ── content container ──
    const next = findNearest(dir);
    if (next !== focusedIndex) {
      setFocus(next);
      sndSelect.currentTime = 0;
      sndSelect.play().catch(() => {});
    } else {
      if      (dir === 'up')    enterNav();
      else if (dir === 'left')  cycleTabLeft();
      else if (dir === 'right') cycleTabRight();
      // down at bottom edge: do nothing
    }
  }

  function activate() {
    if (zone === 'nav') {
      // Enter key on a nav item just moves down into content
      exitNav();
      return;
    }
    const el = focusables[focusedIndex];
    if (el) {
      sndEnter.currentTime = 0;
      sndEnter.play().catch(() => {});
      el.click();
    }
  }

  function goBack() {
    sndBack.currentTime = 0;
    sndBack.play().catch(() => {});
    if (window.isAppOpen && window.closeApp) {
      window.closeApp();
      return;
    }
    if (zone === 'nav') {
      const homeTab = document.querySelector('.nav-item[data-tab="home"]');
      if (homeTab) homeTab.click();
      return;
    }
    // If a subfolder is open (e.g. settings detail), close it first
    if (window.handleContentBack && window.handleContentBack()) return;
    // Otherwise go up to the tab bar
    enterNav();
  }

  // ─── Tab cycling (no wrap) ─────────────────────
  function cycleTabRight() {
    const items = navItems();
    const idx   = activeNavIndex();
    if (idx < items.length - 1) {
      items[idx + 1].click();
      sndBetween.currentTime = 0;
      sndBetween.play().catch(() => {});
    }
  }

  function cycleTabLeft() {
    const items = navItems();
    const idx   = activeNavIndex();
    if (idx > 0) {
      items[idx - 1].click();
      sndBetween.currentTime = 0;
      sndBetween.play().catch(() => {});
    }
  }

  // ─── Keyboard ──────────────────────────────────
  document.addEventListener('keydown', e => {
    const inInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (e.key === 'Backspace' && inInput) return;
    if (e.key === 'Backspace' || e.key === 'Escape') {
      e.preventDefault();
      goBack();
      return;
    }
    if (window.isAppOpen) return;

    switch (e.key) {
      case 'ArrowUp':    e.preventDefault(); move('up');    break;
      case 'ArrowDown':  e.preventDefault(); move('down');  break;
      case 'ArrowLeft':  e.preventDefault(); move('left');  break;
      case 'ArrowRight': e.preventDefault(); move('right'); break;
      case 'Enter':      e.preventDefault(); activate();    break;
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
    if (btnIndex === BTN.B) { goBack(); return; }
    if (window.isAppOpen) return;

    switch (btnIndex) {
      case BTN.DPAD_U:  move('up');         break;
      case BTN.DPAD_D:  move('down');       break;
      case BTN.DPAD_L:  move('left');       break;
      case BTN.DPAD_R:  move('right');      break;
      case BTN.A:       activate();         break;
      case BTN.RB:      cycleTabRight();    break;
      case BTN.LB:      cycleTabLeft();     break;
      case BTN.START:   activate();         break;
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

    const ax = pad.axes[0] || 0;
    const ay = pad.axes[1] || 0;
    if (!stickCooldown && (Math.abs(ax) > DEADZONE || Math.abs(ay) > DEADZONE)) {
      handleStick(ax, ay);
      stickCooldown = true;
      setTimeout(() => { stickCooldown = false; }, 200);
    }
  }

  // ─── Observe tab changes ───────────────────────
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.target.classList && m.target.classList.contains('tab-panel')) {
        setTimeout(rebuildFocusables, 50);
        break;
      }
    }
  });
  document.querySelectorAll('.tab-panel').forEach(p => {
    observer.observe(p, { attributes: true, attributeFilter: ['class'] });
  });

  // ─── Gamepad connection ────────────────────────
  window.addEventListener('gamepadconnected', e => {
    console.log(`%c Gamepad connected: ${e.gamepad.id} `, 'background:#52b043;color:#fff;padding:2px 6px;border-radius:3px;');
    if (!pollInterval) pollInterval = setInterval(pollGamepads, GAMEPAD_POLL_MS);
  });

  window.addEventListener('gamepaddisconnected', e => {
    console.log(`Gamepad disconnected: ${e.gamepad.id}`);
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const anyConnected = Array.from(pads).some(p => p && p.connected);
    if (!anyConnected && pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  });

  if (getActiveGamepad()) {
    pollInterval = setInterval(pollGamepads, GAMEPAD_POLL_MS);
  }

  // ─── Init ──────────────────────────────────────
  window.rebuildFocusables = rebuildFocusables;
  window.focusFirstFocusable = function () { focusedIndex = 0; rebuildFocusables(); };
  window.playBackSound = function () { sndBack.currentTime = 0; sndBack.play().catch(() => {}); };
  setTimeout(rebuildFocusables, 100);

})();
