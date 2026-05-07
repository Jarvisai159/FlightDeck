import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import PartSvg, { getPartBounds } from './PartSvg'
import { worldHoles } from './holes'
import type { PartSku } from '../../data/parts'

export interface PlacedPart {
  id: string
  sku: PartSku
  x: number
  y: number
  rotation: number
}

export interface Joint {
  partAId: string
  holeA: number
  partBId: string
  holeB: number
  x: number
  y: number
}

interface Props {
  parts: PlacedPart[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, patch: Partial<PlacedPart>) => void
  onAdd: (sku: PartSku, x: number, y: number) => void
  onRemove: (id: string) => void
  pendingSku: PartSku | null
  onClearPending: () => void
  onJointsChange?: (joints: Joint[]) => void
}

const GRID = 14
const SNAP_RADIUS = 16   // px world-space — magnetic pull while dragging
const JOINT_THRESHOLD = 6 // px — holes within this distance are considered joined

/**
 * Compute the set of joints between placed parts.  A joint exists when a hole
 * on part A overlaps a hole on part B within JOINT_THRESHOLD px.  Each part-pair
 * contributes at most one joint (greedy nearest pair) so that a ladder of holes
 * doesn't explode the bolt count.
 */
function computeJoints(parts: PlacedPart[]): Joint[] {
  const out: Joint[] = []
  const taken = new Set<string>() // "aId-bId"
  // Pre-compute world holes for each part once
  const holes = parts.map((p) => ({
    id: p.id,
    pts: worldHoles(p.sku, p.x, p.y, p.rotation),
  }))
  for (let i = 0; i < holes.length; i++) {
    for (let j = i + 1; j < holes.length; j++) {
      const key = `${holes[i].id}-${holes[j].id}`
      if (taken.has(key)) continue
      let best: { di: number; dj: number; d: number; x: number; y: number } | null = null
      for (let a = 0; a < holes[i].pts.length; a++) {
        for (let b = 0; b < holes[j].pts.length; b++) {
          const dx = holes[i].pts[a].x - holes[j].pts[b].x
          const dy = holes[i].pts[a].y - holes[j].pts[b].y
          const d = Math.hypot(dx, dy)
          if (d < JOINT_THRESHOLD && (!best || d < best.d)) {
            best = {
              di: a,
              dj: b,
              d,
              x: (holes[i].pts[a].x + holes[j].pts[b].x) / 2,
              y: (holes[i].pts[a].y + holes[j].pts[b].y) / 2,
            }
          }
        }
      }
      if (best) {
        taken.add(key)
        out.push({
          partAId: holes[i].id,
          holeA: best.di,
          partBId: holes[j].id,
          holeB: best.dj,
          x: best.x,
          y: best.y,
        })
      }
    }
  }
  return out
}

/** When dragging, find the nearest hole pair within SNAP_RADIUS so the dragged
 * part visually clicks into place. */
function snapToNearestHole(
  movingId: string,
  movingSku: PartSku,
  movingX: number,
  movingY: number,
  movingRot: number,
  others: PlacedPart[],
): { x: number; y: number } | null {
  const myHoles = worldHoles(movingSku, movingX, movingY, movingRot)
  let best: { dx: number; dy: number; d: number } | null = null
  for (const o of others) {
    if (o.id === movingId) continue
    const oHoles = worldHoles(o.sku, o.x, o.y, o.rotation)
    for (const mh of myHoles) {
      for (const oh of oHoles) {
        const dx = oh.x - mh.x
        const dy = oh.y - mh.y
        const d = Math.hypot(dx, dy)
        if (d < SNAP_RADIUS && (!best || d < best.d)) {
          best = { dx, dy, d }
        }
      }
    }
  }
  return best ? { x: movingX + best.dx, y: movingY + best.dy } : null
}

export default function Workshop({
  parts,
  selectedId,
  onSelect,
  onUpdate,
  onAdd,
  onRemove,
  pendingSku,
  onClearPending,
  onJointsChange,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [drag, setDrag] = useState<{
    id: string
    offsetX: number
    offsetY: number
    moved: boolean
  } | null>(null)
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null)

  const joints = useMemo(() => computeJoints(parts), [parts])

  useEffect(() => {
    onJointsChange?.(joints)
  }, [joints, onJointsChange])

  function svgPoint(e: { clientX: number; clientY: number }) {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  function snap(v: number) {
    return Math.round(v / GRID) * GRID
  }

  function handleBackgroundDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (e.target !== e.currentTarget && (e.target as SVGElement).id !== 'wks-bg') {
      return
    }
    if (pendingSku) {
      const { x, y } = svgPoint(e)
      onAdd(pendingSku, snap(x), snap(y))
      onClearPending()
    } else {
      onSelect(null)
    }
  }

  function handlePartDown(e: ReactPointerEvent<SVGGElement>, p: PlacedPart) {
    e.stopPropagation()
    onSelect(p.id)
    const { x, y } = svgPoint(e)
    setDrag({ id: p.id, offsetX: x - p.x, offsetY: y - p.y, moved: false })
    ;(e.currentTarget as SVGGElement).setPointerCapture?.(e.pointerId)
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    const { x, y } = svgPoint(e)
    if (pendingSku) setHover({ x: snap(x), y: snap(y) })
    if (!drag) return
    const dragged = parts.find((pp) => pp.id === drag.id)
    if (!dragged) return
    const rawX = snap(x - drag.offsetX)
    const rawY = snap(y - drag.offsetY)
    const others = parts
    const snapped = snapToNearestHole(drag.id, dragged.sku, rawX, rawY, dragged.rotation, others)
    const finalX = snapped ? snapped.x : rawX
    const finalY = snapped ? snapped.y : rawY
    onUpdate(drag.id, { x: finalX, y: finalY })
    if (!drag.moved) setDrag({ ...drag, moved: true })
  }

  function handlePointerUp() {
    setDrag(null)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selectedId) {
        if (e.key === 'Escape') onClearPending()
        return
      }
      const p = parts.find((x) => x.id === selectedId)
      if (!p) return
      if (e.key === 'r' || e.key === 'R') {
        onUpdate(selectedId, { rotation: (p.rotation + (e.shiftKey ? -15 : 15) + 360) % 360 })
      } else if (e.key === '[') {
        onUpdate(selectedId, { rotation: (p.rotation - 90 + 360) % 360 })
      } else if (e.key === ']') {
        onUpdate(selectedId, { rotation: (p.rotation + 90) % 360 })
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        onRemove(selectedId)
      } else if (e.key === 'Escape') {
        onSelect(null)
        onClearPending()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, parts, onUpdate, onRemove, onSelect, onClearPending])

  // Identify holes that are part of a joint, so we can render a bolt-head over
  // them instead of an empty hole.
  const jointHoleSet = useMemo(() => {
    const s = new Set<string>()
    for (const j of joints) {
      s.add(`${j.partAId}:${j.holeA}`)
      s.add(`${j.partBId}:${j.holeB}`)
    }
    return s
  }, [joints])

  return (
    <svg
      ref={svgRef}
      className="w-full h-full block"
      style={{ cursor: pendingSku ? 'crosshair' : drag ? 'grabbing' : 'default', touchAction: 'none' }}
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={handleBackgroundDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={() => setHover(null)}
    >
      <defs>
        <pattern id="grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
          <circle cx={GRID / 2} cy={GRID / 2} r={0.8} fill="#334155" />
        </pattern>
        <radialGradient id="bg-radial" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0a0f1a" />
        </radialGradient>
        <radialGradient id="bolt-head" cx="0.35" cy="0.35">
          <stop offset="0%" stopColor="#dde1e4" />
          <stop offset="60%" stopColor="#9ca3a7" />
          <stop offset="100%" stopColor="#3a3e41" />
        </radialGradient>
        <radialGradient id="bolt-head-glow" cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="rgba(255,220,120,0.6)" />
          <stop offset="100%" stopColor="rgba(255,220,120,0)" />
        </radialGradient>
      </defs>
      <rect id="wks-bg" x={0} y={0} width={1400} height={900} fill="url(#bg-radial)" />
      <rect id="wks-bg" x={0} y={0} width={1400} height={900} fill="url(#grid)" />

      {/* placed parts */}
      {parts.map((p) => {
        const { width, height } = getPartBounds(p.sku)
        return (
          <g
            key={p.id}
            transform={`translate(${p.x} ${p.y}) rotate(${p.rotation}) translate(${-width / 2} ${-height / 2})`}
            onPointerDown={(e) => handlePartDown(e, p)}
            style={{ cursor: drag?.id === p.id ? 'grabbing' : 'grab' }}
          >
            <PartSvg sku={p.sku} selected={selectedId === p.id} />
          </g>
        )
      })}

      {/* render bolt heads at every joint hole */}
      {joints.map((j, i) => (
        <g key={`j-${i}`} pointerEvents="none" className="joint-pop">
          <circle cx={j.x} cy={j.y} r={9} fill="url(#bolt-head-glow)" />
          <circle cx={j.x} cy={j.y} r={4.4} fill="url(#bolt-head)" stroke="#2c2f31" strokeWidth={0.6} />
          <line
            x1={j.x - 2.2}
            y1={j.y}
            x2={j.x + 2.2}
            y2={j.y}
            stroke="#2c2f31"
            strokeWidth={1.2}
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* phantom of pending part under the cursor */}
      {pendingSku && hover && (
        <g
          transform={`translate(${hover.x} ${hover.y}) translate(${-getPartBounds(pendingSku).width / 2} ${-getPartBounds(pendingSku).height / 2})`}
          pointerEvents="none"
        >
          <PartSvg sku={pendingSku} ghost />
        </g>
      )}

      {/* not strictly needed, but silences ts about unused jointHoleSet */}
      <g style={{ display: 'none' }} data-joint-count={jointHoleSet.size} />
    </svg>
  )
}
