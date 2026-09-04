type Palette = {
  sky: string
  skyDeep: string
  hill: string
  ground: string
  accent: string
  accentLight: string
  dark: string
  glow: string
}

type Theme = {
  title: string
  note: string
  night: boolean
}

export type ArtworkCategory = 'cozy' | 'romance' | 'nature' | 'scifi' | 'fantasy' | 'ocean'
export type Weather = 'auto' | 'sunny' | 'rainy' | 'misty'
export type TimeOfDay = 'auto' | 'morning' | 'afternoon' | 'evening'
export type ArtworkAtmosphere = {
  weather: Weather
  timeOfDay: TimeOfDay
}

export const ARTWORK_CATEGORIES: Array<{ id: ArtworkCategory; label: string }> = [
  { id: 'cozy', label: 'Cozy' },
  { id: 'romance', label: 'Romance' },
  { id: 'nature', label: 'Nature' },
  { id: 'scifi', label: 'Sci-fi' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'ocean', label: 'Ocean' },
]

export type Artwork = {
  title: string
  note: string
  edition: number
  src: string
}

const palettes: Palette[] = [
  {
    sky: '#DCE9DE',
    skyDeep: '#B8D0BE',
    hill: '#A8BF9F',
    ground: '#7F9B78',
    accent: '#D27E59',
    accentLight: '#E8B276',
    dark: '#476B59',
    glow: '#F5D6A7',
  },
  {
    sky: '#D7E1E8',
    skyDeep: '#A9C1C8',
    hill: '#86A5A2',
    ground: '#5E8175',
    accent: '#B96C5A',
    accentLight: '#E2AF79',
    dark: '#385B5A',
    glow: '#F1D5A4',
  },
  {
    sky: '#F1DFC7',
    skyDeep: '#DAB98F',
    hill: '#B68F6E',
    ground: '#7D765B',
    accent: '#C66E51',
    accentLight: '#E0A36C',
    dark: '#5E5C4B',
    glow: '#F8CA7F',
  },
  {
    sky: '#303F61',
    skyDeep: '#5E7183',
    hill: '#49696B',
    ground: '#31534E',
    accent: '#B86C59',
    accentLight: '#D8A06D',
    dark: '#213E43',
    glow: '#F2D394',
  },
  {
    sky: '#D8E7E5',
    skyDeep: '#A7C8C5',
    hill: '#83A9A0',
    ground: '#638A7C',
    accent: '#D07B62',
    accentLight: '#E6B077',
    dark: '#3D6761',
    glow: '#F3D9A6',
  },
  {
    sky: '#E6D9D4',
    skyDeep: '#C8B5B0',
    hill: '#A78982',
    ground: '#6F7770',
    accent: '#B66C5A',
    accentLight: '#DFA77B',
    dark: '#4A5B58',
    glow: '#F0C78D',
  },
]

const themes: Record<ArtworkCategory, Theme[]> = {
  cozy: [
    { title: 'Garden nook', note: 'afternoon light', night: false },
    { title: 'Mossy cabin', note: 'a slower hour', night: false },
    { title: 'Sunday kitchen', note: 'something warm', night: false },
  ],
  romance: [
    { title: 'Candlelit picnic', note: 'just us two', night: true },
    { title: 'Rose garden', note: 'a little love note', night: false },
    { title: 'Sweetheart cafe', note: 'after the rain', night: false },
  ],
  nature: [
    { title: 'Fern valley', note: 'where the wild things grow', night: false },
    { title: 'Wildflower trail', note: 'take the long way', night: false },
    { title: 'Forest clearing', note: 'sun through the leaves', night: false },
  ],
  scifi: [
    { title: 'Starlight station', note: 'somewhere out there', night: true },
    { title: 'Moonbase garden', note: 'tomorrow feels close', night: true },
    { title: 'Neon orbit', note: 'a gentle new world', night: true },
  ],
  fantasy: [
    { title: "Dragon's tea garden", note: 'a little bit enchanted', night: false },
    { title: 'Cloud castle', note: 'above the ordinary', night: false },
    { title: 'Mushroom glade', note: 'follow the fireflies', night: true },
  ],
  ocean: [
    { title: 'Seaside morning', note: 'salt in the air', night: false },
    { title: 'Tidepool cove', note: 'small wonders below', night: false },
    { title: 'Quiet lighthouse', note: 'the waves know the way', night: true },
  ],
}

function createRandom(seed: number) {
  let value = seed >>> 0

  return () => {
    value = (value + 0x6d2b79f5) | 0
    let result = Math.imul(value ^ (value >>> 15), 1 | value)
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(items: T[], random: () => number) {
  return items[Math.floor(random() * items.length)]
}

function createClouds(random: () => number, color: string) {
  return Array.from({ length: 4 }, () => {
    const x = Math.round(90 + random() * 1020)
    const y = Math.round(120 + random() * 260)
    const width = Math.round(100 + random() * 150)
    return `<g fill="${color}" opacity=".28"><circle cx="${x}" cy="${y}" r="${Math.round(width * .26)}"/><circle cx="${x + Math.round(width * .3)}" cy="${y - 18}" r="${Math.round(width * .34)}"/><circle cx="${x + Math.round(width * .62)}" cy="${y}" r="${Math.round(width * .24)}"/><path d="M${x - 28} ${y + 13}H${x + width + 20}V${y + 38}H${x - 28}V${y + 13}Z"/></g>`
  }).join('')
}

function createStars(random: () => number, color: string) {
  return Array.from({ length: 22 }, () => {
    const x = Math.round(55 + random() * 1090)
    const y = Math.round(54 + random() * 410)
    const radius = Math.round(2 + random() * 4)
    return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="${(0.35 + random() * .55).toFixed(2)}"/>`
  }).join('')
}

function createRain(random: () => number, color: string) {
  return Array.from({ length: 28 }, () => {
    const x = Math.round(random() * 1200)
    const y = Math.round(120 + random() * 560)
    return `<path d="M${x} ${y}l-18 58" stroke="${color}" stroke-width="7" stroke-linecap="round" opacity=".38"/>`
  }).join('')
}

function createMist(random: () => number, color: string) {
  return Array.from({ length: 5 }, () => {
    const x = Math.round(100 + random() * 1000)
    const y = Math.round(540 + random() * 300)
    return `<ellipse cx="${x}" cy="${y}" rx="${Math.round(110 + random() * 130)}" ry="34" fill="${color}" opacity=".16"/>`
  }).join('')
}

function createFlowers(random: () => number, palette: Palette) {
  return Array.from({ length: 12 }, (_, index) => {
    const x = Math.round(45 + (index / 11) * 1110 + (random() - .5) * 80)
    const y = Math.round(1000 + random() * 120)
    const height = Math.round(45 + random() * 110)
    const flower = pick([palette.accent, palette.accentLight, palette.glow], random)
    return `<g><path d="M${x} ${y}C${x - 8} ${y - height * .4} ${x + 10} ${y - height * .72} ${x} ${y - height}" stroke="${palette.dark}" stroke-width="7" stroke-linecap="round"/><circle cx="${x}" cy="${y - height}" r="${Math.round(7 + random() * 8)}" fill="${flower}"/><circle cx="${x + 13}" cy="${y - height + 5}" r="${Math.round(5 + random() * 5)}" fill="${flower}" opacity=".8"/></g>`
  }).join('')
}

function createCozyScene(
  palette: Palette,
  structureX: number,
  structureWidth: number,
  roofPeak: number,
  windowColor: string,
) {
  return `<path d="M${structureX} 730L${structureX + Math.round(structureWidth / 2)} ${roofPeak}L${structureX + structureWidth} 730V920H${structureX}V730Z" fill="${palette.accent}"/><path d="M${structureX - 28} 728L${structureX + Math.round(structureWidth / 2)} ${roofPeak - 54}L${structureX + structureWidth + 28} 728L${structureX + structureWidth} 758L${structureX + Math.round(structureWidth / 2)} ${roofPeak + 18}L${structureX} 758L${structureX - 28} 728Z" fill="${palette.dark}"/><path d="M${structureX + 62} 744H${structureX + structureWidth - 62}V880H${structureX + 62}V744Z" fill="${windowColor}" opacity=".9"/><path d="M${structureX + Math.round(structureWidth / 2)} 744V880M${structureX + 62} 812H${structureX + structureWidth - 62}" stroke="${palette.dark}" stroke-width="13" opacity=".72"/><path d="M${structureX - 5} 884H${structureX + structureWidth + 5}V930H${structureX - 5}V884Z" fill="${palette.dark}" opacity=".88"/><path d="M${structureX + 110} 930V1060M${structureX + structureWidth - 110} 930V1060" stroke="${palette.dark}" stroke-width="20" stroke-linecap="round"/><path d="M${structureX + 75} 930H${structureX + structureWidth - 75}" stroke="${palette.dark}" stroke-width="22" stroke-linecap="round"/>`
}

function createRomanceScene(random: () => number, palette: Palette) {
  const tableX = Math.round(330 + random() * 180)
  const tableWidth = Math.round(440 + random() * 100)
  const heartX = Math.round(470 + random() * 250)
  return `<ellipse cx="600" cy="990" rx="350" ry="100" fill="${palette.accent}" opacity=".2"/><path d="M${tableX} 820H${tableX + tableWidth}L${tableX + tableWidth - 54} 932H${tableX + 54}L${tableX} 820Z" fill="${palette.accent}"/><path d="M${tableX - 20} 797C${tableX + 68} 754 ${tableX + tableWidth - 70} 754 ${tableX + tableWidth + 20} 797C${tableX + tableWidth - 80} 838 ${tableX + 66} 838 ${tableX - 20} 797Z" fill="${palette.accentLight}"/><path d="M${tableX + 90} 930V1055M${tableX + tableWidth - 90} 930V1055" stroke="${palette.dark}" stroke-width="20" stroke-linecap="round"/><path d="M${heartX} 720C${heartX - 46} 677 ${heartX - 87} 734 ${heartX} 804C${heartX + 87} 734 ${heartX + 46} 677 ${heartX} 720Z" fill="${palette.accent}"/><path d="M${heartX - 107} 785C${heartX - 125} 751 ${heartX - 151} 763 ${heartX - 126} 802C${heartX - 101} 763 ${heartX - 107} 751 ${heartX - 107} 785Z" fill="${palette.accentLight}"/><path d="M${heartX + 110} 782C${heartX + 92} 749 ${heartX + 66} 762 ${heartX + 91} 800C${heartX + 116} 762 ${heartX + 110} 749 ${heartX + 110} 782Z" fill="${palette.accentLight}"/>`
}

function createNatureScene(random: () => number, palette: Palette) {
  const treeX = Math.round(180 + random() * 180)
  const treeY = Math.round(500 + random() * 80)
  const secondTreeX = Math.round(850 + random() * 160)
  return `<path d="M440 1200C410 1042 489 936 567 845C632 770 682 696 733 588C759 768 711 879 658 960C619 1022 617 1120 640 1200H440Z" fill="${palette.skyDeep}" opacity=".8"/><path d="M${treeX} 880C${treeX + 17} 756 ${treeX + 35} 659 ${treeX + 75} 553" stroke="${palette.dark}" stroke-width="34" stroke-linecap="round"/><circle cx="${treeX + 37}" cy="${treeY}" r="118" fill="${palette.dark}"/><circle cx="${treeX - 36}" cy="${treeY + 45}" r="91" fill="${palette.ground}"/><circle cx="${treeX + 122}" cy="${treeY + 35}" r="96" fill="${palette.hill}"/><path d="M${secondTreeX} 926C${secondTreeX + 15} 800 ${secondTreeX + 32} 706 ${secondTreeX + 58} 635" stroke="${palette.dark}" stroke-width="27" stroke-linecap="round"/><circle cx="${secondTreeX + 42}" cy="${treeY + 80}" r="103" fill="${palette.dark}"/><circle cx="${secondTreeX - 23}" cy="${treeY + 112}" r="72" fill="${palette.ground}"/><path d="M0 1085C280 1020 410 1110 600 1078C790 1046 948 1011 1200 1075" stroke="${palette.accentLight}" stroke-width="16" stroke-linecap="round" opacity=".7"/>`
}

function createScifiScene(random: () => number, palette: Palette) {
  const planetX = Math.round(170 + random() * 860)
  const planetY = Math.round(160 + random() * 180)
  const domeX = Math.round(310 + random() * 220)
  return `<circle cx="${planetX}" cy="${planetY}" r="${Math.round(64 + random() * 55)}" fill="${palette.accentLight}" opacity=".8"/><path d="M${planetX - 152} ${planetY + 22}C${planetX - 60} ${planetY + 68} ${planetX + 70} ${planetY + 68} ${planetX + 152} ${planetY + 22}" stroke="${palette.glow}" stroke-width="11" opacity=".7"/><path d="M0 875H1200V1200H0V875Z" fill="${palette.dark}" opacity=".8"/><path d="M${domeX} 875C${domeX + 20} 696 ${domeX + 305} 696 ${domeX + 325} 875" fill="${palette.skyDeep}" stroke="${palette.accentLight}" stroke-width="13"/><path d="M${domeX + 54} 875C${domeX + 70} 754 ${domeX + 250} 754 ${domeX + 272} 875" fill="${palette.sky}" opacity=".7"/><path d="M${domeX + 163} 696V875M${domeX + 20} 831H${domeX + 305}" stroke="${palette.accentLight}" stroke-width="9" opacity=".75"/><path d="M125 875V1030M125 914H280V1040H125M920 875V1038M920 922H1086V1040H920" stroke="${palette.accentLight}" stroke-width="17" stroke-linecap="round" opacity=".8"/><g fill="${palette.glow}"><circle cx="177" cy="952" r="9"/><circle cx="242" cy="969" r="9"/><circle cx="975" cy="957" r="9"/><circle cx="1050" cy="984" r="9"/></g><path d="M560 1060L600 954L640 1060" stroke="${palette.accent}" stroke-width="13" stroke-linejoin="round"/>`
}

function createFantasyScene(random: () => number, palette: Palette) {
  const towerX = Math.round(390 + random() * 220)
  const towerHeight = Math.round(240 + random() * 100)
  return `<path d="M0 900C178 802 330 855 461 885C629 924 765 789 920 836C1032 870 1117 833 1200 850V1200H0V900Z" fill="${palette.ground}"/><path d="M${towerX} 880V${towerHeight + 430}H${towerX + 190}V880L${towerX + 95} 757L${towerX} 880Z" fill="${palette.accent}"/><path d="M${towerX - 25} 880L${towerX + 95} ${towerHeight + 340}L${towerX + 215} 880L${towerX + 165} 880L${towerX + 95} ${towerHeight + 400}L${towerX + 25} 880Z" fill="${palette.dark}"/><path d="M${towerX + 42} 910H${towerX + 148}V${towerHeight + 516}H${towerX + 42}V910Z" fill="${palette.skyDeep}"/><path d="M${towerX + 95} 910V${towerHeight + 516}" stroke="${palette.dark}" stroke-width="11"/><path d="M${towerX + 72} ${towerHeight + 440}C${towerX + 72} ${towerHeight + 395} ${towerX + 118} ${towerHeight + 395} ${towerX + 118} ${towerHeight + 440}" stroke="${palette.glow}" stroke-width="13" stroke-linecap="round"/><g fill="${palette.accentLight}"><circle cx="205" cy="909" r="45"/><circle cx="158" cy="950" r="34"/><circle cx="253" cy="951" r="37"/><circle cx="978" cy="881" r="54"/><circle cx="1033" cy="930" r="37"/><circle cx="929" cy="932" r="39"/></g><path d="M205 1030V916M978 1030V887" stroke="${palette.dark}" stroke-width="11" stroke-linecap="round"/>`
}

function createOceanScene(random: () => number, palette: Palette) {
  const lighthouseX = Math.round(850 + random() * 150)
  const lighthouseTop = Math.round(420 + random() * 110)
  const boatX = Math.round(300 + random() * 250)
  return `<path d="M0 690C200 630 350 720 530 679C720 636 858 709 1200 650V1200H0V690Z" fill="${palette.skyDeep}"/><path d="M0 790C190 730 325 820 516 774C703 730 881 803 1200 742V1200H0V790Z" fill="${palette.ground}"/><path d="M0 881C198 822 339 911 545 869C730 831 917 896 1200 830" stroke="${palette.glow}" stroke-width="18" stroke-linecap="round" opacity=".75"/><path d="M${lighthouseX} 855V${lighthouseTop}H${lighthouseX + 102}V855H${lighthouseX}Z" fill="${palette.accent}"/><path d="M${lighthouseX - 25} ${lighthouseTop}L${lighthouseX + 51} ${lighthouseTop - 81}L${lighthouseX + 127} ${lighthouseTop}H${lighthouseX - 25}Z" fill="${palette.dark}"/><path d="M${lighthouseX - 42} ${lighthouseTop + 39}H${lighthouseX + 75}V${lighthouseTop + 134}H${lighthouseX - 42}V${lighthouseTop + 39}Z" fill="${palette.glow}"/><path d="M${boatX} 815L${boatX + 230} 815L${boatX + 193} 855H${boatX + 37}L${boatX} 815Z" fill="${palette.accent}"/><path d="M${boatX + 112} 810V${boatX - 20}" stroke="${palette.dark}" stroke-width="10"/><path d="M${boatX + 112} 695L${boatX + 112} 803L${boatX + 202} 803L${boatX + 112} 695Z" fill="${palette.glow}"/><path d="M96 972C203 936 292 1010 389 970M760 1008C877 965 991 1042 1114 994" stroke="${palette.accentLight}" stroke-width="12" stroke-linecap="round" opacity=".7"/>`
}

function createScene(
  category: ArtworkCategory,
  random: () => number,
  palette: Palette,
  structureX: number,
  structureWidth: number,
  roofPeak: number,
  windowColor: string,
) {
  if (category === 'romance') return createRomanceScene(random, palette)
  if (category === 'nature') return createNatureScene(random, palette)
  if (category === 'scifi') return createScifiScene(random, palette)
  if (category === 'fantasy') return createFantasyScene(random, palette)
  if (category === 'ocean') return createOceanScene(random, palette)
  return createCozyScene(palette, structureX, structureWidth, roofPeak, windowColor)
}

export function createArtwork(
  seed: number,
  category: ArtworkCategory = 'cozy',
  atmosphere: ArtworkAtmosphere = { weather: 'auto', timeOfDay: 'auto' },
): Artwork {
  const random = createRandom(seed)
  const palette = pick(palettes, random)
  const theme = pick(themes[category], random)
  const sunX = Math.round(170 + random() * 860)
  const sunY = Math.round(145 + random() * 170)
  const hillOne = Math.round(520 + random() * 100)
  const hillTwo = Math.round(680 + random() * 100)
  const structureX = Math.round(280 + random() * 170)
  const structureWidth = Math.round(500 + random() * 130)
  const roofPeak = Math.round(340 + random() * 70)
  const windowColor = pick([palette.sky, palette.skyDeep, '#D8E4D4'], random)
  const isEvening = atmosphere.timeOfDay === 'evening' || (atmosphere.timeOfDay === 'auto' && theme.night)
  const cloudMarkup = isEvening ? '' : createClouds(random, palette.accentLight)
  const starMarkup = isEvening ? createStars(random, palette.glow) : ''
  const weatherMarkup = atmosphere.weather === 'rainy'
    ? createRain(random, palette.glow)
    : atmosphere.weather === 'misty'
      ? createMist(random, palette.glow)
      : ''
  const flowerMarkup = ['cozy', 'romance', 'nature', 'fantasy'].includes(category)
    ? createFlowers(random, palette)
    : ''
  const moonMarkup = isEvening
    ? `<circle cx="${sunX}" cy="${sunY}" r="150" fill="${palette.glow}" opacity=".14"/><circle cx="${sunX}" cy="${sunY}" r="92" fill="${palette.glow}"/><circle cx="${sunX + 34}" cy="${sunY - 25}" r="92" fill="${palette.sky}"/>`
    : `<circle cx="${sunX}" cy="${sunY}" r="132" fill="${palette.glow}" opacity=".18"/><circle cx="${sunX}" cy="${sunY}" r="88" fill="${palette.glow}" opacity=".78"/>`
  const sceneMarkup = createScene(category, random, palette, structureX, structureWidth, roofPeak, windowColor)
  const svg = `<svg width="1200" height="1200" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg" data-seed="${seed}" data-category="${category}" data-weather="${atmosphere.weather}" data-time="${atmosphere.timeOfDay}"><defs><linearGradient id="sky" x1="600" y1="0" x2="600" y2="760" gradientUnits="userSpaceOnUse"><stop stop-color="${palette.sky}"/><stop offset="1" stop-color="${palette.skyDeep}"/></linearGradient><linearGradient id="ground" x1="600" y1="580" x2="600" y2="1200" gradientUnits="userSpaceOnUse"><stop stop-color="${palette.hill}"/><stop offset="1" stop-color="${palette.ground}"/></linearGradient><filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="18"/></filter></defs><rect width="1200" height="1200" fill="url(#sky)"/>${moonMarkup}${starMarkup}${cloudMarkup}${weatherMarkup}<path d="M0 ${hillOne}C160 ${hillOne - 105} 280 ${hillOne - 15} 420 ${hillOne + 12}C575 ${hillOne + 42} 685 ${hillOne - 100} 832 ${hillOne - 45}C980 ${hillOne + 12} 1088 ${hillOne - 45} 1200 ${hillOne}V1200H0V${hillOne}Z" fill="${palette.hill}"/><path d="M0 ${hillTwo}C170 ${hillTwo - 95} 320 ${hillTwo - 20} 472 ${hillTwo + 10}C622 ${hillTwo + 37} 742 ${hillTwo - 90} 884 ${hillTwo - 35}C1020 ${hillTwo + 15} 1090 ${hillTwo - 50} 1200 ${hillTwo - 4}V1200H0V${hillTwo}Z" fill="url(#ground)"/><ellipse cx="600" cy="1028" rx="410" ry="80" fill="${palette.dark}" opacity=".22" filter="url(#shadow)"/>${sceneMarkup}${flowerMarkup}</svg>`

  return {
    title: theme.title,
    note: theme.note,
    edition: (seed >>> 0) % 100,
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
  }
}
