import React, { useCallback } from 'react'
import { useStore, SECTION_TILES } from './store'
import { useController } from './hooks/useController'
import type { ControllerButton, SectionId } from './types'
import TopNav    from './components/TopNav'
import StatusBar from './components/StatusBar'
import TileGrid  from './components/TileGrid'
import HintBar   from './components/HintBar'
import s         from './App.module.css'

export default function App() {
  const {
    activeSection, focusedIndex,
    setSection, setFocusedIndex,
    nextSection, prevSection, moveFocus,
  } = useStore()

  const tiles = SECTION_TILES[activeSection] ?? []

  const handleButton = useCallback((btn: ControllerButton) => {
    if (btn === 'LB')    prevSection()
    else if (btn === 'RB')    nextSection()
    else if (btn === 'LEFT')  moveFocus('LEFT')
    else if (btn === 'RIGHT') moveFocus('RIGHT')
    else if (btn === 'UP')    moveFocus('UP')
    else if (btn === 'DOWN')  moveFocus('DOWN')
    else if (btn === 'B' && activeSection !== 'home') setSection('home')
  }, [activeSection, prevSection, nextSection, moveFocus, setSection])

  useController(handleButton)

  return (
    <div className={s.shell}>

      <header className={s.header}>
        <div className={s.nav}>
          <TopNav
            active={activeSection}
            onChange={(id: SectionId) => setSection(id)}
          />
        </div>
        <div className={s.status}>
          <StatusBar
            friendsOnline={0}
            messages={0}
            gamerscore={285}
            gamertag="YourTag"
          />
        </div>
      </header>

      <main className={s.main}>
        <TileGrid
          tiles={tiles}
          focusedIndex={focusedIndex}
          section={activeSection}
          onFocus={setFocusedIndex}
        />
      </main>

      <footer className={s.footer}>
        <HintBar />
      </footer>

    </div>
  )
}
