import { describe, expect, it } from 'vitest'
import {
  createDailySeed,
  createDifferentShuffledTiles,
  createSeededRandom,
  createShuffledTiles,
  createSolvedTiles,
  isSolved,
  swapTiles,
} from './puzzle'

describe('puzzle engine', () => {
  it('creates repeatable seeds for daily puzzles', () => {
    const first = createSeededRandom(createDailySeed(new Date('2026-09-04T12:00:00Z')))
    const second = createSeededRandom(createDailySeed(new Date('2026-09-04T22:00:00Z')))

    expect(createDailySeed(new Date('2026-09-04T12:00:00Z'))).toBe(20260904)
    expect([first(), first(), first()]).toEqual([second(), second(), second()])
  })

  it('creates a solved board with the expected number of tiles', () => {
    expect(createSolvedTiles(3)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    expect(createSolvedTiles(4)).toHaveLength(16)
    expect(isSolved(createSolvedTiles(4))).toBe(true)
  })

  it('shuffles into a valid, unsolved permutation', () => {
    const tiles = createShuffledTiles(4, () => 0)

    expect(tiles).toHaveLength(16)
    expect([...tiles].sort((first, second) => first - second)).toEqual(createSolvedTiles(4))
    expect(isSolved(tiles)).toBe(false)
  })

  it('avoids returning a solved board after a no-op shuffle', () => {
    const tiles = createShuffledTiles(3, () => 0.999999)

    expect(tiles).toEqual([1, 0, 2, 3, 4, 5, 6, 7, 8])
  })

  it('creates a different layout when a shuffle repeats the previous board', () => {
    const previousTiles = [1, 0, 2, 3, 4, 5, 6, 7, 8]
    const tiles = createDifferentShuffledTiles(3, previousTiles, () => 0.999999)

    expect(tiles).not.toEqual(previousTiles)
    expect(isSolved(tiles)).toBe(false)
  })

  it('swaps two positions without mutating the original board', () => {
    const original = [0, 4, 2, 3, 1, 5]

    expect(swapTiles(original, 1, 4)).toEqual([0, 1, 2, 3, 4, 5])
    expect(original).toEqual([0, 4, 2, 3, 1, 5])
  })

  it('ignores invalid or repeated positions', () => {
    const original = [0, 1, 2]

    expect(swapTiles(original, -1, 1)).toBe(original)
    expect(swapTiles(original, 0, 3)).toBe(original)
    expect(swapTiles(original, 1, 1)).toBe(original)
  })

  it('recognizes a board only when every tile is in place', () => {
    expect(isSolved([0, 1, 2])).toBe(true)
    expect(isSolved([0, 2, 1])).toBe(false)
  })
})