import React from 'react'
import type { Tile as TileType } from '../types'
import s from './Tile.module.css'

interface Props {
  tile:    TileType
  focused: boolean
  onClick: () => void
}

export default function Tile({ tile, focused, onClick }: Props) {
  return (
    <div
      className={`${s.tile} ${s[tile.size]} ${focused ? s.focused : ''}`}
      style={{ background: tile.color }}
      onClick={onClick}
    >
      {/* Subtle inner highlight — matches the slightly lighter top edge on real tiles */}
      <div className={s.highlight} />

      <div className={s.text}>
        <span className={s.label}>{tile.label}</span>
        {tile.sublabel && <span className={s.sublabel}>{tile.sublabel}</span>}
      </div>
    </div>
  )
}
