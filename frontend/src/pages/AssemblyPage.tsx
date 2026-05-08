import { useEffect, useMemo, useState } from 'react'
import {
  RotateCw,
  RotateCcw,
  Trash2,
  Copy,
  Save,
  FolderOpen,
  Eraser,
  Wrench,
  Boxes,
  Keyboard,
} from 'lucide-react'
import PartsPanel from '../components/assembly/PartsPanel'
import Workshop, { type PlacedPart, type Joint } from '../components/assembly/Workshop'
import { KITS, type KitDef, type PartSku, PARTS } from '../data/parts'

const AUTO_BOLT_SKU: PartSku = 'L060'
const AUTO_NUT_SKU: PartSku = 'L800'

type SaveBlob = {
  kitId: string
  parts: PlacedPart[]
}

const STORAGE_KEY = 'flightdeck-assembly-v1'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function AssemblyPage() {
  const [kit, setKit] = useState<KitDef>(KITS[0])
  const [parts, setParts] = useState<PlacedPart[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pendingSku, setPendingSku] = useState<PartSku | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [joints, setJoints] = useState<Joint[]>([])

  const used = useMemo(() => {
    const m: Record<string, number> = {}
    for (const p of parts) m[p.sku] = (m[p.sku] || 0) + 1
    // each joint auto-consumes one bolt + one nut from the inventory
    if (joints.length) {
      m[AUTO_BOLT_SKU] = (m[AUTO_BOLT_SKU] || 0) + joints.length
      m[AUTO_NUT_SKU] = (m[AUTO_NUT_SKU] || 0) + joints.length
    }
    return m
  }, [parts, joints])

  const remaining = useMemo(() => {
    const m: Record<string, number> = {}
    for (const item of kit.inventory) {
      m[item.sku] = item.count - (used[item.sku] || 0)
    }
    return m
  }, [kit, used])

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 1800)
  }

  function pickSku(sku: PartSku) {
    if ((remaining[sku] || 0) <= 0) {
      flash(`Out of ${PARTS[sku].label || sku} — disassemble one to reuse`)
      return
    }
    setPendingSku(sku === pendingSku ? null : sku)
  }

  function addPart(sku: PartSku, x: number, y: number) {
    if ((remaining[sku] || 0) <= 0) {
      flash(`Out of ${PARTS[sku].label || sku}`)
      return
    }
    const id = makeId()
    setParts((prev) => [...prev, { id, sku, x, y, rotation: 0 }])
    setSelectedId(id)
  }

  function updatePart(id: string, patch: Partial<PlacedPart>) {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function removePart(id: string) {
    setParts((prev) => prev.filter((p) => p.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function duplicateSelected() {
    if (!selectedId) return
    const p = parts.find((x) => x.id === selectedId)
    if (!p) return
    if ((remaining[p.sku] || 0) <= 0) {
      flash(`Out of ${PARTS[p.sku].label || p.sku}`)
      return
    }
    const id = makeId()
    setParts((prev) => [...prev, { ...p, id, x: p.x + 30, y: p.y + 30 }])
    setSelectedId(id)
  }

  function rotateSelected(delta: number) {
    if (!selectedId) return
    const p = parts.find((x) => x.id === selectedId)
    if (!p) return
    updatePart(selectedId, { rotation: (p.rotation + delta + 360) % 360 })
  }

  function clearAll() {
    if (parts.length === 0) return
    if (!confirm(`Disassemble all ${parts.length} parts?`)) return
    setParts([])
    setSelectedId(null)
    flash('Workshop cleared')
  }

  function save() {
    const blob: SaveBlob = { kitId: kit.id, parts }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob))
    flash(`Saved ${parts.length} part${parts.length === 1 ? '' : 's'}`)
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      flash('Nothing saved yet')
      return
    }
    try {
      const blob = JSON.parse(raw) as SaveBlob
      const targetKit = KITS.find((k) => k.id === blob.kitId) || KITS[0]
      setKit(targetKit)
      setParts(blob.parts)
      setSelectedId(null)
      flash(`Loaded ${blob.parts.length} parts`)
    } catch {
      flash('Save file corrupt')
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // ignore when typing in inputs
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        save()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        duplicateSelected()
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        setShowHelp((s) => !s)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts, kit, selectedId])

  const selected = selectedId ? parts.find((p) => p.id === selectedId) : null

  return (
    <div className="fixed inset-0 top-14 flex bg-bg-primary text-text-primary">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0">
        <PartsPanel kit={kit} pendingSku={pendingSku} onPick={pickSku} used={used} />
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-4 h-12 bg-bg-secondary border-b border-border">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold tracking-widest text-text-primary">WORKSHOP</span>
            <span className="text-[10px] font-mono text-text-muted ml-2">
              {parts.length} part{parts.length === 1 ? '' : 's'} · {joints.length} joint{joints.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={kit.id}
              onChange={(e) => {
                const next = KITS.find((k) => k.id === e.target.value)
                if (!next) return
                if (parts.length > 0 && !confirm('Switching kits will clear the workshop. Continue?')) return
                setKit(next)
                setParts([])
                setSelectedId(null)
                setPendingSku(null)
              }}
              className="bg-bg-primary border border-border rounded-md px-2 py-1 text-xs text-text-primary font-mono focus:outline-none focus:border-accent"
            >
              {KITS.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.title}
                </option>
              ))}
            </select>

            <div className="w-px h-6 bg-border mx-1" />

            <ToolbarButton
              onClick={() => rotateSelected(-15)}
              disabled={!selected}
              title="Rotate -15° (Shift+R)"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            />
            <ToolbarButton
              onClick={() => rotateSelected(15)}
              disabled={!selected}
              title="Rotate +15° (R)"
              icon={<RotateCw className="w-3.5 h-3.5" />}
            />
            <ToolbarButton
              onClick={duplicateSelected}
              disabled={!selected}
              title="Duplicate (Cmd/Ctrl+D)"
              icon={<Copy className="w-3.5 h-3.5" />}
            />
            <ToolbarButton
              onClick={() => selectedId && removePart(selectedId)}
              disabled={!selected}
              title="Disassemble selected (Delete)"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              danger
            />

            <div className="w-px h-6 bg-border mx-1" />

            <ToolbarButton onClick={save} title="Save (Cmd/Ctrl+S)" icon={<Save className="w-3.5 h-3.5" />} />
            <ToolbarButton onClick={load} title="Load saved" icon={<FolderOpen className="w-3.5 h-3.5" />} />
            <ToolbarButton
              onClick={clearAll}
              title="Disassemble all"
              icon={<Eraser className="w-3.5 h-3.5" />}
              danger
            />
            <ToolbarButton
              onClick={() => setShowHelp((s) => !s)}
              title="Keyboard shortcuts (?)"
              icon={<Keyboard className="w-3.5 h-3.5" />}
            />
          </div>
        </div>

        {/* Models hint strip */}
        <div className="flex items-center gap-2 px-4 py-2 bg-bg-secondary/40 border-b border-border text-[11px]">
          <Boxes className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-text-muted font-mono tracking-wider">MODELS:</span>
          {kit.models.map((m) => (
            <span
              key={m}
              className="px-2 py-0.5 rounded-full bg-bg-tertiary border border-border text-text-secondary"
            >
              {m}
            </span>
          ))}
          <span className="ml-auto text-text-muted">
            {pendingSku
              ? `Click in the workshop to place ${PARTS[pendingSku].label || pendingSku}`
              : selected
                ? `Selected: ${PARTS[selected.sku].label || selected.sku}`
                : 'Pick a part from the bin →'}
          </span>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-bg-primary overflow-hidden">
          <Workshop
            parts={parts}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdate={updatePart}
            onAdd={addPart}
            onRemove={removePart}
            pendingSku={pendingSku}
            onClearPending={() => setPendingSku(null)}
            onJointsChange={setJoints}
          />

          {parts.length === 0 && !pendingSku && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center max-w-md px-6">
                <Wrench className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-60" />
                <h2 className="text-lg font-bold text-text-primary mb-1">
                  Empty workshop
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Pick a part from the bin on the left and click anywhere on the grid to place it.
                  Drag parts so their holes line up — bolts <span className="text-accent">tighten automatically</span>.
                  Drag them apart to loosen.
                </p>
                <p className="mt-2 text-xs text-text-muted">
                  <kbd className="kbd">R</kbd> rotate · <kbd className="kbd">[</kbd>/<kbd className="kbd">]</kbd> 90° · <kbd className="kbd">Del</kbd> remove
                </p>
              </div>
            </div>
          )}

          {showHelp && (
            <div
              className="absolute top-3 right-3 w-72 bg-bg-secondary border border-border rounded-lg shadow-2xl p-4 text-xs animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-text-primary tracking-wide">Shortcuts</span>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-text-muted hover:text-text-primary"
                  aria-label="close"
                >
                  ×
                </button>
              </div>
              <ul className="space-y-1.5 text-text-secondary">
                <li><kbd className="kbd">Click</kbd> a part in the bin, then click the grid to place it</li>
                <li><kbd className="kbd">Drag</kbd> any part — bolted assemblies travel together</li>
                <li><kbd className="kbd">Alt</kbd>+<kbd className="kbd">Drag</kbd> to separate one part out of an assembly</li>
                <li>Holes <span className="text-accent">snap together magnetically</span> — bolts auto-tighten</li>
                <li>Drag parts apart to loosen (returns bolts to the bin)</li>
                <li><kbd className="kbd">R</kbd> / <kbd className="kbd">Shift+R</kbd> rotate ±15°</li>
                <li><kbd className="kbd">[</kbd> / <kbd className="kbd">]</kbd> rotate 90°</li>
                <li><kbd className="kbd">Cmd/Ctrl+D</kbd> duplicate selected</li>
                <li><kbd className="kbd">Delete</kbd> disassemble selected</li>
                <li><kbd className="kbd">Cmd/Ctrl+S</kbd> save build</li>
                <li><kbd className="kbd">Esc</kbd> cancel placement / deselect</li>
              </ul>
            </div>
          )}

          {toast && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-bg-secondary border border-border px-4 py-2 rounded-lg shadow-xl text-sm text-text-primary animate-fade-in">
              {toast}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function ToolbarButton({
  onClick,
  disabled,
  title,
  icon,
  danger,
}: {
  onClick: () => void
  disabled?: boolean
  title: string
  icon: React.ReactNode
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
        disabled
          ? 'text-text-muted/40 cursor-not-allowed'
          : danger
            ? 'text-text-secondary hover:bg-status-cancelled/20 hover:text-status-cancelled'
            : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
      }`}
    >
      {icon}
    </button>
  )
}
