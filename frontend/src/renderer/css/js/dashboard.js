/**
 * Xbox 360 Metro Dashboard - Main Dashboard Logic
 * Handles tab navigation, tile interactions, and UI state.
 */

(function () {
  'use strict';

  // ─── State ────────────────────────────────────
  const state = {
    activeTab: 'home',
    spotlightIndex: 0,
    spotlightTimer: null,
  };

  // ─── DOM refs ──────────────────────────────────
  const navItems    = document.querySelectorAll('.nav-item');
  const tabPanels   = document.querySelectorAll('.tab-panel');
  const spotDots    = document.querySelectorAll('.spotlight-dots .dot');

  // ─── Tab Navigation ────────────────────────────
  function switchTab(tabName) {
    if (state.activeTab === tabName) return;
    state.activeTab = tabName;

    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });

    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
  });

  // ─── Spotlight Dots Cycle ──────────────────────
  function cycleSpotlight() {
    spotDots.forEach(d => d.classList.remove('active'));
    state.spotlightIndex = (state.spotlightIndex + 1) % spotDots.length;
    spotDots[state.spotlightIndex].classList.add('active');
  }

  if (spotDots.length) {
    state.spotlightTimer = setInterval(cycleSpotlight, 3500);
  }

  // ─── Tile Actions ──────────────────────────────
  document.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', () => handleAction(el.dataset.action));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAction(el.dataset.action);
      }
    });
  });

  function handleAction(action) {
    switch (action) {
      case 'closeTray':
        showToast('Disc tray closed');
        break;
      case 'quickplay':
        showToast('No recent games — load your library via the backend');
        break;
      case 'spotlight':
        showToast('Xbox LIVE — Backend not connected');
        break;
      case 'xboxCanada':
        showToast('Xbox Canada');
        break;
      case 'ad':
        showToast('Advertisement');
        break;
      case 'friends':
        switchTab('social');
        break;
      case 'social':
        switchTab('social');
        break;
      case 'signIn':
        showToast('Sign In — Backend not connected');
        break;
      default:
        showToast(action);
    }
  }

  // ─── Toast Notification ────────────────────────
  let toastTimer = null;
  const toastEl = document.getElementById('toast');

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  // ─── Games Library (future backend) ───────────
  async function loadGames() {
    if (!window.xboxAPI) return;
    try {
      const games = await window.xboxAPI.getGames();
      if (games && games.length > 0) {
        renderGames(games);
      }
    } catch (e) {
      console.warn('Backend not available:', e);
    }
  }

  function renderGames(games) {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    games.forEach(game => {
      const tile = document.createElement('div');
      tile.className = 'game-tile focusable';
      tile.tabIndex = 0;
      tile.dataset.gameId = game.id;
      tile.innerHTML = `
        <div class="game-cover">
          ${game.coverUrl ? `<img src="${game.coverUrl}" alt="${game.title}" loading="lazy">` : ''}
        </div>
        <div class="game-title">${game.title}</div>
      `;
      tile.addEventListener('click', () => launchGame(game.id, game.title));
      tile.addEventListener('keydown', e => {
        if (e.key === 'Enter') launchGame(game.id, game.title);
      });
      grid.appendChild(tile);
    });
  }

  async function launchGame(id, title) {
    if (!window.xboxAPI) {
      showToast(`Launch: ${title} — Backend not connected`);
      return;
    }
    showToast(`Launching ${title}…`);
    try {
      const result = await window.xboxAPI.launchGame(id);
      if (!result.success) {
        showToast(result.message || 'Launch failed');
      }
    } catch (e) {
      showToast('Launch failed — check backend');
    }
  }

  // ─── Init ──────────────────────────────────────
  loadGames();
  console.log('%c Xbox 360 Dashboard ready ', 'background:#52b043;color:#fff;padding:4px 8px;border-radius:3px;');

})();
