import { useEffect, useRef, useCallback } from 'react'
import type { ControllerButton } from '../types'

const BUTTON_MAP: Record<number, ControllerButton> = {
  0: 'A', 1: 'B',
  4: 'LB', 5: 'RB',
  12: 'UP', 13: 'DOWN', 14: 'LEFT', 15: 'RIGHT',
}

const KEY_MAP: Record<string, ControllerButton> = {
  ArrowUp: 'UP', ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
  Enter: 'A', Escape: 'B',
  KeyQ: 'LB', KeyE: 'RB',
}

export function useController(onButton: (b: ControllerButton) => void) {
  const prev    = useRef<Record<number, boolean>>({})
  const handler = useCallback(onButton, [onButton])

  // Gamepad polling
  useEffect(() => {
    const id = setInterval(() => {
      for (const gp of navigator.getGamepads()) {
        if (!gp) continue
        gp.buttons.forEach((btn, idx) => {
          const was = prev.current[idx] ?? false
          if (btn.pressed && !was) {
            const mapped = BUTTON_MAP[idx]
            if (mapped) handler(mapped)
          }
          prev.current[idx] = btn.pressed
        })
        // Left stick
        const [lx, ly] = [gp.axes[0], gp.axes[1]]
        const dz = 0.5
        if (ly < -dz) handler('UP')
        if (ly >  dz) handler('DOWN')
        if (lx < -dz) handler('LEFT')
        if (lx >  dz) handler('RIGHT')
      }
    }, 80)
    return () => clearInterval(id)
  }, [handler])

  // Keyboard fallback
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const btn = KEY_MAP[e.code]
      if (btn) { e.preventDefault(); handler(btn) }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [handler])
}
