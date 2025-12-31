import { useEffect, useReducer, useState } from 'react'
import Shell from './components/Shell'
import Setup from './components/Setup'
import Game from './components/Game'
import { reducer } from './lib/engine/reducer'
import type { Action, GameState } from './lib/engine/types'
import { clear, load, save } from './lib/storage'

export default function App() {
  const [hasSaved, setHasSaved] = useState<boolean>(() =>
    Boolean(load()?.state)
  )

  const [state, dispatchBase] = useReducer(
    reducer,
    null,
    () => load()?.state ?? null
  )

  const dispatch = (a: Action) => {
    dispatchBase(a)
  }

  useEffect(() => {
    if (state === null) return
    save({ schema: 1, state })
  }, [state])

  return (
    <Shell>
      {state === null ? (
        <Setup
          hasSaved={hasSaved}
          onResume={() => {
            const s = load()
            if (s?.state) {
              dispatch({ type: 'RESUME', state: s.state })
              setHasSaved(true)
            }
          }}
          onClearSaved={() => {
            clear()
            setHasSaved(false)
            dispatch({ type: 'RESET_TO_SETUP' })
          }}
          onNew={(config, players) => {
            dispatch({ type: 'NEW_GAME', config, players })
            setHasSaved(true)
          }}
        />
      ) : (
        <Game state={state as GameState} dispatch={dispatch} />
      )}
    </Shell>
  )
}
