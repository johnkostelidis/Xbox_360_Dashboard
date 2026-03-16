import React from 'react'
import Tile from './Tile'
import type { Tile as TileType, SectionId } from '../types'
import s from './TileGrid.module.css'

// Right-edge peek tiles — only shown on home section
const HOME_PEEK = [
  { label: 'Friends', color: '#52b043' },
  { label: 'Social',  color: '#3d8c36' },
  { label: 'Sign In', color: '#2a7025' },
]

interface Props {
  tiles:        TileType[]
  focusedIndex: number
  section:      SectionId
  onFocus:      (i: number) => void
}

export default function TileGrid({ tiles, focusedIndex, section, onFocus }: Props) {
  const showPeek = section === 'home'
  const showDots = tiles.some((t) => t.size === 'hero')

  return (
    <div className={s.outer}>

      {/* Search icon — bottom-left, matching the screenshot position */}
      <div className={s.search} aria-label="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="15.5" y1="15.5" x2="21" y2="21" />
        </svg>
      </div>

      {/* Tile cluster */}
      <div className={s.grid}>
        {tiles.map((tile, i) => (
          <Tile
            key={tile.id}
            tile={tile}
            focused={focusedIndex === i}
            onClick={() => onFocus(i)}
          />
        ))}
      </div>

      {/* Right-edge peek strip */}
      {showPeek && (
        <div className={s.peek}>
          {HOME_PEEK.map((p, i) => (
            <div key={i} className={s.peekTile} style={{ background: p.color }}>
              <span>{p.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination dots below the hero tile */}
      {showDots && (
        <div className={s.dots}>
          {[0,1,2,3,4].map((i) => (
            <span key={i} className={`${s.dot} ${i === 0 ? s.dotOn : ''}`} />
          ))}
        </div>
      )}
    </div>
  )
}
