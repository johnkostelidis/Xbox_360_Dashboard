/**
 * Xbox 360 Metro Dashboard - Main Dashboard Logic
 * Handles tab navigation, tile interactions, and UI state.
 */

(function () {
  'use strict';

  // ─── Sample Games (shown when no backend connected) ────
  const SAMPLE_GAMES = [
    { id: 'halo3',    title: 'Halo 3',                      color: '#1a3a5c' },
    { id: 'gow2',     title: 'Gears of War 2',              color: '#8b2500' },
    { id: 'codmw2',   title: 'Call of Duty: MW2',           color: '#1c1c1c' },
    { id: 'gtaiv',    title: 'Grand Theft Auto IV',         color: '#2a4a2a' },
    { id: 'rdr',      title: 'Red Dead Redemption',         color: '#5a3a1a' },
    { id: 'me2',      title: 'Mass Effect 2',               color: '#0a1a3a' },
    { id: 'skyrim',   title: 'Skyrim',                      color: '#2a3a4a' },
    { id: 'fo3',      title: 'Fallout 3',                   color: '#3a3a1a' },
    { id: 'batman',   title: 'Batman: Arkham City',         color: '#1a1a3a' },
    { id: 'bl2',      title: 'Borderlands 2',               color: '#5a4a1a' },
    { id: 'portal2',  title: 'Portal 2',                    color: '#1a2a3a' },
    { id: 'bioshock', title: 'BioShock Infinite',           color: '#1a2a4a' },
    { id: 'acii',     title: "Assassin's Creed II",         color: '#2a1a3a' },
    { id: 'minecraft',title: 'Minecraft',                   color: '#3a5a2a' },
    { id: 'l4d2',     title: 'Left 4 Dead 2',               color: '#4a1a1a' },
    { id: 'mgsv',     title: 'Metal Gear Solid V',          color: '#1a1a2a' },
  ];

  // ─── Settings sub-panel data ───────────────────
  const SETTINGS_DATA = {
    System: [
      { label: 'Memory',            value: '12 GB available' },
      { label: 'Console Info',      value: '' },
      { label: 'Family Timer',      value: 'Off' },
      { label: 'Auto-Off',          value: '6 Hours' },
      { label: 'Language',          value: 'English' },
      { label: 'Locale',            value: 'United States' },
    ],
    Preferences: [
      { label: 'Startup',           value: 'Dashboard' },
      { label: 'Notification Sound',value: 'On' },
      { label: 'Background Art',    value: 'Xbox Green' },
      { label: 'Display Clock',     value: 'On' },
    ],
    Profile: [
      { label: 'Edit Profile',      value: '' },
      { label: 'Gamer Picture',     value: '' },
      { label: 'Motto',             value: '' },
      { label: 'Gamertag',          value: 'Player One' },
    ],
    Kinect: [
      { label: 'Kinect Sensor',     value: 'Not connected' },
      { label: 'Kinect Tuner',      value: '' },
      { label: 'Kinect ID',         value: '' },
      { label: 'Voice',             value: 'Off' },
    ],
    Account: [
      { label: 'Manage Account',    value: '' },
      { label: 'Subscriptions',     value: 'Xbox LIVE Gold' },
      { label: 'Payment Options',   value: '' },
      { label: 'Billing',           value: '' },
    ],
    Privacy: [
      { label: 'Online Status',     value: 'Friends Only' },
      { label: 'Share Data with MS',value: 'On' },
      { label: 'Voice Output',      value: 'Off' },
      { label: 'Content Settings',  value: '' },
    ],
    Family: [
      { label: 'Parental Controls', value: 'Off' },
      { label: 'Content Controls',  value: '' },
      { label: 'Timer',             value: 'Off' },
      { label: 'Family Center',     value: '' },
    ],
  };

  // ─── State ────────────────────────────────────
  const state = {
    activeTab: 'home',
    spotlightIndex: 0,
    spotlightTimer: null,
    transitioning: false,
  };

  // Tab order used to determine slide direction
  const TAB_ORDER = ['bing', 'home', 'social', 'video', 'games', 'music', 'apps', 'settings'];

  // ─── DOM refs ──────────────────────────────────
  const navItems    = document.querySelectorAll('.nav-item');
  const tabPanels   = document.querySelectorAll('.tab-panel');
  const spotDots    = document.querySelectorAll('.spotlight-dots .dot');
  const dashContent = document.getElementById('dashboardContent');

  // ─── Tab Navigation ────────────────────────────
  const TRANSITION_MS = 280;

  function switchTab(tabName) {
    if (state.activeTab === tabName || state.transitioning) return;

    const oldIdx = TAB_ORDER.indexOf(state.activeTab);
    const newIdx = TAB_ORDER.indexOf(tabName);
    const goingRight = newIdx > oldIdx;

    const outgoing = document.getElementById(`tab-${state.activeTab}`);
    const incoming = document.getElementById(`tab-${tabName}`);

    state.activeTab = tabName;
    state.transitioning = true;

    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });

    // Slide outgoing panel out
    if (outgoing) {
      outgoing.classList.remove('active');
      outgoing.classList.add(goingRight ? 'tab-exit-left' : 'tab-exit-right');
    }

    // Slide incoming panel in
    if (incoming) {
      incoming.classList.add(goingRight ? 'tab-enter-right' : 'tab-enter-left');
    }

    setTimeout(() => {
      if (outgoing) outgoing.classList.remove('tab-exit-left', 'tab-exit-right');
      if (incoming) {
        incoming.classList.remove('tab-enter-right', 'tab-enter-left');
        incoming.classList.add('active');
      }
      state.transitioning = false;
    }, TRANSITION_MS);
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

  // ─── App Overlay ───────────────────────────────
  const appOverlay    = document.getElementById('appOverlay');
  const appWebview    = document.getElementById('appWebview');
  const appBackBtn    = document.getElementById('appBackBtn');
  const appNavBack    = document.getElementById('appNavBack');
  const appNavForward = document.getElementById('appNavForward');
  const appNavReload  = document.getElementById('appNavReload');
  const appLoadBar    = document.getElementById('appLoadBar');
  const appSplash     = document.getElementById('appSplash');
  const appSplashIcon = document.getElementById('appSplashIcon');
  const appSplashName = document.getElementById('appSplashName');
  const appOverlayName= document.getElementById('appOverlayName');
  const appOverlayUrl = document.getElementById('appOverlayUrl');

  const APP_COLORS = {
    'Netflix':          '#8b0000',
    'YouTube':          '#cc0000',
    'Hulu':             '#1a5c1a',
    'ESPN':             '#aa2200',
    'Spotify':          '#1a5c1a',
    'Last.fm':          '#aa0000',
    'Twitter':          '#1a8cd8',
    'Facebook':         '#1877f2',
    'Internet Explorer':'#1565c0',
    'Crackle':          '#1a1a5a',
    'Bing':             '#008272',
  };

  function openApp(name, url) {
    if (!appOverlay || !appWebview) return;

    const bg = APP_COLORS[name] || '#1e1e1e';
    if (appSplashIcon) {
      appSplashIcon.style.background = bg;
      appSplashIcon.textContent = name.slice(0, 2).toUpperCase();
    }
    if (appSplashName)  appSplashName.textContent  = name;
    if (appOverlayName) appOverlayName.textContent = name;
    if (appOverlayUrl)  appOverlayUrl.textContent  = url;
    if (appSplash)      appSplash.classList.remove('hidden');

    if (appLoadBar) {
      appLoadBar.classList.remove('done');
      appLoadBar.style.width = '';
      appLoadBar.classList.add('indeterminate');
    }

    appOverlay.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => appOverlay.classList.add('open')));

    appWebview.src = url;
    window.isAppOpen = true;
    if (appBackBtn) setTimeout(() => appBackBtn.focus(), 260);
  }

  function closeApp() {
    if (!appOverlay) return;
    appOverlay.classList.remove('open');
    window.isAppOpen = false;
    setTimeout(() => {
      appOverlay.hidden = true;
      if (appWebview) appWebview.src = 'about:blank';
      if (appLoadBar) { appLoadBar.classList.remove('indeterminate', 'done'); appLoadBar.style.width = '0'; }
      if (window.rebuildFocusables) window.rebuildFocusables();
    }, 240);
  }

  window.closeApp = closeApp;

  if (appWebview) {
    appWebview.addEventListener('did-start-loading', () => {
      if (appLoadBar) { appLoadBar.classList.remove('done'); appLoadBar.classList.add('indeterminate'); }
    });
    appWebview.addEventListener('did-stop-loading', () => {
      if (appSplash)  appSplash.classList.add('hidden');
      if (appLoadBar) { appLoadBar.classList.remove('indeterminate'); appLoadBar.style.width = '100%'; appLoadBar.classList.add('done'); }
      if (appOverlayUrl) { try { appOverlayUrl.textContent = appWebview.getURL(); } catch(e) {} }
    });
    appWebview.addEventListener('did-navigate', () => {
      if (appOverlayUrl) { try { appOverlayUrl.textContent = appWebview.getURL(); } catch(e) {} }
    });
    appWebview.addEventListener('did-navigate-in-page', () => {
      if (appOverlayUrl) { try { appOverlayUrl.textContent = appWebview.getURL(); } catch(e) {} }
    });
  }

  if (appBackBtn)    appBackBtn.addEventListener('click',    closeApp);
  if (appNavBack)    appNavBack.addEventListener('click',    () => { try { if (appWebview.canGoBack())    appWebview.goBack();    } catch(e){} });
  if (appNavForward) appNavForward.addEventListener('click', () => { try { if (appWebview.canGoForward()) appWebview.goForward(); } catch(e){} });
  if (appNavReload)  appNavReload.addEventListener('click',  () => { try { appWebview.reload(); }          catch(e){} });

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
    // openApp:Name:https://... — app tiles
    if (action.startsWith('openApp:')) {
      const parts = action.split(':');
      const name  = parts[1];
      const url   = parts.slice(2).join(':'); // preserves https://
      openApp(name, url);
      return;
    }

    switch (action) {
      case 'closeTray':
        showToast('No disc in tray');
        break;
      case 'quickplay':
        switchTab('games');
        break;
      case 'spotlight':
        openApp('Xbox', 'https://www.xbox.com');
        break;
      case 'xboxCanada':
        openApp('Xbox Canada', 'https://www.xbox.com/en-CA');
        break;
      case 'ad':
        openApp('Microsoft', 'https://www.microsoft.com');
        break;
      case 'friends':
        switchTab('social');
        break;
      case 'social':
        switchTab('social');
        break;
      case 'socialApps':
        switchTab('apps');
        break;
      case 'signIn':
        openApp('Xbox LIVE Sign In', 'https://login.live.com');
        break;
      case 'settings:back':
        closeSettingsDetail();
        break;
      case 'settings:Turn Off':
        showToast('Hold the power button on your console to turn off');
        break;
      default:
        if (action.startsWith('settings:')) {
          openSettingsDetail(action.slice(9));
        } else {
          showToast(action);
        }
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

  // ─── Settings Sub-panel ────────────────────────
  function openSettingsDetail(name) {
    const data = SETTINGS_DATA[name];
    if (!data) return;
    const main    = document.getElementById('settingsMain');
    const detail  = document.getElementById('settingsDetail');
    const content = document.getElementById('settingsDetailContent');
    const heading = document.getElementById('settingsDetailHeading');
    if (!main || !detail || !content) return;
    if (heading) heading.textContent = name;
    content.innerHTML = data.map(item => `
      <div class="setting-item focusable" tabindex="0">
        <div class="setting-label">${item.label}</div>
        ${item.value
          ? `<div class="setting-value">${item.value}</div>`
          : `<div class="setting-arrow">›</div>`}
      </div>
    `).join('');
    main.hidden   = true;
    detail.hidden = false;
    setTimeout(() => window.rebuildFocusables && window.rebuildFocusables(), 50);
  }

  function closeSettingsDetail() {
    const main   = document.getElementById('settingsMain');
    const detail = document.getElementById('settingsDetail');
    if (!main || !detail) return;
    main.hidden   = false;
    detail.hidden = true;
    setTimeout(() => window.rebuildFocusables && window.rebuildFocusables(), 50);
  }

  // ─── Games Library ─────────────────────────────
  async function loadGames() {
    if (!window.xboxAPI) {
      renderGames(SAMPLE_GAMES);
      return;
    }
    try {
      const games = await window.xboxAPI.getGames();
      renderGames(games && games.length > 0 ? games : SAMPLE_GAMES);
    } catch (e) {
      console.warn('Backend not available:', e);
      renderGames(SAMPLE_GAMES);
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
      const coverStyle = game.color ? `background:${game.color}` : '';
      tile.innerHTML = `
        <div class="game-cover" style="${coverStyle}">
          ${game.coverUrl
            ? `<img src="${game.coverUrl}" alt="${game.title}" loading="lazy">`
            : `<div class="game-cover-letter">${game.title.slice(0, 2).toUpperCase()}</div>`}
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

  // ─── Bing Search ───────────────────────────────
  const bingInput     = document.getElementById('bingInput');
  const bingSearchBtn = document.getElementById('bingSearchBtn');

  function doBingSearch(type) {
    const q = bingInput ? bingInput.value.trim() : '';
    const base = {
      search: 'https://www.bing.com/search?q=',
      images: 'https://www.bing.com/images/search?q=',
      news:   'https://www.bing.com/news/search?q=',
      videos: 'https://www.bing.com/videos/search?q=',
    };
    const t = type || 'search';
    if (q) {
      openApp('Bing', (base[t] || base.search) + encodeURIComponent(q));
    } else {
      const fallback = { search: 'https://www.bing.com', images: 'https://www.bing.com/images', news: 'https://www.bing.com/news', videos: 'https://www.bing.com/videos' };
      openApp('Bing', fallback[t] || 'https://www.bing.com');
    }
  }

  if (bingSearchBtn) bingSearchBtn.addEventListener('click', () => doBingSearch('search'));
  if (bingInput) {
    bingInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); doBingSearch('search'); }
    });
  }
  document.querySelectorAll('[data-bingcat]').forEach(cat => {
    cat.addEventListener('click', () => doBingSearch(cat.dataset.bingcat));
  });

  // ─── Window Controls ───────────────────────────
  const winMinimize   = document.getElementById('winMinimize');
  const winFullscreen = document.getElementById('winFullscreen');
  const winClose      = document.getElementById('winClose');

  if (winMinimize)   winMinimize.addEventListener('click',   () => window.xboxAPI && window.xboxAPI.minimizeWindow());
  if (winFullscreen) winFullscreen.addEventListener('click', () => window.xboxAPI && window.xboxAPI.toggleFullscreen());
  if (winClose)      winClose.addEventListener('click',      () => window.xboxAPI && window.xboxAPI.closeWindow());

  // ─── Init ──────────────────────────────────────
  loadGames();
  console.log('%c Xbox 360 Dashboard ready ', 'background:#52b043;color:#fff;padding:4px 8px;border-radius:3px;');

})();
