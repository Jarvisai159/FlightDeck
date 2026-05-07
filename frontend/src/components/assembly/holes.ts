import { type PartSku, PARTS, type PartSpec } from '../../data/parts'

/**
 * Local-space hole positions for a part.  These MUST match the holes drawn by
 * the SVG renderer in PartSvg.tsx — they are what the magnetic-snap and
 * auto-bolt logic uses to decide when two parts can be joined.
 */
function localHoles(spec: PartSpec): { x: number; y: number }[] {
  const w = spec.width
  const h = spec.height
  switch (spec.category) {
    case 'beam': {
      const n = (spec.variant as number) || 5
      const padX = h
      const spacing = (w - padX * 2) / Math.max(n - 1, 1)
      return Array.from({ length: n }, (_, i) => ({ x: padX + i * spacing, y: h / 2 }))
    }
    case 'plate': {
      if (spec.variant === 'u-small' || spec.variant === 'u-mid') {
        const flange = h * 0.35
        const xs = [0.25 * w, 0.55 * w, 0.85 * w]
        return [
          ...xs.map((x) => ({ x, y: flange / 2 })),
          ...xs.map((x) => ({ x, y: h - flange / 2 })),
        ]
      }
      if (spec.variant === 'wing' || spec.variant === 'wing-long') {
        return [0.25, 0.5, 0.75].map((p) => ({ x: p * w, y: h * 0.5 }))
      }
      if (spec.variant === 'tab') {
        return [
          { x: w * 0.3, y: h * 0.35 },
          { x: w * 0.7, y: h * 0.55 },
        ]
      }
      if (spec.variant === 'wedge') {
        return [
          { x: w * 0.2, y: h * 0.2 },
          { x: w * 0.55, y: h * 0.2 },
          { x: w * 0.2, y: h * 0.55 },
        ]
      }
      if (spec.variant === 'h-trim') {
        const tabR = h / 2 - 0.5
        const out = [
          { x: tabR, y: h / 2 },
          { x: w - tabR, y: h / 2 },
        ]
        if (w > 50) out.push({ x: w / 2, y: h / 2 })
        return out
      }
      // grid
      const cols = spec.cols || 3
      const rows = spec.rows || 3
      const padX = w / (cols + 1)
      const padY = h / (rows + 1)
      const out: { x: number; y: number }[] = []
      for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++)
          out.push({ x: padX * (c + 1), y: padY * (r + 1) })
      return out
    }
    case 'bracket': {
      const t = Math.min(w, h) * 0.45
      if (spec.variant === 'L-tall') {
        return [
          { x: t / 2, y: t / 2 },
          { x: t / 2, y: h - t / 2 },
        ]
      }
      return [
        { x: t / 2, y: t / 2 },
        { x: w - t / 2, y: t / 2 },
        { x: t / 2, y: h - t / 2 },
      ]
    }
    case 'pad':
      return [{ x: w / 2, y: h / 2 }]
    case 'tire':
    case 'gear':
    case 'hub':
    case 'spacer':
    case 'bearing':
    case 'washer':
      return [{ x: w / 2, y: h / 2 }]
    default:
      return []
  }
}

const cache = new Map<PartSku, { x: number; y: number }[]>()
export function partHoles(sku: PartSku): { x: number; y: number }[] {
  const cached = cache.get(sku)
  if (cached) return cached
  const out = localHoles(PARTS[sku])
  cache.set(sku, out)
  return out
}

/**
 * Holes in world coordinates for a placed part (which is rendered with its
 * center at (x, y) and rotated by `rotation` degrees).
 */
export function worldHoles(
  sku: PartSku,
  cx: number,
  cy: number,
  rotation: number,
): { x: number; y: number }[] {
  const spec = PARTS[sku]
  const hs = partHoles(sku)
  const cosA = Math.cos((rotation * Math.PI) / 180)
  const sinA = Math.sin((rotation * Math.PI) / 180)
  return hs.map((h) => {
    const lx = h.x - spec.width / 2
    const ly = h.y - spec.height / 2
    return {
      x: cx + lx * cosA - ly * sinA,
      y: cy + lx * sinA + ly * cosA,
    }
  })
}
