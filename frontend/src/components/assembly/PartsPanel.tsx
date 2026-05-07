import { useState } from 'react'
import { Search } from 'lucide-react'
import PartSvg, { getPartBounds } from './PartSvg'
import { type KitDef, PARTS, type PartSku } from '../../data/parts'

interface Props {
  kit: KitDef
  pendingSku: PartSku | null
  onPick: (sku: PartSku) => void
  used: Record<string, number>
}

function PartTile({
  sku,
  count,
  remaining,
  active,
  onClick,
}: {
  sku: PartSku
  count: number
  remaining: number
  active: boolean
  onClick: () => void
}) {
  const spec = PARTS[sku]
  const { width, height } = getPartBounds(sku)
  const tileW = 100
  const tileH = 80
  const padding = 6
  const scale = Math.min(
    (tileW - padding * 2) / width,
    (tileH - padding * 2 - 14) / height,
    1.4,
  )
  const exhausted = remaining <= 0
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={exhausted}
      title={`${spec.label || spec.sku} (${remaining}/${count} left)`}
      className={`relative flex flex-col items-center justify-between rounded-lg border transition-all duration-150 select-none ${
        active
          ? 'border-accent bg-accent/10 shadow-lg shadow-accent/30'
          : exhausted
            ? 'border-border/40 bg-bg-primary/40 opacity-40 cursor-not-allowed'
            : 'border-border bg-bg-primary hover:border-accent/60 hover:bg-bg-tertiary'
      }`}
      style={{ width: tileW, height: tileH }}
    >
      <div className="flex-1 flex items-center justify-center w-full">
        <svg
          width={width * scale}
          height={height * scale}
          viewBox={`0 0 ${width} ${height}`}
          style={{ overflow: 'visible' }}
        >
          <PartSvg sku={sku} />
        </svg>
      </div>
      <div className="flex items-center justify-between w-full px-2 pb-1.5 text-[10px] font-mono">
        <span className="text-text-secondary tracking-wider">{spec.label || spec.sku}</span>
        <span
          className={`tabular-nums font-semibold ${
            exhausted ? 'text-status-cancelled' : remaining < count ? 'text-accent' : 'text-text-muted'
          }`}
        >
          ×{remaining}
        </span>
      </div>
    </button>
  )
}

export default function PartsPanel({ kit, pendingSku, onPick, used }: Props) {
  const [query, setQuery] = useState('')

  const filtered = kit.inventory.filter(({ sku }) => {
    const spec = PARTS[sku]
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      (spec.label || spec.sku).toLowerCase().includes(q) ||
      spec.category.toLowerCase().includes(q)
    )
  })

  // Group by category for nicer layout
  const order: Record<string, number> = {
    tool: 0,
    beam: 1,
    plate: 2,
    bracket: 3,
    bolt: 4,
    nut: 5,
    washer: 6,
    axle: 7,
    gear: 8,
    wheel: 9,
    tire: 9,
    bearing: 10,
    hub: 11,
    spacer: 12,
    pad: 13,
  }
  const groups = new Map<string, { sku: PartSku; count: number }[]>()
  for (const item of filtered) {
    const cat = PARTS[item.sku].category
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(item)
  }
  const sortedGroups = [...groups.entries()].sort(
    (a, b) => (order[a[0]] ?? 99) - (order[b[0]] ?? 99),
  )

  const totalRemaining = kit.inventory.reduce(
    (sum, it) => sum + (it.count - (used[it.sku] || 0)),
    0,
  )

  return (
    <div className="flex flex-col h-full bg-bg-secondary border-r border-border">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="text-[10px] font-mono tracking-widest text-accent">PARTS BIN</div>
        <div className="mt-0.5 text-sm font-bold text-text-primary leading-tight">
          {kit.title}
        </div>
        <div className="mt-1 text-[11px] text-text-muted">
          {kit.pieces} pieces · {kit.models.join(' / ')}
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="font-mono text-text-secondary">
            <span className="text-status-ontime tabular-nums">{totalRemaining}</span>
            <span className="text-text-muted"> / {kit.pieces} available</span>
          </span>
        </div>
      </div>

      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parts (e.g. L060, beam, gear)"
            className="w-full bg-bg-primary border border-border rounded-md pl-8 pr-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-3">
        {sortedGroups.map(([cat, items]) => (
          <div key={cat}>
            <div className="text-[9px] font-mono tracking-widest text-text-muted uppercase mb-1.5 px-1">
              {cat}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {items.map((item) => {
                const remaining = item.count - (used[item.sku] || 0)
                return (
                  <PartTile
                    key={item.sku}
                    sku={item.sku}
                    count={item.count}
                    remaining={remaining}
                    active={pendingSku === item.sku}
                    onClick={() => onPick(item.sku)}
                  />
                )
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-text-muted text-xs">
            No parts match "{query}"
          </div>
        )}
      </div>
    </div>
  )
}
