/**
 * Xbox 360 Metro Dashboard - Main Dashboard Logic
 * Handles tab navigation, tile interactions, and UI state.
 */

(function () {
  'use strict';

  // ─── Sample Games (shown when no backend connected) ────
  const SAMPLE_GAMES = [
    { id: 'halo3',    title: 'Halo 3',                      color: '#1a3a5c', coverUrl: '../../../game_pics/halo3.jpg' },
    { id: 'gow2',     title: 'Gears of War 2',              color: '#8b2500', coverUrl: '../../../game_pics/gearsofwar2.jpg' },
    { id: 'codmw2',   title: 'Call of Duty: MW2',           color: '#1c1c1c', coverUrl: '../../../game_pics/callofdutymw2.png' },
    { id: 'gtaiv',    title: 'Grand Theft Auto IV',         color: '#2a4a2a', coverUrl: '../../../game_pics/gtaiv.jpg' },
    { id: 'rdr',      title: 'Red Dead Redemption',         color: '#5a3a1a', coverUrl: '../../../game_pics/rdr.jpg' },
    { id: 'me2',      title: 'Mass Effect 2',               color: '#0a1a3a', coverUrl: '../../../game_pics/masseffect.png' },
    { id: 'skyrim',   title: 'Skyrim',                      color: '#2a3a4a', coverUrl: '../../../game_pics/skyrim.png' },
    { id: 'fo3',      title: 'Fallout 3',                   color: '#3a3a1a', coverUrl: '../../../game_pics/fallout.png' },
    { id: 'batman',   title: 'Batman: Arkham City',         color: '#1a1a3a', coverUrl: '../../../game_pics/batman.jpg' },
    { id: 'bl2',      title: 'Borderlands 2',               color: '#5a4a1a', coverUrl: '../../../game_pics/borderlands2.png' },
    { id: 'portal2',  title: 'Portal 2',                    color: '#1a2a3a', coverUrl: '../../../game_pics/portal2.jpg' },
    { id: 'bioshock', title: 'BioShock Infinite',           color: '#1a2a4a', coverUrl: '../../../game_pics/bioshok.jpg' },
    { id: 'acii',     title: "Assassin's Creed II",         color: '#2a1a3a', coverUrl: '../../../game_pics/asssasinscreed3.jpg' },
    { id: 'minecraft',title: 'Minecraft',                   color: '#3a5a2a', coverUrl: '../../../game_pics/minecraft.webp' },
    { id: 'l4d2',     title: 'Left 4 Dead 2',               color: '#4a1a1a', coverUrl: '../../../game_pics/leftfordead2.jpg' },
    { id: 'mgsv',     title: 'Metal Gear Solid V',          color: '#1a1a2a', coverUrl: '../../../game_pics/metalgearsolid5.png' },
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
    'Instagram':        '#833ab4',
  };

  // ─── App Catalog (all available apps with icons) ──────
  const APP_CATALOG = [
    {
      name: 'Netflix', url: 'https://www.netflix.com', color: '#8b0000',
      icon: '<div class="app-tile-brand" style="color:#e50914">NETFLIX</div>',
    },
    {
      name: 'YouTube', url: 'https://www.youtube.com', color: '#181818',
      icon: '<div class="app-tile-icon"><svg viewBox="0 0 32 22" width="44" height="30"><rect width="32" height="22" rx="4" fill="#ff0000"/><polygon points="13,5 13,17 23,11" fill="white"/></svg></div>',
    },
    {
      name: 'Hulu', url: 'https://www.hulu.com', color: '#1a3a1a',
      icon: '<div class="app-tile-brand" style="color:#3dba4e;font-size:26px">hulu</div>',
    },
    {
      name: 'ESPN', url: 'https://www.espn.com', color: '#aa2200',
      icon: '<div class="app-tile-brand" style="color:white;font-style:italic;font-size:22px">ESPN</div>',
    },
    {
      name: 'Spotify', url: 'https://open.spotify.com', color: '#1a3a1a',
      icon: '<div class="app-tile-icon"><svg viewBox="0 0 32 32" width="36" height="36"><circle cx="16" cy="16" r="15" fill="#1db954"/><path d="M8 20.5c4.5-1.5 9.5-1.5 14 0" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M7 16c5-2 11-2 16 0" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M9 11.5c4-1.5 9-1.5 13 0" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/></svg></div>',
    },
    {
      name: 'Twitter', url: 'https://x.com', color: '#1da1f2',
      icon: '<div class="app-tile-icon"><svg viewBox="0 0 32 32" width="34" height="34" fill="white"><path d="M30 7a12 12 0 01-3.4.9 6 6 0 002.6-3.3 12 12 0 01-3.8 1.4 6 6 0 00-10.2 5.4A17 17 0 012 6.4a6 6 0 001.8 8A6 6 0 012 13.7v.1a6 6 0 004.8 5.8 6 6 0 01-2.7.1 6 6 0 005.6 4.2 12 12 0 01-7.5 2.6H1a17 17 0 009.2 2.7c11 0 17-9.1 17-17v-.8A12 12 0 0030 7z"/></svg></div>',
    },
    {
      name: 'Facebook', url: 'https://www.facebook.com', color: '#1877f2',
      icon: '<div class="app-tile-icon"><svg viewBox="0 0 32 32" width="32" height="32" fill="white"><path d="M18 32V20h4l1-5h-5v-3c0-1.4.4-2.4 2.4-2.4H23V4.8A34 34 0 0019.2 4.6C15 4.6 12 7.2 12 11.9V15H8v5h4v12h6z"/></svg></div>',
    },
    {
      name: 'Internet Explorer', url: 'https://www.google.com', color: '#1565c0',
      icon: '<div class="app-tile-icon"><svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="white" stroke-width="1.5"><circle cx="16" cy="16" r="13"/><ellipse cx="16" cy="16" rx="7" ry="13"/><line x1="3" y1="16" x2="29" y2="16"/><line x1="5" y1="9" x2="27" y2="9"/><line x1="5" y1="23" x2="27" y2="23"/></svg></div>',
    },
    {
      name: 'Last.fm', url: 'https://www.last.fm', color: '#aa0000',
      icon: '<div class="app-tile-brand" style="color:white;font-size:20px">last.fm</div>',
    },
    {
      name: 'Crackle', url: 'https://www.crackle.com', color: '#1a1a5a',
      icon: '<div class="app-tile-brand" style="color:#4466ff;font-size:18px">crackle</div>',
    },
  ];

  // ─── Recent Apps (localStorage-backed) ───────────────
  const RECENT_APPS_KEY = 'xbox360_recent_apps';
  const MAX_RECENT = 4;

  function getRecentApps() {
    try { return JSON.parse(localStorage.getItem(RECENT_APPS_KEY) || '[]'); }
    catch { return []; }
  }

  function addRecentApp(name, url) {
    let recent = getRecentApps();
    recent = recent.filter(a => a.name !== name);
    const info = APP_CATALOG.find(a => a.name === name) || { name, url, color: APP_COLORS[name] || '#1e1e1e' };
    recent.unshift({ name: info.name, url: info.url, color: info.color });
    recent = recent.slice(0, MAX_RECENT);
    try { localStorage.setItem(RECENT_APPS_KEY, JSON.stringify(recent)); } catch {}
    renderRecentApps();
  }

  function renderRecentApps() {
    const recent = getRecentApps();
    for (let i = 0; i < MAX_RECENT; i++) {
      const slot = document.getElementById(`recentApp${i}`);
      if (!slot) continue;
      if (i < recent.length) {
        const app = recent[i];
        const catalog = APP_CATALOG.find(a => a.name === app.name);
        slot.style.background = app.color || '#2e2e2e';
        slot.setAttribute('aria-label', app.name);
        slot.dataset.action = `openApp:${app.name}:${app.url}`;
        slot.innerHTML = `
          ${catalog ? catalog.icon : ''}
          <div class="app-tile-label">${app.name}</div>
        `;
        slot.classList.remove('app-recent-empty');
      } else {
        slot.style.background = '#1e1e1e';
        slot.setAttribute('aria-label', 'Empty');
        delete slot.dataset.action;
        slot.innerHTML = `
          <div class="app-tile-icon">
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5">
              <circle cx="16" cy="16" r="12" stroke-dasharray="3 3"/>
            </svg>
          </div>
          <div class="app-tile-label" style="color:rgba(255,255,255,0.18)">No recent app</div>
        `;
        slot.classList.add('app-recent-empty');
      }
    }
  }

  function setupRecentTileListeners() {
    for (let i = 0; i < MAX_RECENT; i++) {
      const slot = document.getElementById(`recentApp${i}`);
      if (!slot) continue;
      slot.addEventListener('click', () => {
        if (slot.dataset.action) handleAction(slot.dataset.action);
      });
      slot.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (slot.dataset.action) handleAction(slot.dataset.action);
        }
      });
    }
  }

  function openApp(name, url) {
    if (!appOverlay || !appWebview) return;
    addRecentApp(name, url);

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
      if (window.isMyAppsOpen) {
        maFocusFirst();
      } else {
        if (window.rebuildFocusables) window.rebuildFocusables();
      }
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

  if (appBackBtn)    appBackBtn.addEventListener('click',    () => { window.playBackSound && window.playBackSound(); closeApp(); });
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
      case 'myApps':
        openMyApps();
        break;
      case 'myGames':
        openMyGames();
        break;
      case 'appsMarketplace':
        openApp('Xbox Marketplace', 'https://marketplace.xbox.com');
        break;
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
        window.playBackSound && window.playBackSound();
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
    setTimeout(() => window.focusFirstFocusable && window.focusFirstFocusable(), 50);
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
      search: 'https://www.google.com/search?q=',
      images: 'https://www.google.com/images/search?q=',
      news:   'https://www.google.com/news/search?q=',
      videos: 'https://www.google.com/videos/search?q=',
    };
    const t = type || 'search';
    if (q) {
      openApp('Bing', (base[t] || base.search) + encodeURIComponent(q));
    } else {
      const fallback = { search: 'https://www.google.com', images: 'https://www.goolge.com/images', news: 'https://www.google.com/news', videos: 'https://www.google.com/videos' };
      openApp('Bing', fallback[t] || 'https://www.google.com');
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

  // ─── Content back hook (called by controller goBack) ──
  window.handleContentBack = function () {
    if (window.isMyGamesOpen) {
      closeMyGames();
      return true;
    }
    if (window.isMyAppsOpen) {
      closeMyApps();
      return true;
    }
    const detail = document.getElementById('settingsDetail');
    if (detail && !detail.hidden) {
      closeSettingsDetail();
      return true;
    }
    return false;
  };

  // ─── My Games Container ─────────────────────────
  const MG_TILE_W  = 140;
  const MG_GAP     = 16;
  const MG_STRIDE  = MG_TILE_W + MG_GAP;

  let mgGames      = [];
  let mgSelectedIdx = 0;
  const MG_SHOW_LABELS = ['All Games', 'Recently Played', 'Downloaded'];
  let mgShowIdx    = 0;

  const mgSndEnter  = new Audio('../../../sounds/enter.mp3');
  const mgSndSelect = new Audio('../../../sounds/inside_container_selection.mp3');
  const mgSndBetween = new Audio('../../../sounds/between_containers.mp3');
  mgSndEnter.volume = mgSndSelect.volume = mgSndBetween.volume = 0.8;

  function openMyGames() {
    const overlay = document.getElementById('myGamesOverlay');
    if (!overlay || window.isMyGamesOpen) return;
    window.isMyGamesOpen = true;
    overlay.hidden = false;
    mgSndEnter.currentTime = 0;
    mgSndEnter.play().catch(() => {});
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.classList.add('mygames-is-loading');
    }));
    setTimeout(() => {
      const content = document.getElementById('myGamesContent');
      const loading = document.getElementById('myGamesLoading');
      if (!content) return;
      mgGames = SAMPLE_GAMES.slice();
      mgSelectedIdx = 0;
      mgRenderCarousel();
      content.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        content.classList.add('mygames-content-visible');
        if (loading) { loading.style.pointerEvents = 'none'; loading.style.opacity = '0'; }
        // Now the tiles are laid out — getBCR returns real positions
        mgUpdateSelection(false);
      }));
    }, 1400);
  }

  function closeMyGames() {
    const overlay = document.getElementById('myGamesOverlay');
    const content = document.getElementById('myGamesContent');
    const loading = document.getElementById('myGamesLoading');
    if (!overlay || !window.isMyGamesOpen) return;
    if (content) content.classList.remove('mygames-content-visible');
    overlay.classList.remove('mygames-is-loading');
    setTimeout(() => {
      overlay.hidden = true;
      window.isMyGamesOpen = false;
      if (content) content.hidden = true;
      if (loading) { loading.style.pointerEvents = ''; loading.style.opacity = ''; }
      mgSelectedIdx = 0;
      const tile = document.querySelector('[data-action="myGames"]');
      if (tile) setTimeout(() => tile.focus(), 80);
      setTimeout(() => { if (window.rebuildFocusables) window.rebuildFocusables(); }, 120);
    }, 370);
  }
  window.closeMyGames = closeMyGames;

  function mgRenderCarousel() {
    const rail  = document.getElementById('myGamesRail');
    const count = document.getElementById('myGamesCount');
    if (!rail) return;
    rail.innerHTML = '';
    mgGames.forEach((game, i) => {
      const tile = document.createElement('div');
      tile.className = 'mygames-tile mygames-tile-entering';
      tile.tabIndex  = 0;
      tile.dataset.mgIdx = i;
      tile.style.animationDelay = `${i * 0.04}s`;
      const letter = game.title.slice(0, 2).toUpperCase();
      tile.innerHTML = `
        <div class="mygames-tile-cover" style="background:${game.color || '#2a2a2a'}">
          ${game.coverUrl
            ? `<img src="${game.coverUrl}" alt="${game.title}">`
            : `<div class="mygames-tile-cover-letter">${letter}</div>`}
        </div>
        <div class="mygames-tile-title">${game.title}</div>
      `;
      tile.addEventListener('animationend', () => tile.classList.remove('mygames-tile-entering'), { once: true });
      tile.addEventListener('click', () => {
        mgSetSelected(i);
        launchGame(game.id, game.title);
      });
      rail.appendChild(tile);
    });
    if (count) count.textContent = mgGames.length > 0 ? `1 of ${mgGames.length}` : '0 games';
    const infoEl = document.getElementById('myGamesSelectedTitle');
    if (infoEl && mgGames[0]) infoEl.textContent = mgGames[0].title;
    // mgUpdateSelection (centering) is called after content becomes visible (needs real getBCR)
  }

  function mgSetSelected(idx) {
    if (idx < 0 || idx >= mgGames.length) return;
    mgSelectedIdx = idx;
    mgSndSelect.currentTime = 0;
    mgSndSelect.play().catch(() => {});
    mgUpdateSelection(true);
  }

  function mgUpdateSelection(animate) {
    const rail   = document.getElementById('myGamesRail');
    const count  = document.getElementById('myGamesCount');
    const infoEl = document.getElementById('myGamesSelectedTitle');
    if (!rail) return;

    const tiles = Array.from(rail.querySelectorAll('.mygames-tile'));
    tiles.forEach((t, i) => t.classList.toggle('focused', i === mgSelectedIdx));

    const selectedTile = tiles[mgSelectedIdx];
    if (selectedTile) {
      // Read the tile's ACTUAL rendered centre, then compute the delta needed
      // to bring it to the horizontal midpoint of the viewport.
      const rect      = selectedTile.getBoundingClientRect();
      const tileMidX  = rect.left + rect.width / 2;
      const targetX   = window.innerWidth / 2;
      const delta     = targetX - tileMidX;

      // Add delta to whatever translateX is already applied on the rail.
      const raw       = window.getComputedStyle(rail).transform;
      const currentTX = (raw === 'none') ? 0 : new DOMMatrix(raw).m41;
      const newTX     = Math.round(currentTX + delta);

      if (!animate) {
        rail.style.transition = 'none';
        rail.style.transform  = `translateX(${newTX}px)`;
        void rail.offsetWidth;
        rail.style.transition = '';
      } else {
        rail.style.transform = `translateX(${newTX}px)`;
      }
    }

    if (count && mgGames.length > 0) {
      count.textContent = `${mgSelectedIdx + 1} of ${mgGames.length}`;
    }
    if (infoEl && mgGames[mgSelectedIdx]) {
      infoEl.textContent = mgGames[mgSelectedIdx].title;
    }
  }

  window.myGamesMove = function (dir) {
    if (dir === 'left') {
      if (mgSelectedIdx > 0) mgSetSelected(mgSelectedIdx - 1);
    } else if (dir === 'right') {
      if (mgSelectedIdx < mgGames.length - 1) mgSetSelected(mgSelectedIdx + 1);
    }
    // up/down: no action in the flat carousel
  };

  window.myGamesPageLeft  = function () {
    mgSetSelected(Math.max(0, mgSelectedIdx - 5));
    mgSndBetween.currentTime = 0;
    mgSndBetween.play().catch(() => {});
  };
  window.myGamesPageRight = function () {
    mgSetSelected(Math.min(mgGames.length - 1, mgSelectedIdx + 5));
    mgSndBetween.currentTime = 0;
    mgSndBetween.play().catch(() => {});
  };
  window.myGamesShowFilter = function () {
    mgShowIdx = (mgShowIdx + 1) % MG_SHOW_LABELS.length;
    const btn = document.getElementById('myGamesShowBtn');
    if (btn) btn.textContent = MG_SHOW_LABELS[mgShowIdx];
    showToast(MG_SHOW_LABELS[mgShowIdx]);
  };

  const mgShowBtn = document.getElementById('myGamesShowBtn');
  if (mgShowBtn) mgShowBtn.addEventListener('click', () => window.myGamesShowFilter());


  // ─── My Apps Container ──────────────────────────
  const MA_TABS = ['video-music', 'social', 'coming-soon-1'];
  let maActiveTab = 'video-music';
  let maTransitioning = false;
  let maZone = 'content'; // 'nav' | 'content'
  const MA_TRANSITION_MS = 250;

  const maSndEnter   = new Audio('../../../sounds/enter.mp3');
  const maSndBetween = new Audio('../../../sounds/between_containers.mp3');
  const maSndSelect  = new Audio('../../../sounds/inside_container_selection.mp3');
  maSndEnter.volume = maSndBetween.volume = maSndSelect.volume = 0.8;

  function openMyApps() {
    const overlay = document.getElementById('myAppsOverlay');
    if (!overlay || window.isMyAppsOpen) return;
    window.isMyAppsOpen = true;
    overlay.hidden = false;
    maSndEnter.currentTime = 0;
    maSndEnter.play().catch(() => {});
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.classList.add('myapps-is-loading');
    }));
    setTimeout(() => {
      const content = document.getElementById('myAppsContent');
      const loading = document.getElementById('myAppsLoading');
      if (!content) return;
      // Restart tile entrance animations
      content.querySelectorAll('.myapps-hero, .myapps-small').forEach(t => {
        t.style.animation = 'none';
        void t.offsetHeight;
        t.style.animation = '';
      });
      content.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        content.classList.add('myapps-content-visible');
        if (loading) { loading.style.pointerEvents = 'none'; loading.style.opacity = '0'; }
      }));
      setTimeout(maFocusFirst, 380);
    }, 1400);
  }

  function maEnterNav() {
    maZone = 'nav';
    document.querySelectorAll('#myAppsOverlay .focusable').forEach(el => el.classList.remove('focused'));
    document.querySelectorAll('.myapps-nav-item').forEach(t =>
      t.classList.toggle('myapps-nav-focused', t.dataset.myappsTab === maActiveTab)
    );
    maSndBetween.currentTime = 0;
    maSndBetween.play().catch(() => {});
  }

  function maExitNav() {
    maZone = 'content';
    document.querySelectorAll('.myapps-nav-item').forEach(t => t.classList.remove('myapps-nav-focused'));
    setTimeout(maFocusFirst, 50);
    maSndSelect.currentTime = 0;
    maSndSelect.play().catch(() => {});
  }

  function closeMyApps() {
    const overlay = document.getElementById('myAppsOverlay');
    const content = document.getElementById('myAppsContent');
    const loading = document.getElementById('myAppsLoading');
    if (!overlay || !window.isMyAppsOpen) return;
    if (content) content.classList.remove('myapps-content-visible');
    overlay.classList.remove('myapps-is-loading');
    setTimeout(() => {
      overlay.hidden = true;
      window.isMyAppsOpen = false;
      if (content) content.hidden = true;
      if (loading) { loading.style.pointerEvents = ''; loading.style.opacity = ''; }
      // Reset to first tab
      maActiveTab = 'video-music';
      maZone = 'content';
      document.querySelectorAll('.myapps-nav-item').forEach(t =>
        t.classList.remove('myapps-nav-focused')
      );
      document.querySelectorAll('.myapps-panel').forEach(p =>
        p.classList.remove('active', 'myapps-enter-right', 'myapps-enter-left', 'myapps-exit-left', 'myapps-exit-right')
      );
      const firstPanel = document.getElementById('myapps-panel-video-music');
      if (firstPanel) firstPanel.classList.add('active');
      document.querySelectorAll('.myapps-nav-item').forEach(t =>
        t.classList.toggle('active', t.dataset.myappsTab === 'video-music')
      );
      const tile = document.querySelector('[data-action="myApps"]');
      if (tile) setTimeout(() => tile.focus(), 80);
      setTimeout(() => { if (window.rebuildFocusables) window.rebuildFocusables(); }, 120);
    }, 370);
  }
  window.closeMyApps = closeMyApps;

  function maSwitchTab(tabId) {
    if (maTransitioning || tabId === maActiveTab) return;
    const oldIdx = MA_TABS.indexOf(maActiveTab);
    const newIdx = MA_TABS.indexOf(tabId);
    if (newIdx === -1) return;
    const goRight = newIdx > oldIdx;
    const oldPanel = document.getElementById(`myapps-panel-${maActiveTab}`);
    const newPanel = document.getElementById(`myapps-panel-${tabId}`);
    if (!oldPanel || !newPanel) return;
    maTransitioning = true;
    maActiveTab = tabId;
    document.querySelectorAll('.myapps-nav-item').forEach(t =>
      t.classList.toggle('active', t.dataset.myappsTab === tabId)
    );
    maSndBetween.currentTime = 0;
    maSndBetween.play().catch(() => {});
    oldPanel.classList.remove('active');
    oldPanel.classList.add(goRight ? 'myapps-exit-left' : 'myapps-exit-right');
    newPanel.classList.add(goRight ? 'myapps-enter-right' : 'myapps-enter-left');
    setTimeout(() => {
      oldPanel.classList.remove('myapps-exit-left', 'myapps-exit-right');
      newPanel.classList.remove('myapps-enter-right', 'myapps-enter-left');
      newPanel.classList.add('active');
      maTransitioning = false;
      maFocusFirst();
    }, MA_TRANSITION_MS);
  }

  function maTabLeft()  { const i = MA_TABS.indexOf(maActiveTab); if (i > 0) maSwitchTab(MA_TABS[i - 1]); }
  function maTabRight() { const i = MA_TABS.indexOf(maActiveTab); if (i < MA_TABS.length - 1) maSwitchTab(MA_TABS[i + 1]); }

  function maFocusFirst() {
    const panel = document.getElementById(`myapps-panel-${maActiveTab}`);
    if (!panel) return;
    const els = Array.from(panel.querySelectorAll('.focusable')).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    document.querySelectorAll('#myAppsOverlay .focusable').forEach(el => el.classList.remove('focused'));
    if (els.length > 0) {
      els[0].classList.add('focused');
      els[0].focus({ preventScroll: true });
    } else {
      // No focusable content in this panel — auto-enter My Apps nav bar
      maEnterNav();
    }
  }

  window.myAppsMove = function(dir) {
    // ── Nav zone ──
    if (maZone === 'nav') {
      if (dir === 'down') {
        maExitNav();
      } else if (dir === 'left') {
        const i = MA_TABS.indexOf(maActiveTab);
        if (i > 0) {
          maSwitchTab(MA_TABS[i - 1]);
          document.querySelectorAll('.myapps-nav-item').forEach(t =>
            t.classList.toggle('myapps-nav-focused', t.dataset.myappsTab === MA_TABS[i - 1])
          );
        }
      } else if (dir === 'right') {
        const i = MA_TABS.indexOf(maActiveTab);
        if (i < MA_TABS.length - 1) {
          maSwitchTab(MA_TABS[i + 1]);
          document.querySelectorAll('.myapps-nav-item').forEach(t =>
            t.classList.toggle('myapps-nav-focused', t.dataset.myappsTab === MA_TABS[i + 1])
          );
        }
      }
      return;
    }

    // ── Content zone ──
    const panel = document.getElementById(`myapps-panel-${maActiveTab}`);
    if (!panel) return;
    const els = Array.from(panel.querySelectorAll('.focusable')).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    const focused = panel.querySelector('.focusable.focused') || els[0];
    if (!focused || els.length === 0) return;
    const fi = els.indexOf(focused);
    const cr = focused.getBoundingClientRect();
    const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
    let bestIdx = -1, bestScore = Infinity;
    els.forEach((el, i) => {
      if (i === fi) return;
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width / 2, ey = r.top + r.height / 2;
      const dx = ex - cx, dy = ey - cy;
      let inDir = false;
      if (dir === 'up')    inDir = dy < -10;
      if (dir === 'down')  inDir = dy > 10;
      if (dir === 'left')  inDir = dx < -10;
      if (dir === 'right') inDir = dx > 10;
      if (!inDir) return;
      const primary = (dir === 'up' || dir === 'down') ? Math.abs(dy) : Math.abs(dx);
      const sec     = (dir === 'up' || dir === 'down') ? Math.abs(dx) : Math.abs(dy);
      const score   = primary + sec * 2.5;
      if (score < bestScore) { bestScore = score; bestIdx = i; }
    });
    if (bestIdx >= 0) {
      els.forEach(el => el.classList.remove('focused'));
      els[bestIdx].classList.add('focused');
      els[bestIdx].focus({ preventScroll: true });
      maSndSelect.currentTime = 0;
      maSndSelect.play().catch(() => {});
    } else if (dir === 'left') {
      maTabLeft();
    } else if (dir === 'right') {
      maTabRight();
    } else if (dir === 'up') {
      maEnterNav();
    }
  };
  window.myAppsTabLeft  = maTabLeft;
  window.myAppsTabRight = maTabRight;
  window.myAppsActiveTab = () => maActiveTab;

  document.querySelectorAll('.myapps-nav-item').forEach(item => {
    item.addEventListener('click', () => maSwitchTab(item.dataset.myappsTab));
  });

  // ─── Init ──────────────────────────────────────
  loadGames();
  renderRecentApps();
  setupRecentTileListeners();
  console.log('%c Xbox 360 Dashboard ready ', 'background:#52b043;color:#fff;padding:4px 8px;border-radius:3px;');

})();
