import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import './App.css'
import {
  ARTWORK_CATEGORIES,
  createArtwork,
  type ArtworkCategory,
  type TimeOfDay,
  type Weather,
} from './game/artwork'
import {
  createDailySeed,
  createDifferentShuffledTiles,
  createSeededRandom,
  createShuffledTiles,
  isSolved,
  swapTiles,
  type GridSize,
} from './game/puzzle'
import {
  loadSavedGame,
  SAVE_KEY,
  saveGame,
  TIME_LIMIT_SECONDS,
  type PlayMode,
  type SavedGame,
} from './game/save'
import { playSound, startAmbient, stopAmbient } from './game/sound'

const BEST_MOVES_PREFIX = 'cozypuz-best-moves-'
const SETTINGS_KEY = 'cozypuz-settings-v1'
const ACHIEVEMENT_PREFIX = 'cozypuz-achievement-'
const ACHIEVEMENTS = ['first-picture', 'four-by-four', 'daily-picture']
const restoredGame = loadSavedGame()

type Settings = {
  soundEnabled: boolean
  ambientEnabled: boolean
  highContrast: boolean
  largeText: boolean
  darkMode: boolean
  showTimer: boolean
  weather: Weather
  timeOfDay: TimeOfDay
  colorTheme: 'terracotta' | 'sage' | 'lavender' | 'blue' | 'japanese'
}

const defaultSettings: Settings = {
  soundEnabled: true,
  ambientEnabled: false,
  highContrast: false,
  largeText: false,
  darkMode: false,
  showTimer: true,
  weather: 'auto',
  timeOfDay: 'auto',
  colorTheme: 'terracotta',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readStorage(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Storage may be unavailable in private browsing or restricted webviews.
  }
}

function loadSettings(): Settings {
  const raw = readStorage(SETTINGS_KEY)
  if (!raw) return defaultSettings

  try {
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value)) return defaultSettings
    return {
      soundEnabled: value.soundEnabled !== false,
      ambientEnabled: value.ambientEnabled === true,
      highContrast: value.highContrast === true,
      largeText: value.largeText === true,
      darkMode: value.darkMode === true,
      showTimer: value.showTimer !== false,
      weather: value.weather === 'sunny' || value.weather === 'rainy' || value.weather === 'misty' ? value.weather : 'auto',
      timeOfDay: value.timeOfDay === 'morning' || value.timeOfDay === 'afternoon' || value.timeOfDay === 'evening' ? value.timeOfDay : 'auto',
      colorTheme: value.colorTheme === 'sage' || value.colorTheme === 'lavender' || value.colorTheme === 'blue' || value.colorTheme === 'japanese' ? value.colorTheme : 'terracotta',
    }
  } catch (error) {
    if (error instanceof SyntaxError) return defaultSettings
    throw error
  }
}

function getBestMoves(size: GridSize, mode: PlayMode, category: ArtworkCategory) {
  const storedValue = readStorage(`${BEST_MOVES_PREFIX}${mode}-${category}-${size}`)
  const parsedValue = storedValue ? Number(storedValue) : NaN
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

function createArtworkSeed() {
  const values = new Uint32Array(1)
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(values)
  } else {
    values[0] = Math.floor(Math.random() * 2 ** 32)
  }
  return values[0]
}

function unlockAchievement(id: string) {
  writeStorage(`${ACHIEVEMENT_PREFIX}${id}`, 'true')
}

function getUnlockedAchievementCount() {
  return ACHIEVEMENTS.filter((id) => readStorage(`${ACHIEVEMENT_PREFIX}${id}`) === 'true').length
}

function App() {
  const [gridSize, setGridSize] = useState<GridSize>(() => restoredGame?.gridSize ?? 3)
  const [tiles, setTiles] = useState(() => restoredGame?.tiles ?? createShuffledTiles(3))
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [moves, setMoves] = useState(() => restoredGame?.moves ?? 0)
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(() => restoredGame?.elapsedSeconds ?? 0)
  const [pastBoards, setPastBoards] = useState<number[][]>(() => restoredGame?.pastBoards ?? [])
  const [futureBoards, setFutureBoards] = useState<number[][]>(() => restoredGame?.futureBoards ?? [])
  const [showPreview, setShowPreview] = useState(false)
  const [hintIndices, setHintIndices] = useState<number[]>([])
  const [artworkSeed, setArtworkSeed] = useState(() => restoredGame?.artworkSeed ?? createArtworkSeed())
  const [category, setCategory] = useState<ArtworkCategory>(() => restoredGame?.category ?? 'cozy')
  const [mode, setMode] = useState<PlayMode>(() => restoredGame?.mode ?? 'relaxed')
  const [bestMoves, setBestMoves] = useState<number | null>(() => getBestMoves(
    restoredGame?.gridSize ?? 3,
    restoredGame?.mode ?? 'relaxed',
    restoredGame?.category ?? 'cozy',
  ))
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([])
  const solved = isSolved(tiles)
  const timeExpired = mode === 'timed' && elapsedSeconds >= TIME_LIMIT_SECONDS
  const artwork = useMemo(
    () => createArtwork(artworkSeed, category, { weather: settings.weather, timeOfDay: settings.timeOfDay }),
    [artworkSeed, category, settings.timeOfDay, settings.weather],
  )
  const unlockedAchievementCount = getUnlockedAchievementCount()
  const displayedSeconds = mode === 'timed'
    ? Math.max(0, TIME_LIMIT_SECONDS - elapsedSeconds)
    : elapsedSeconds
  const modeLabel = mode === 'timed' ? 'Five quiet minutes' : mode === 'daily' ? 'Today’s picture' : 'Take your time'

  useEffect(() => {
    if (!isRunning || solved || timeExpired) return

    const timer = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isRunning, solved, timeExpired])

  useEffect(() => {
    const game: SavedGame = {
      gridSize,
      tiles,
      moves,
      elapsedSeconds,
      category,
      mode,
      artworkSeed,
      pastBoards,
      futureBoards,
    }
    saveGame(game)
  }, [artworkSeed, category, elapsedSeconds, futureBoards, gridSize, mode, moves, pastBoards, tiles])

  useEffect(() => {
    writeStorage(SETTINGS_KEY, JSON.stringify(settings))
    document.documentElement.dataset.theme = settings.darkMode ? 'dark' : 'light'
    document.documentElement.dataset.textSize = settings.largeText ? 'large' : 'normal'
    document.documentElement.dataset.accent = settings.colorTheme
  }, [settings])

  useEffect(() => {
    if (!settings.ambientEnabled) stopAmbient()
    return () => stopAmbient()
  }, [settings.ambientEnabled])

  function startNewPuzzle(
    size: GridSize = gridSize,
    nextCategory: ArtworkCategory = category,
    nextMode: PlayMode = mode,
  ) {
    const nextArtworkSeed = nextMode === 'daily' ? createDailySeed() : artworkSeed + 1
    const random = nextMode === 'daily' ? createSeededRandom(nextArtworkSeed + size) : Math.random
    const nextTiles = nextMode === 'daily'
      ? createShuffledTiles(size, random)
      : size === gridSize
        ? createDifferentShuffledTiles(size, tiles, random)
        : createShuffledTiles(size, random)

    setGridSize(size)
    setTiles(nextTiles)
    setSelectedIndex(null)
    setMoves(0)
    setIsRunning(false)
    setElapsedSeconds(0)
    setPastBoards([])
    setFutureBoards([])
    setHintIndices([])
    setShowPreview(false)
    setCategory(nextCategory)
    setMode(nextMode)
    setArtworkSeed(nextArtworkSeed)
    setBestMoves(getBestMoves(size, nextMode, nextCategory))
    window.requestAnimationFrame(() => tileRefs.current[0]?.focus())
  }

  function handleTileClick(index: number) {
    if (solved || timeExpired) return
    if (!isRunning) setIsRunning(true)

    if (selectedIndex === null) {
      setSelectedIndex(index)
      setHintIndices([])
      if (settings.soundEnabled) playSound('select')
      if (settings.ambientEnabled) startAmbient()
      return
    }

    if (selectedIndex === index) {
      setSelectedIndex(null)
      return
    }

    const nextTiles = swapTiles(tiles, selectedIndex, index)
    const nextMoves = moves + 1
    setPastBoards((boards) => [...boards, tiles])
    setFutureBoards([])
    setTiles(nextTiles)
    setSelectedIndex(null)
    setHintIndices([])
    setMoves(nextMoves)
    if (settings.soundEnabled) playSound('swap')

    if (isSolved(nextTiles)) {
      unlockAchievement('first-picture')
      if (gridSize === 4) unlockAchievement('four-by-four')
      if (mode === 'daily') unlockAchievement('daily-picture')
      if (settings.soundEnabled) playSound('complete')

      if (bestMoves === null || nextMoves < bestMoves) {
        setBestMoves(nextMoves)
        writeStorage(`${BEST_MOVES_PREFIX}${mode}-${category}-${gridSize}`, String(nextMoves))
      }
    }
  }

  function undoMove() {
    const previousBoard = pastBoards[pastBoards.length - 1]
    if (!previousBoard || solved || timeExpired) return

    setTiles(previousBoard)
    setPastBoards((boards) => boards.slice(0, -1))
    setFutureBoards((boards) => [tiles, ...boards])
    setSelectedIndex(null)
    setHintIndices([])
    setMoves((currentMoves) => Math.max(0, currentMoves - 1))
    if (settings.soundEnabled) playSound('swap')
    window.requestAnimationFrame(() => tileRefs.current[0]?.focus())
  }

  function redoMove() {
    const nextBoard = futureBoards[0]
    if (!nextBoard || solved || timeExpired) return

    setTiles(nextBoard)
    setPastBoards((boards) => [...boards, tiles])
    setFutureBoards((boards) => boards.slice(1))
    setSelectedIndex(null)
    setHintIndices([])
    setMoves((currentMoves) => currentMoves + 1)
    if (settings.soundEnabled) playSound('swap')
    window.requestAnimationFrame(() => tileRefs.current[0]?.focus())
  }

  function showHint() {
    if (solved || timeExpired) return
    const firstWrongIndex = tiles.findIndex((tileId, index) => tileId !== index)
    if (firstWrongIndex < 0) return

    setHintIndices([firstWrongIndex, tiles[firstWrongIndex]])
    if (settings.soundEnabled) playSound('hint')
  }

  function updateSetting<Key extends keyof Settings>(key: Key, value: Settings[Key]) {
    setSettings((currentSettings) => ({ ...currentSettings, [key]: value }))
  }

  function exportSave() {
    const savedData = readStorage(SAVE_KEY)
    if (!savedData) return

    const blob = new Blob([savedData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cozy-puz-save.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  function moveFocus(index: number, direction: number) {
    const row = Math.floor(index / gridSize)
    const column = index % gridSize
    let nextRow = row
    let nextColumn = column

    if (direction === -gridSize) nextRow = Math.max(0, row - 1)
    if (direction === gridSize) nextRow = Math.min(gridSize - 1, row + 1)
    if (direction === -1) nextColumn = Math.max(0, column - 1)
    if (direction === 1) nextColumn = Math.min(gridSize - 1, column + 1)

    tileRefs.current[nextRow * gridSize + nextColumn]?.focus()
  }

  function handleTileKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const directions: Record<string, number> = {
      ArrowUp: -gridSize,
      ArrowDown: gridSize,
      ArrowLeft: -1,
      ArrowRight: 1,
    }
    const direction = directions[event.key]

    if (event.key === 'Escape') {
      setSelectedIndex(null)
      setHintIndices([])
      return
    }

    if (direction) {
      event.preventDefault()
      moveFocus(index, direction)
    }
  }

  return (
    <main className={`app-shell ${settings.highContrast ? 'is-high-contrast' : ''}`}>
      <header className="topbar">
        <a className="brand" href={import.meta.env.BASE_URL} aria-label="Cozy Puz home">
          <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
          <span>Cozy Puz</span>
        </a>
        <div className="topbar-actions">
          <button className="daily-button" type="button" onClick={() => startNewPuzzle(gridSize, category, 'daily')}>
            <span aria-hidden="true">✦</span>
            Daily picture
          </button>
          <button className="new-puzzle-button" type="button" onClick={() => startNewPuzzle()}>
            <span aria-hidden="true">↻</span>
            New layout
          </button>
        </div>
      </header>

      <div className="game-layout">
        <section className="intro" aria-labelledby="game-title">
          <p className="eyebrow">A quiet little puzzle</p>
          <h1 id="game-title">Put the picture<br /><em>back together.</em></h1>
          <p className="intro-copy">A few soft moments of focus, made for your favorite corner of the day.</p>
          <div className="intro-rule" aria-hidden="true"><span /><span /><span /></div>
          <p className="season-note"><span className="sun-icon" aria-hidden="true">☼</span> {artwork.note} · {String(artwork.edition).padStart(2, '0')}</p>
        </section>

        <section className="game-stage" aria-label="Cozy picture puzzle">
          <div className="stage-topline">
            <div>
              <p className="stage-kicker">{artwork.title}</p>
              <p className="stage-status" aria-live="polite">
                {solved ? 'Picture complete' : timeExpired ? 'Time for a soft reset' : selectedIndex === null ? 'Choose two tiles to swap' : 'Choose another tile'}
              </p>
            </div>
            <div className="stage-count">
              <span className={`playing-dot ${isRunning && !solved && !timeExpired ? 'is-active' : ''}`} aria-hidden="true" />
              <strong>{moves.toString().padStart(2, '0')}</strong>
              <span>moves</span>
            </div>
          </div>

          <div className={`board-frame ${solved ? 'is-solved' : ''} ${timeExpired ? 'is-paused' : ''}`} key={`${artworkSeed}-${category}-${settings.weather}-${settings.timeOfDay}`}>
            <div className="board-shadow" aria-hidden="true" />
            <div
              className="puzzle-board"
              role="group"
              aria-describedby="puzzle-help"
              aria-label={`${gridSize} by ${gridSize} ${artwork.title} picture puzzle`}
              style={{ '--grid-size': gridSize } as CSSProperties}
            >
              {tiles.map((tileId, index) => {
                const sourceRow = Math.floor(tileId / gridSize)
                const sourceColumn = tileId % gridSize
                const backgroundPosition = `${sourceColumn * (100 / (gridSize - 1))}% ${sourceRow * (100 / (gridSize - 1))}%`
                const isHint = hintIndices.includes(index)

                return (
                  <button
                    className={`puzzle-tile ${selectedIndex === index ? 'is-selected' : ''} ${isHint ? 'is-hint' : ''}`}
                    key={tileId}
                    type="button"
                    ref={(element) => { tileRefs.current[index] = element }}
                    style={{ backgroundImage: `url("${artwork.src}")`, backgroundPosition }}
                    aria-label={`Tile ${index + 1} of ${tiles.length}, picture piece ${tileId + 1}${selectedIndex === index ? ', selected' : ''}${isHint ? ', gentle hint' : ''}`}
                    aria-pressed={selectedIndex === index}
                    onClick={() => handleTileClick(index)}
                    onKeyDown={(event) => handleTileKeyDown(event, index)}
                    disabled={solved || timeExpired}
                  />
                )
              })}
            </div>
            {timeExpired && <div className="pause-note">A gentle reset awaits</div>}
            {solved && (
              <div className="completion-celebration" aria-hidden="true">
                <span className="celebration-spark spark-one">✦</span>
                <span className="celebration-spark spark-two">✦</span>
                <span className="celebration-spark spark-three">·</span>
                <div className="completion-stamp">Lovely!</div>
              </div>
            )}
          </div>
          <p className="stage-help" id="puzzle-help">
            <span className="help-icon" aria-hidden="true">✦</span>
            Select a tile, then select the tile you would like to trade places with.
          </p>
        </section>

        <aside className="side-rail" aria-label="Puzzle details">
          <div className="rail-section">
            <p className="rail-label">{modeLabel}</p>
            <div className="stats-row">
              <div><span className="stat-value">{settings.showTimer ? formatTime(displayedSeconds) : '—'}</span><span className="stat-label">{mode === 'timed' ? 'left' : 'time'}</span></div>
              <div><span className="stat-value">{bestMoves === null ? '--' : bestMoves.toString().padStart(2, '0')}</span><span className="stat-label">best</span></div>
            </div>
          </div>

          <div className="rail-section mode-section">
            <p className="rail-label">Your pace</p>
            <div className="mode-picker" role="group" aria-label="Puzzle pace">
              <button className={mode === 'relaxed' ? 'is-active' : ''} type="button" aria-pressed={mode === 'relaxed'} onClick={() => startNewPuzzle(gridSize, category, 'relaxed')}>Relaxed</button>
              <button className={mode === 'timed' ? 'is-active' : ''} type="button" aria-pressed={mode === 'timed'} onClick={() => startNewPuzzle(gridSize, category, 'timed')}>5 min</button>
              <button className={mode === 'daily' ? 'is-active' : ''} type="button" aria-pressed={mode === 'daily'} onClick={() => startNewPuzzle(gridSize, category, 'daily')}>Daily</button>
            </div>
          </div>

          <div className="rail-section difficulty-section">
            <p className="rail-label">Picture size</p>
            <div className="difficulty-picker" role="group" aria-label="Picture size">
              {([3, 4] as const).map((size) => (
                <button
                  className={gridSize === size ? 'is-active' : ''}
                  key={size}
                  type="button"
                  aria-pressed={gridSize === size}
                  onClick={() => startNewPuzzle(size)}
                >
                  {size} × {size}
                </button>
              ))}
            </div>
          </div>

          <div className="rail-section category-section">
            <p className="rail-label">Choose a feeling</p>
            <div className="category-picker" role="group" aria-label="Artwork category">
              {ARTWORK_CATEGORIES.map((option) => (
                <button
                  className={category === option.id ? 'is-active' : ''}
                  key={option.id}
                  type="button"
                  aria-pressed={category === option.id}
                  onClick={() => startNewPuzzle(gridSize, option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rail-actions">
            <button className="rail-action" type="button" onClick={undoMove} disabled={pastBoards.length === 0 || solved || timeExpired}>
              <span aria-hidden="true">↶</span> Undo
            </button>
            <button className="rail-action" type="button" onClick={redoMove} disabled={futureBoards.length === 0 || solved || timeExpired}>
              <span aria-hidden="true">↷</span> Redo
            </button>
            <button className="rail-action" type="button" onClick={showHint} disabled={solved || timeExpired}>
              <span aria-hidden="true">✦</span> Gentle hint
            </button>
            <button className={`rail-action ${showPreview ? 'is-active' : ''}`} type="button" aria-pressed={showPreview} onClick={() => setShowPreview((visible) => !visible)}>
              <span aria-hidden="true">▧</span> {showPreview ? 'Hide picture' : 'View picture'}
            </button>
          </div>

          {showPreview && (
            <div className="reference-panel">
              <p className="rail-label">A little reference</p>
              <img src={artwork.src} alt={`The complete ${artwork.title} picture`} />
            </div>
          )}

          <details className="settings-panel">
            <summary><span aria-hidden="true">◌</span> Comfort settings</summary>
            <div className="settings-list">
              <label><input type="checkbox" checked={settings.soundEnabled} onChange={(event) => updateSetting('soundEnabled', event.target.checked)} /> Soft sounds</label>
              <label><input type="checkbox" checked={settings.ambientEnabled} onChange={(event) => updateSetting('ambientEnabled', event.target.checked)} /> Ambient hum</label>
              <label><input type="checkbox" checked={settings.showTimer} onChange={(event) => updateSetting('showTimer', event.target.checked)} /> Show timer</label>
              <label><input type="checkbox" checked={settings.largeText} onChange={(event) => updateSetting('largeText', event.target.checked)} /> Larger text</label>
              <label><input type="checkbox" checked={settings.highContrast} onChange={(event) => updateSetting('highContrast', event.target.checked)} /> High contrast</label>
              <label><input type="checkbox" checked={settings.darkMode} onChange={(event) => updateSetting('darkMode', event.target.checked)} /> Evening palette</label>
              <label className="setting-select">Weather
                <select value={settings.weather} onChange={(event) => updateSetting('weather', event.target.value as Weather)}>
                  <option value="auto">Surprise me</option>
                  <option value="sunny">Sunny</option>
                  <option value="rainy">Rainy</option>
                  <option value="misty">Misty</option>
                </select>
              </label>
              <label className="setting-select">Time of day
                <select value={settings.timeOfDay} onChange={(event) => updateSetting('timeOfDay', event.target.value as TimeOfDay)}>
                  <option value="auto">Natural</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </label>
              <label className="setting-select">Accent
                <select value={settings.colorTheme} onChange={(event) => updateSetting('colorTheme', event.target.value as Settings['colorTheme'])}>
                  <option value="terracotta">Terracotta</option>
                  <option value="sage">Sage</option>
                  <option value="lavender">Lavender</option>
                  <option value="blue">Blue</option>
                  <option value="japanese">Japanese</option>
                </select>
              </label>
              <span className="achievement-count">{unlockedAchievementCount} / {ACHIEVEMENTS.length} little milestones</span>
              <button className="save-copy-button" type="button" onClick={exportSave}>Save a copy</button>
            </div>
          </details>

          <div className={`completion-note ${solved ? 'is-visible' : ''}`} aria-live="polite">
            <span className="completion-spark" aria-hidden="true">✦</span>
            <div>
              <strong>Nicely done.</strong>
              <span>You made a moment of stillness.</span>
            </div>
          </div>

          <p className="rail-footer"><span aria-hidden="true">◌</span> a soft place to pause</p>
        </aside>
      </div>
    </main>
  )
}

export default App
