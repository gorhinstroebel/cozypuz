import { ARTWORK_CATEGORIES, type ArtworkCategory } from './artwork'
import type { GridSize } from './puzzle'

export type PlayMode = 'relaxed' | 'timed' | 'daily'

export type SavedGame = {
  gridSize: GridSize
  tiles: number[]
  moves: number
  elapsedSeconds: number
  category: ArtworkCategory
  mode: PlayMode
  artworkSeed: number
  pastBoards: number[][]
  futureBoards: number[][]
}

export const SAVE_KEY = 'cozypuz-save-v2'
export const TIME_LIMIT_SECONDS = 300

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isGridSize(value: unknown): value is GridSize {
  return value === 3 || value === 4
}

function isMode(value: unknown): value is PlayMode {
  return value === 'relaxed' || value === 'timed' || value === 'daily'
}

function isCategory(value: unknown): value is ArtworkCategory {
  return ARTWORK_CATEGORIES.some((category) => category.id === value)
}

function isTileBoard(value: unknown, size: GridSize): value is number[] {
  return Array.isArray(value) &&
    value.length === size * size &&
    value.every((tile) => typeof tile === 'number' && Number.isInteger(tile) && tile >= 0 && tile < size * size) &&
    new Set(value).size === size * size
}

function isBoardHistory(value: unknown, size: GridSize): value is number[][] {
  return Array.isArray(value) && value.every((board) => isTileBoard(board, size))
}

export function loadSavedGame(): SavedGame | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    if (!raw) return null

    const value: unknown = JSON.parse(raw)
    if (!isRecord(value) || !isGridSize(value.gridSize)) return null
    if (!isTileBoard(value.tiles, value.gridSize) || !isBoardHistory(value.pastBoards, value.gridSize)) return null
    if (!isBoardHistory(value.futureBoards, value.gridSize)) return null
    if (
      typeof value.moves !== 'number' ||
      !Number.isFinite(value.moves) ||
      value.moves < 0 ||
      typeof value.elapsedSeconds !== 'number' ||
      !Number.isFinite(value.elapsedSeconds) ||
      value.elapsedSeconds < 0 ||
      typeof value.artworkSeed !== 'number' ||
      !Number.isFinite(value.artworkSeed) ||
      !isCategory(value.category) ||
      !isMode(value.mode)
    ) return null

    return {
      gridSize: value.gridSize,
      tiles: value.tiles,
      moves: value.moves,
      elapsedSeconds: value.elapsedSeconds,
      category: value.category,
      mode: value.mode,
      artworkSeed: value.artworkSeed,
      pastBoards: value.pastBoards,
      futureBoards: value.futureBoards,
    }
  } catch {
    return null
  }
}

export function saveGame(game: SavedGame) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(game))
  } catch {
    // Storage may be unavailable in private browsing or restricted webviews.
  }
}
