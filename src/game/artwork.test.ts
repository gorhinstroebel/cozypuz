import { describe, expect, it } from 'vitest'
import { createArtwork } from './artwork'

describe('procedural artwork', () => {
  it('creates stable artwork for the same seed', () => {
    expect(createArtwork(42)).toEqual(createArtwork(42))
  })

  it('creates a different offline artwork for every new seed', () => {
    const artworks = [42, 43, 44, 45].map((seed) => createArtwork(seed))

    expect(new Set(artworks.map((artwork) => artwork.src)).size).toBe(4)
    expect(artworks.every((artwork) => artwork.src.startsWith('data:image/svg+xml'))).toBe(true)
  })

  it('bakes weather and time-of-day choices into the artwork', () => {
    const artwork = createArtwork(42, 'romance', { weather: 'rainy', timeOfDay: 'evening' })

    expect(artwork.src).toContain('data-weather%3D%22rainy%22')
    expect(artwork.src).toContain('data-time%3D%22evening%22')
  })
})
