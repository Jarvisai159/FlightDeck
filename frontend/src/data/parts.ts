// Part catalog modeled after the Susu Blocks "Creative Metal" STEAM construction sets
// shown on the box art (Set 1204 - 166pcs, 4 models; and the 331pcs aircraft set).
// SKU codes are reproduced from the box label so the inventory panel matches the photos.

export type PartCategory =
  | 'tool'
  | 'bolt'
  | 'nut'
  | 'washer'
  | 'beam'
  | 'bracket'
  | 'plate'
  | 'wheel'
  | 'tire'
  | 'gear'
  | 'hub'
  | 'spacer'
  | 'axle'
  | 'pad'
  | 'bearing'

export type PartColor = 'green' | 'silver' | 'black' | 'blue' | 'red'

export interface PartSpec {
  /** SKU printed on the box label, e.g. "L060", "A503", "C2525" */
  sku: string
  /** Human-readable category used by the SVG renderer */
  category: PartCategory
  /** Width / height of the SVG bounding box, in pixels at 1x */
  width: number
  height: number
  /** Color theme for the renderer */
  color: PartColor
  /** Variant: number of holes for beams/plates, or shape variant */
  variant?: number | string
  /** rows x cols for grid plates */
  cols?: number
  rows?: number
  /** Display label for the inventory panel (defaults to sku) */
  label?: string
}

// ---------------------------------------------------------------------------
// Catalog of unique SKUs.  Counts live in `KITS` below.
// ---------------------------------------------------------------------------

export const PARTS: Record<string, PartSpec> = {
  // Tools
  BS101: { sku: 'BS101', category: 'tool', variant: 'wrench-open', color: 'silver', width: 64, height: 18 },
  BS102: { sku: 'BS102', category: 'tool', variant: 'wrench-box', color: 'red', width: 64, height: 18 },
  BS104: { sku: 'BS104', category: 'tool', variant: 'screwdriver', color: 'red', width: 70, height: 14 },

  // Bolts (L0xx, L1xx, L2xx, L3xx) - lengths roughly L+0xx mm
  L060: { sku: 'L060', category: 'bolt', variant: 14, color: 'silver', width: 12, height: 22 },
  L085: { sku: 'L085', category: 'bolt', variant: 18, color: 'silver', width: 12, height: 26 },
  L105: { sku: 'L105', category: 'bolt', variant: 22, color: 'silver', width: 12, height: 30 },
  L125: { sku: 'L125', category: 'bolt', variant: 26, color: 'silver', width: 12, height: 34 },
  L147X: { sku: 'L147X', category: 'bolt', variant: 30, color: 'silver', width: 12, height: 38 },
  L160: { sku: 'L160', category: 'bolt', variant: 32, color: 'silver', width: 12, height: 40 },
  L195: { sku: 'L195', category: 'bolt', variant: 38, color: 'silver', width: 12, height: 46 },
  L210: { sku: 'L210', category: 'bolt', variant: 40, color: 'silver', width: 12, height: 48 },
  L254: { sku: 'L254', category: 'bolt', variant: 48, color: 'silver', width: 12, height: 56 },
  L325: { sku: 'L325', category: 'bolt', variant: 60, color: 'silver', width: 12, height: 68 },

  // Nuts and washers
  L800: { sku: 'L800', category: 'nut', color: 'silver', width: 18, height: 18 },
  L810: { sku: 'L810', category: 'washer', variant: 'thick', color: 'silver', width: 16, height: 16 },
  L901: { sku: 'L901', category: 'washer', variant: 'thin', color: 'silver', width: 16, height: 16 },

  // Small angle brackets
  TA302: { sku: 'TA302', category: 'bracket', variant: 'L', color: 'silver', width: 36, height: 22 },
  TA307: { sku: 'TA307', category: 'bracket', variant: 'L-tall', color: 'silver', width: 36, height: 30 },
  TA504: { sku: 'TA504', category: 'bracket', variant: 'L-long', color: 'silver', width: 60, height: 22 },

  // Flat green / silver strips (beams)
  A302: { sku: 'A302', category: 'beam', color: 'silver', variant: 2, width: 36, height: 16 },
  A503: { sku: 'A503', category: 'beam', color: 'green', variant: 5, width: 80, height: 16, label: 'A503' },
  A503S: { sku: 'A503', category: 'beam', color: 'silver', variant: 5, width: 80, height: 16, label: 'A503' },
  A506X: { sku: 'A506X', category: 'beam', color: 'green', variant: 6, width: 96, height: 16 },
  A704: { sku: 'A704', category: 'beam', color: 'green', variant: 7, width: 112, height: 16 },
  A1107: { sku: 'A1107', category: 'beam', color: 'green', variant: 11, width: 168, height: 16 },
  A1107S: { sku: 'A1107', category: 'beam', color: 'silver', variant: 11, width: 168, height: 16, label: 'A1107' },

  // Small green/silver brackets
  TB201: { sku: 'TB201', category: 'bracket', variant: 'L-small', color: 'green', width: 28, height: 20 },
  B201: { sku: 'B201', category: 'bracket', variant: 'L-small', color: 'silver', width: 28, height: 20 },
  TB302: { sku: 'TB302', category: 'bracket', variant: 'L-med', color: 'green', width: 36, height: 24 },
  TC301: { sku: 'TC301', category: 'bracket', variant: 'L-stub', color: 'silver', width: 24, height: 20 },
  B609: { sku: 'B609', category: 'bracket', variant: 'L-tall', color: 'green', width: 36, height: 38 },

  // U-channel and large flat plates (silver)
  C301: { sku: 'C301', category: 'plate', variant: 'u-small', color: 'silver', width: 60, height: 24 },
  C503X: { sku: 'C503X', category: 'plate', variant: 'u-mid', color: 'silver', width: 80, height: 28 },
  C1212: { sku: 'C1212', category: 'plate', variant: 'grid', color: 'silver', cols: 6, rows: 2, width: 96, height: 36 },
  C2525: { sku: 'C2525', category: 'plate', variant: 'grid', color: 'silver', cols: 5, rows: 5, width: 88, height: 88 },

  // Small green pads / odd plates
  TD201: { sku: 'TD201', category: 'plate', variant: 'tab', color: 'green', width: 24, height: 24 },
  D201: { sku: 'D201', category: 'plate', variant: 'tab', color: 'silver', width: 24, height: 24 },
  TD302: { sku: 'TD302', category: 'plate', variant: 'wedge', color: 'green', width: 30, height: 30 },
  TE301: { sku: 'TE301', category: 'plate', variant: 'long-grid', color: 'green', cols: 6, rows: 2, width: 96, height: 32 },

  // Silver structural plates
  H310: { sku: 'H310', category: 'plate', variant: 'h-trim', color: 'silver', width: 48, height: 22 },
  H402: { sku: 'H402', category: 'plate', variant: 'grid', color: 'silver', cols: 4, rows: 2, width: 64, height: 32 },
  H530: { sku: 'H530', category: 'plate', variant: 'grid', color: 'silver', cols: 5, rows: 3, width: 80, height: 48 },
  H607: { sku: 'H607', category: 'plate', variant: 'h-trim', color: 'silver', width: 60, height: 22 },
  H816: { sku: 'H816', category: 'plate', variant: 'grid', color: 'silver', cols: 8, rows: 2, width: 128, height: 32 },
  H908: { sku: 'H908', category: 'plate', variant: 'grid', color: 'green', cols: 4, rows: 4, width: 64, height: 64 },
  H931: { sku: 'H931', category: 'plate', variant: 'grid', color: 'silver', cols: 9, rows: 3, width: 144, height: 48 },
  H1025: { sku: 'H1025', category: 'plate', variant: 'grid', color: 'silver', cols: 10, rows: 2, width: 160, height: 32 },
  H1724: { sku: 'H1724', category: 'plate', variant: 'grid', color: 'silver', cols: 7, rows: 4, width: 112, height: 64 },
  H2526: { sku: 'H2526', category: 'plate', variant: 'grid', color: 'green', cols: 5, rows: 4, width: 80, height: 64 },

  // Trapezoidal / wing plates
  TH701X: { sku: 'TH701X', category: 'plate', variant: 'wing', color: 'silver', width: 70, height: 30 },
  TH702X: { sku: 'TH702X', category: 'plate', variant: 'wing', color: 'silver', width: 70, height: 30 },
  TH1345X: { sku: 'TH1345X', category: 'plate', variant: 'wing-long', color: 'silver', width: 110, height: 36 },

  // Axle rod
  TZ070: { sku: 'TZ070', category: 'axle', color: 'silver', width: 110, height: 8 },

  // Mechanical bits
  S001: { sku: 'S001', category: 'gear', color: 'black', width: 44, height: 44 },
  S005: { sku: 'S005', category: 'hub', color: 'silver', width: 16, height: 16 },
  S006: { sku: 'S006', category: 'spacer', color: 'black', width: 14, height: 14 },
  S007: { sku: 'S007', category: 'spacer', color: 'silver', width: 14, height: 14 },
  S008: { sku: 'S008', category: 'pad', color: 'blue', width: 22, height: 22 },
  S010: { sku: 'S010', category: 'bearing', color: 'black', width: 18, height: 18 },
  S011: { sku: 'S011', category: 'bearing', color: 'silver', width: 18, height: 18 },
  S012: { sku: 'S012', category: 'spacer', color: 'silver', width: 16, height: 12 },
  S030: { sku: 'S030', category: 'tire', color: 'black', width: 56, height: 56 },
  S040: { sku: 'S040', category: 'washer', variant: 'rubber', color: 'black', width: 16, height: 16 },
}

export type PartSku = keyof typeof PARTS

// ---------------------------------------------------------------------------
// Kits — counts taken directly from the box labels in the two photos.
// ---------------------------------------------------------------------------

export interface KitDef {
  id: string
  title: string
  pieces: number
  models: string[]
  inventory: { sku: PartSku; count: number }[]
}

export const KIT_1204: KitDef = {
  id: '1204',
  title: 'Creative Metal STEAM · 1204',
  pieces: 166,
  models: ['Truck', 'Plane', 'Tank', 'Helicopter'],
  inventory: [
    { sku: 'BS102', count: 1 },
    { sku: 'BS104', count: 1 },
    { sku: 'L060', count: 30 },
    { sku: 'L105', count: 2 },
    { sku: 'L125', count: 2 },
    { sku: 'L147X', count: 4 },
    { sku: 'L160', count: 2 },
    { sku: 'L210', count: 2 },
    { sku: 'L254', count: 2 },
    { sku: 'L325', count: 1 },
    { sku: 'L800', count: 32 },
    { sku: 'L810', count: 3 },
    { sku: 'L901', count: 3 },
    { sku: 'TA302', count: 3 },
    { sku: 'A302', count: 1 },
    { sku: 'A503', count: 9 },
    { sku: 'A503S', count: 2 },
    { sku: 'TA504', count: 1 },
    { sku: 'A506X', count: 1 },
    { sku: 'A704', count: 2 },
    { sku: 'TB201', count: 6 },
    { sku: 'B201', count: 3 },
    { sku: 'TB302', count: 5 },
    { sku: 'TC301', count: 2 },
    { sku: 'C301', count: 1 },
    { sku: 'C503X', count: 1 },
    { sku: 'C1212', count: 1 },
    { sku: 'C2525', count: 1 },
    { sku: 'TD201', count: 2 },
    { sku: 'D201', count: 1 },
    { sku: 'H310', count: 1 },
    { sku: 'H607', count: 2 },
    { sku: 'TH701X', count: 1 },
    { sku: 'TZ070', count: 3 },
    { sku: 'S001', count: 5 },
    { sku: 'S005', count: 5 },
    { sku: 'S006', count: 9 },
    { sku: 'S007', count: 6 },
    { sku: 'S008', count: 2 },
    { sku: 'S010', count: 2 },
    { sku: 'S012', count: 1 },
    { sku: 'S030', count: 1 },
    { sku: 'S040', count: 1 },
  ],
}

export const KIT_AIRCRAFT: KitDef = {
  id: 'aircraft-331',
  title: 'Creative Metal STEAM · Aircraft',
  pieces: 331,
  models: ['Aircraft (1:32)'],
  inventory: [
    { sku: 'BS101', count: 1 },
    { sku: 'BS102', count: 1 },
    { sku: 'BS104', count: 1 },
    { sku: 'L060', count: 89 },
    { sku: 'L085', count: 2 },
    { sku: 'L105', count: 2 },
    { sku: 'L125', count: 2 },
    { sku: 'L147X', count: 3 },
    { sku: 'L195', count: 3 },
    { sku: 'L254', count: 2 },
    { sku: 'L325', count: 1 },
    { sku: 'L800', count: 102 },
    { sku: 'L810', count: 6 },
    { sku: 'L901', count: 3 },
    { sku: 'A503', count: 3 },
    { sku: 'A704', count: 2 },
    { sku: 'A1107', count: 10 },
    { sku: 'A1107S', count: 2 },
    { sku: 'TA302', count: 2 },
    { sku: 'TA307', count: 2 },
    { sku: 'TA504', count: 2 },
    { sku: 'B609', count: 2 },
    { sku: 'TB201', count: 4 },
    { sku: 'TB302', count: 1 },
    { sku: 'C503X', count: 3 },
    { sku: 'TC301', count: 4 },
    { sku: 'D201', count: 2 },
    { sku: 'TD302', count: 8 },
    { sku: 'TE301', count: 4 },
    { sku: 'H310', count: 4 },
    { sku: 'H402', count: 2 },
    { sku: 'H530', count: 8 },
    { sku: 'H607', count: 2 },
    { sku: 'H816', count: 1 },
    { sku: 'H908', count: 2 },
    { sku: 'H931', count: 1 },
    { sku: 'H1025', count: 1 },
    { sku: 'H1724', count: 1 },
    { sku: 'H2526', count: 2 },
    { sku: 'TH702X', count: 2 },
    { sku: 'TH1345X', count: 2 },
    { sku: 'S005', count: 5 },
    { sku: 'S006', count: 7 },
    { sku: 'S007', count: 9 },
    { sku: 'S008', count: 2 },
    { sku: 'S010', count: 5 },
    { sku: 'S011', count: 2 },
    { sku: 'S030', count: 1 },
    { sku: 'S040', count: 3 },
  ],
}

export const KITS: KitDef[] = [KIT_1204, KIT_AIRCRAFT]

// Sanity check — surfaces a console warning if the counted inventory drifts
// from the headline piece total printed on the box.
if (typeof window !== 'undefined') {
  for (const kit of [KIT_1204, KIT_AIRCRAFT]) {
    const sum = kit.inventory.reduce((acc, it) => acc + it.count, 0)
    if (sum !== kit.pieces) {
      // eslint-disable-next-line no-console
      console.warn(`[parts] ${kit.id}: inventory sums to ${sum}, label says ${kit.pieces}`)
    }
  }
}
