export type GridSize = 3 | 4

export function createSeededRandom(seed: number) {
  let value = seed >>> 0

  return () => {
    value = (value + 0x6d2b79f5) | 0
    let result = Math.imul(value ^ (value >>> 15), 1 | value)
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

export function createDailySeed(date = new Date()) {
  return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate()
}

export function createSolvedTiles(size: GridSize): number[] {
  return Array.from({ length: size * size }, (_, index) => index)
}

export function createShuffledTiles(size: GridSize, random = Math.random): number[] {
  const tiles = createSolvedTiles(size)

  for (let index = tiles.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[tiles[index], tiles[swapIndex]] = [tiles[swapIndex], tiles[index]]
  }

  if (isSolved(tiles)) {
    ;[tiles[0], tiles[1]] = [tiles[1], tiles[0]]
  }

  return tiles
}

export function createDifferentShuffledTiles(
  size: GridSize,
  previousTiles: number[],
  random = Math.random,
): number[] {
  const tiles = createShuffledTiles(size, random)
  const matchesPrevious =
    tiles.length === previousTiles.length &&
    tiles.every((tileId, index) => tileId === previousTiles[index])

  if (!matchesPrevious) return tiles

  ;[tiles[0], tiles[1], tiles[2]] = [tiles[1], tiles[2], tiles[0]]
  if (isSolved(tiles)) {
    ;[tiles[0], tiles[1]] = [tiles[1], tiles[0]]
  }

  return tiles
}

export function swapTiles(tiles: number[], firstIndex: number, secondIndex: number): number[] {
  if (
    firstIndex < 0 ||
    secondIndex < 0 ||
    firstIndex >= tiles.length ||
    secondIndex >= tiles.length ||
    firstIndex === secondIndex
  ) {
    return tiles
  }

  const nextTiles = [...tiles]
  ;[nextTiles[firstIndex], nextTiles[secondIndex]] = [nextTiles[secondIndex], nextTiles[firstIndex]]
  return nextTiles
}

export function isSolved(tiles: number[]): boolean {
  return tiles.every((tileId, index) => tileId === index)
}