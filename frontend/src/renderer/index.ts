import { create } from 'zustand'
import type { SectionId, Tile } from '../types'

// ── Section tile data ─────────────────────────────────────────────────────────
// Mirrors the real Xbox 360 Metro dashboard layout.
// Each section has its own tile arrangement.

export const SECTION_TILES: Record<SectionId, Tile[]> = {
  bing: [
    { id: 'bing-search', label: 'Bing',   sublabel: 'Search with Bing', size: 'hero',   color: '#008373' },
  ],

  home: [
    { id: 'close-tray',  label: 'Close Tray',  sublabel: 'No disc inserted', size: 'medium', color: '#52b043' },
    { id: 'hero-live',   label: 'Xbox LIVE',   sublabel: 'The new face of Xbox LIVE', size: 'hero', color: '#1d4d1a' },
    { id: 'quickplay',   label: 'Quickplay',   sublabel: 'Jump back in',      size: 'medium', color: '#3d8c36' },
    { id: 'xbox-store',  label: 'Xbox Store',  sublabel: 'New this week',     size: 'large',  color: '#2a7025' },
    { id: 'advertisement', label: 'Reinvent family night.', sublabel: 'Click to see how', size: 'large', color: '#1e5c1a' },
  ],

  social: [
    { id: 'friends',      label: 'Friends',      sublabel: '3 online',        size: 'large',  color: '#52b043' },
    { id: 'messages',     label: 'Messages',     sublabel: '2 unread',        size: 'medium', color: '#3d8c36' },
    { id: 'recent',       label: 'Recent',       sublabel: 'Players met',     size: 'medium', color: '#2a7025' },
    { id: 'beacons',      label: 'Beacons',      sublabel: 'Let friends know',size: 'medium', color: '#1e5c1a' },
    { id: 'sign-in',      label: 'Sign In',      size: 'small',              color: '#52b043' },
  ],

  video: [
    { id: 'netflix',      label: 'Netflix',      sublabel: 'Watch instantly', size: 'large',  color: '#8b0000' },
    { id: 'youtube',      label: 'YouTube',      sublabel: 'Watch videos',    size: 'large',  color: '#cc0000' },
    { id: 'zune-video',   label: 'Zune Video',   sublabel: 'Movies & TV',     size: 'medium', color: '#e07020' },
    { id: 'espn',         label: 'ESPN',         sublabel: 'Live sports',     size: 'medium', color: '#cc3300' },
  ],

  games: [
    { id: 'my-games',     label: 'My Games',     sublabel: 'Your library',    size: 'hero',   color: '#1d4d1a' },
    { id: 'marketplace',  label: 'Marketplace',  sublabel: 'Buy & download',  size: 'large',  color: '#2a7025' },
    { id: 'achievements', label: 'Achievements', sublabel: '4,200 G',         size: 'medium', color: '#3d8c36' },
    { id: 'game-demos',   label: 'Game Demos',   sublabel: 'Free to try',     size: 'medium', color: '#52b043' },
  ],

  music: [
    { id: 'spotify',      label: 'Spotify',      sublabel: 'Music for everyone', size: 'large', color: '#1a7a1a' },
    { id: 'zune-music',   label: 'Zune Music',   sublabel: 'Your collection', size: 'large',  color: '#3d8c36' },
    { id: 'last-fm',      label: 'Last.fm',      sublabel: 'Scrobble tracks', size: 'medium', color: '#cc0000' },
    { id: 'radio',        label: 'Radio',        sublabel: 'Live stations',   size: 'medium', color: '#2a7025' },
  ],

  apps: [
    { id: 'internet-explorer', label: 'Internet Explorer', sublabel: 'Browse the web', size: 'large',  color: '#1565c0' },
    { id: 'espn-app',    label: 'ESPN',          sublabel: 'Sports scores',   size: 'medium', color: '#cc3300' },
    { id: 'twitter',     label: 'Twitter',       sublabel: 'Whats happening', size: 'medium', color: '#1da1f2' },
    { id: 'facebook',    label: 'Facebook',      sublabel: 'Connect',         size: 'medium', color: '#1877f2' },
    { id: 'more-apps',   label: 'More in Xbox Live', sublabel: 'Browse all', size: 'large',  color: '#2a7025' },
  ],

  settings: [
    { id: 'system',      label: 'System',        sublabel: 'Console settings',size: 'large',  color: '#2a2a2a' },
    { id: 'account',     label: 'Account',       sublabel: 'Profile & billing',size: 'large', color: '#1e1e1e' },
    { id: 'kinect',      label: 'Kinect',        sublabel: 'Sensor settings', size: 'medium', color: '#333333' },
    { id: 'family',      label: 'Family',        sublabel: 'Parental controls',size: 'medium',color: '#2a2a2a' },
  ],
}

const SECTIONS: SectionId[] = [
  'bing', 'home', 'social', 'video', 'games', 'music', 'apps', 'settings',
]

// ── Store ─────────────────────────────────────────────────────────────────────

interface Store {
  activeSection:    SectionId
  focusedIndex:     number
  setSection:       (s: SectionId) => void
  setFocusedIndex:  (i: number) => void
  nextSection:      () => void
  prevSection:      () => void
  moveFocus:        (dir: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => void
}

export const useStore = create<Store>((set, get) => ({
  activeSection:   'home',
  focusedIndex:    0,

  setSection: (s) => set({ activeSection: s, focusedIndex: 0 }),

  setFocusedIndex: (i) => set({ focusedIndex: i }),

  nextSection: () => {
    const idx  = SECTIONS.indexOf(get().activeSection)
    const next = SECTIONS[(idx + 1) % SECTIONS.length]
    set({ activeSection: next, focusedIndex: 0 })
  },

  prevSection: () => {
    const idx  = SECTIONS.indexOf(get().activeSection)
    const prev = SECTIONS[(idx - 1 + SECTIONS.length) % SECTIONS.length]
    set({ activeSection: prev, focusedIndex: 0 })
  },

  moveFocus: (dir) => {
    const { focusedIndex, activeSection } = get()
    const tiles = SECTION_TILES[activeSection]

    // Simple single-row left/right — extend to grid when layout is multi-row
    if (dir === 'LEFT')  set({ focusedIndex: Math.max(0, focusedIndex - 1) })
    if (dir === 'RIGHT') set({ focusedIndex: Math.min(tiles.length - 1, focusedIndex + 1) })
  },
}))
