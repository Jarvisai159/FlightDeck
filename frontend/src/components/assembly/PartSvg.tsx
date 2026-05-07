import { type PartSku, type PartSpec, PARTS } from '../../data/parts'

const COL = {
  green: '#4d7a44',
  greenHi: '#7aa86f',
  greenDark: '#2a4523',
  silver: '#aab1b5',
  silverHi: '#dde1e4',
  silverDark: '#5d6266',
  black: '#1a1d20',
  blackHi: '#3a3e41',
  blue: '#3aa4d6',
  blueHi: '#7ed1ee',
  blueDark: '#1d6e95',
  red: '#cf2630',
  redHi: '#ec5660',
  redDark: '#7a151a',
  hole: '#0a0d0f',
}

interface Props {
  sku: PartSku
  selected?: boolean
  ghost?: boolean
}

function colorTriple(c: PartSpec['color']) {
  switch (c) {
    case 'green': return [COL.greenHi, COL.green, COL.greenDark]
    case 'silver': return [COL.silverHi, COL.silver, COL.silverDark]
    case 'black': return [COL.blackHi, COL.black, '#000']
    case 'blue': return [COL.blueHi, COL.blue, COL.blueDark]
    case 'red': return [COL.redHi, COL.red, COL.redDark]
  }
}

function Hole({ x, y, r = 3.2 }: { x: number; y: number; r?: number }) {
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r={r + 0.5} fill="#1c2125" />
      <circle cx={x} cy={y} r={r} fill={COL.hole} />
    </g>
  )
}

// ---- BEAMS (flat strip with holes) ---------------------------------------
function Beam({ spec }: { spec: PartSpec }) {
  const holes = (spec.variant as number) || 5
  const [hi, mid, dark] = colorTriple(spec.color)
  const w = spec.width
  const h = spec.height
  const padX = h
  const spacing = (w - padX * 2) / Math.max(holes - 1, 1)
  const id = `beam-${spec.sku}-${spec.color}`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hi} />
          <stop offset="55%" stopColor={mid} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={w} height={h} rx={h / 2} fill={`url(#${id})`} stroke={dark} strokeWidth={0.6} />
      <rect x={1} y={1.2} width={w - 2} height={1.4} rx={0.7} fill="white" opacity={0.18} />
      {Array.from({ length: holes }).map((_, i) => (
        <Hole key={i} x={padX + i * spacing} y={h / 2} r={3.4} />
      ))}
    </g>
  )
}

// ---- PLATES --------------------------------------------------------------
function GridPlate({ spec }: { spec: PartSpec }) {
  const cols = spec.cols || 3
  const rows = spec.rows || 3
  const [hi, , dark] = colorTriple(spec.color)
  const w = spec.width
  const h = spec.height
  const padX = w / (cols + 1)
  const padY = h / (rows + 1)
  const id = `plate-${spec.sku}-${spec.color}`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hi} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={w} height={h} rx={3} fill={`url(#${id})`} stroke={dark} strokeWidth={0.7} />
      <rect x={1.5} y={1.5} width={w - 3} height={h - 3} rx={2} fill="none" stroke={hi} strokeOpacity={0.25} />
      {Array.from({ length: cols }).map((_, c) =>
        Array.from({ length: rows }).map((_, r) => (
          <Hole key={`${c}-${r}`} x={padX * (c + 1)} y={padY * (r + 1)} r={3} />
        ))
      )}
    </g>
  )
}

function UChannel({ spec }: { spec: PartSpec }) {
  const [hi, , dark] = colorTriple(spec.color)
  const w = spec.width
  const h = spec.height
  const flange = h * 0.35
  const id = `u-${spec.sku}`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hi} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <path
        d={`M0 0 L${w} 0 L${w} ${flange} L${w - 6} ${flange} L${w - 6} ${h - flange} L${w} ${h - flange} L${w} ${h} L0 ${h} L0 ${h - flange} L6 ${h - flange} L6 ${flange} L0 ${flange} Z`}
        fill={`url(#${id})`}
        stroke={dark}
        strokeWidth={0.6}
      />
      {[0.25, 0.55, 0.85].map((p) => (
        <Hole key={p} x={p * w} y={flange / 2} r={2.6} />
      ))}
      {[0.25, 0.55, 0.85].map((p) => (
        <Hole key={`b${p}`} x={p * w} y={h - flange / 2} r={2.6} />
      ))}
    </g>
  )
}

function WingPlate({ spec }: { spec: PartSpec }) {
  const [hi, , dark] = colorTriple(spec.color)
  const w = spec.width
  const h = spec.height
  const id = `wing-${spec.sku}`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hi} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <path
        d={`M${h * 0.4} 0 L${w - h * 0.4} 0 L${w} ${h} L0 ${h} Z`}
        fill={`url(#${id})`}
        stroke={dark}
        strokeWidth={0.6}
      />
      {[0.25, 0.5, 0.75].map((p) => (
        <Hole key={p} x={p * w} y={h * 0.5} r={2.8} />
      ))}
    </g>
  )
}

function TabPlate({ spec }: { spec: PartSpec }) {
  const [hi, , dark] = colorTriple(spec.color)
  const w = spec.width
  const h = spec.height
  const id = `tab-${spec.sku}`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hi} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <path
        d={`M0 0 L${w} 0 L${w} ${h * 0.5} L${w * 0.7} ${h} L0 ${h} Z`}
        fill={`url(#${id})`}
        stroke={dark}
        strokeWidth={0.6}
      />
      <Hole x={w * 0.3} y={h * 0.35} r={2.6} />
      <Hole x={w * 0.7} y={h * 0.55} r={2.6} />
    </g>
  )
}

function HTrim({ spec }: { spec: PartSpec }) {
  // "Dog-bone" silver trim: round end-tabs joined by a thinner waist bar.
  // Mirrors the H310 / H607 look from the kit photos.
  const [hi, , dark] = colorTriple(spec.color)
  const w = spec.width
  const h = spec.height
  const tabR = h / 2 - 0.5
  const waistY1 = h * 0.32
  const waistY2 = h * 0.68
  const id = `htrim-${spec.sku}`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hi} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <circle cx={tabR} cy={h / 2} r={tabR} fill={`url(#${id})`} stroke={dark} strokeWidth={0.6} />
      <circle cx={w - tabR} cy={h / 2} r={tabR} fill={`url(#${id})`} stroke={dark} strokeWidth={0.6} />
      <rect x={tabR} y={waistY1} width={w - tabR * 2} height={waistY2 - waistY1} fill={`url(#${id})`} stroke={dark} strokeWidth={0.5} />
      <Hole x={tabR} y={h / 2} r={2.6} />
      <Hole x={w - tabR} y={h / 2} r={2.6} />
      {w > 50 && <Hole x={w / 2} y={h / 2} r={2.2} />}
    </g>
  )
}

function WedgePlate({ spec }: { spec: PartSpec }) {
  const [hi, , dark] = colorTriple(spec.color)
  const w = spec.width
  const h = spec.height
  const id = `wedge-${spec.sku}`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hi} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <path d={`M0 0 L${w} 0 L0 ${h} Z`} fill={`url(#${id})`} stroke={dark} strokeWidth={0.6} />
      <Hole x={w * 0.2} y={h * 0.2} r={2.5} />
      <Hole x={w * 0.55} y={h * 0.2} r={2.5} />
      <Hole x={w * 0.2} y={h * 0.55} r={2.5} />
    </g>
  )
}

// ---- BRACKETS ------------------------------------------------------------
function Bracket({ spec }: { spec: PartSpec }) {
  const [hi, , dark] = colorTriple(spec.color)
  const w = spec.width
  const h = spec.height
  const t = Math.min(w, h) * 0.45
  const id = `brk-${spec.sku}-${spec.color}`
  const variant = spec.variant as string
  let path = ''
  if (variant === 'L-tall') {
    path = `M0 0 L${t} 0 L${t} ${h - t} L${w} ${h - t} L${w} ${h} L0 ${h} Z`
  } else {
    // generic L bracket
    path = `M0 0 L${w} 0 L${w} ${t} L${t} ${t} L${t} ${h} L0 ${h} Z`
  }
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={hi} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <path d={path} fill={`url(#${id})`} stroke={dark} strokeWidth={0.6} />
      <Hole x={t / 2} y={t / 2} r={2.4} />
      {variant !== 'L-tall' && <Hole x={w - t / 2} y={t / 2} r={2.4} />}
      <Hole x={t / 2} y={h - t / 2} r={2.4} />
    </g>
  )
}

// ---- BOLT / NUT / WASHER -------------------------------------------------
function Bolt({ spec }: { spec: PartSpec }) {
  const w = spec.width
  const h = spec.height
  const headR = 6
  const id = `bolt-${spec.sku}`
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COL.silverHi} />
          <stop offset="100%" stopColor={COL.silverDark} />
        </linearGradient>
      </defs>
      <circle cx={w / 2} cy={headR} r={headR} fill={`url(#${id})`} stroke={COL.silverDark} />
      <line x1={w / 2 - 3} y1={headR} x2={w / 2 + 3} y2={headR} stroke={COL.silverDark} strokeWidth={1.2} />
      <rect x={w / 2 - 2.2} y={headR + 4} width={4.4} height={h - headR - 4} fill={`url(#${id})`} stroke={COL.silverDark} strokeWidth={0.4} />
      {Array.from({ length: Math.floor((h - headR - 6) / 4) }).map((_, i) => (
        <line
          key={i}
          x1={w / 2 - 2.2}
          y1={headR + 6 + i * 4}
          x2={w / 2 + 2.2}
          y2={headR + 6 + i * 4}
          stroke={COL.silverDark}
          strokeOpacity={0.4}
          strokeWidth={0.5}
        />
      ))}
    </g>
  )
}

function Nut({ spec }: { spec: PartSpec }) {
  const r = spec.width / 2 - 1
  const cx = spec.width / 2
  const cy = spec.height / 2
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`)
  }
  return (
    <g>
      <defs>
        <radialGradient id={`nut-${spec.sku}`} cx="0.35" cy="0.35">
          <stop offset="0%" stopColor={COL.silverHi} />
          <stop offset="100%" stopColor={COL.silverDark} />
        </radialGradient>
      </defs>
      <polygon points={pts.join(' ')} fill={`url(#nut-${spec.sku})`} stroke={COL.silverDark} />
      <circle cx={cx} cy={cy} r={r * 0.4} fill={COL.hole} />
    </g>
  )
}

function Washer({ spec }: { spec: PartSpec }) {
  const cx = spec.width / 2
  const cy = spec.height / 2
  const r = spec.width / 2 - 1
  const isRubber = spec.variant === 'rubber'
  const fill = isRubber ? COL.black : COL.silver
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={isRubber ? '#000' : COL.silverDark} strokeWidth={0.6} />
      <circle cx={cx} cy={cy} r={r * 0.45} fill={COL.hole} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeOpacity={0.18} strokeDasharray="2 3" />
    </g>
  )
}

// ---- AXLE / RODS ---------------------------------------------------------
function Axle({ spec }: { spec: PartSpec }) {
  const w = spec.width
  const h = spec.height
  return (
    <g>
      <defs>
        <linearGradient id={`axle-${spec.sku}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3e41" />
          <stop offset="50%" stopColor={COL.silverHi} />
          <stop offset="100%" stopColor="#2a2c2e" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={w} height={h} rx={h / 2} fill={`url(#axle-${spec.sku})`} stroke="#1c1e20" strokeWidth={0.4} />
      <line x1={4} y1={h / 2} x2={w - 4} y2={h / 2} stroke="#fff" strokeOpacity={0.25} strokeWidth={0.6} />
    </g>
  )
}

// ---- WHEELS / TIRES ------------------------------------------------------
function Tire({ spec }: { spec: PartSpec }) {
  const cx = spec.width / 2
  const cy = spec.height / 2
  const rOut = spec.width / 2 - 1
  const rHub = rOut * 0.42
  return (
    <g>
      <defs>
        <radialGradient id={`tire-${spec.sku}`} cx="0.4" cy="0.4">
          <stop offset="0%" stopColor="#2c3033" />
          <stop offset="100%" stopColor="#0e1012" />
        </radialGradient>
        <radialGradient id={`hub-${spec.sku}`} cx="0.35" cy="0.35">
          <stop offset="0%" stopColor={COL.silverHi} />
          <stop offset="100%" stopColor={COL.silverDark} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={rOut} fill={`url(#tire-${spec.sku})`} stroke="#000" />
      <circle cx={cx} cy={cy} r={rOut * 0.85} fill="none" stroke="#000" strokeOpacity={0.55} />
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2
        const x1 = cx + Math.cos(a) * rOut * 0.85
        const y1 = cy + Math.sin(a) * rOut * 0.85
        const x2 = cx + Math.cos(a) * rOut
        const y2 = cy + Math.sin(a) * rOut
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth={1} />
      })}
      <circle cx={cx} cy={cy} r={rHub} fill={`url(#hub-${spec.sku})`} stroke={COL.silverDark} />
      <circle cx={cx} cy={cy} r={2.6} fill={COL.hole} />
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2
        return <circle key={i} cx={cx + Math.cos(a) * rHub * 0.55} cy={cy + Math.sin(a) * rHub * 0.55} r={1.3} fill={COL.hole} />
      })}
    </g>
  )
}

// ---- GEAR ----------------------------------------------------------------
function Gear({ spec }: { spec: PartSpec }) {
  const cx = spec.width / 2
  const cy = spec.height / 2
  const teeth = 14
  const rOut = spec.width / 2 - 1
  const rIn = rOut * 0.82
  const path: string[] = []
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? rOut : rIn
    const a = (i / (teeth * 2)) * Math.PI * 2
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    path.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  path.push('Z')
  return (
    <g>
      <defs>
        <radialGradient id={`gear-${spec.sku}`} cx="0.35" cy="0.35">
          <stop offset="0%" stopColor="#2b2f33" />
          <stop offset="100%" stopColor="#0a0c0d" />
        </radialGradient>
      </defs>
      <path d={path.join(' ')} fill={`url(#gear-${spec.sku})`} stroke="#000" strokeWidth={0.7} />
      <circle cx={cx} cy={cy} r={rOut * 0.55} fill="#1a1d20" stroke="#000" />
      <circle cx={cx} cy={cy} r={3} fill={COL.hole} />
    </g>
  )
}

// ---- HUB / SPACER / BEARING / PAD ----------------------------------------
function Spacer({ spec }: { spec: PartSpec }) {
  const cx = spec.width / 2
  const cy = spec.height / 2
  const r = Math.min(spec.width, spec.height) / 2 - 1
  const [hi, , dark] = colorTriple(spec.color)
  return (
    <g>
      <defs>
        <radialGradient id={`spacer-${spec.sku}`} cx="0.35" cy="0.35">
          <stop offset="0%" stopColor={hi} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#spacer-${spec.sku})`} stroke={dark} />
      <circle cx={cx} cy={cy} r={r * 0.4} fill={COL.hole} />
    </g>
  )
}

function Bearing({ spec }: { spec: PartSpec }) {
  const cx = spec.width / 2
  const cy = spec.height / 2
  const r = spec.width / 2 - 1
  return (
    <g>
      <defs>
        <radialGradient id={`bearing-${spec.sku}`} cx="0.4" cy="0.4">
          <stop offset="0%" stopColor="#3b3f43" />
          <stop offset="100%" stopColor="#0c0e10" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#bearing-${spec.sku})`} stroke="#000" />
      <circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke="#222" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return <circle key={i} cx={cx + Math.cos(a) * r * 0.78} cy={cy + Math.sin(a) * r * 0.78} r={1.3} fill="#3a3e41" />
      })}
      <circle cx={cx} cy={cy} r={r * 0.35} fill={COL.hole} />
    </g>
  )
}

function Pad({ spec }: { spec: PartSpec }) {
  const [hi, , dark] = colorTriple(spec.color)
  return (
    <g>
      <defs>
        <linearGradient id={`pad-${spec.sku}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={hi} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={spec.width} height={spec.height} rx={3} fill={`url(#pad-${spec.sku})`} stroke={dark} strokeWidth={0.6} />
      <Hole x={spec.width / 2} y={spec.height / 2} r={2.8} />
    </g>
  )
}

// ---- TOOLS ---------------------------------------------------------------
function Tool({ spec }: { spec: PartSpec }) {
  if (spec.variant === 'screwdriver') {
    // BS104 is a red T-handle hex/screw driver in the photos:
    //   ▔▔▔▔▔   <- red plastic crossbar
    //     ┃     <- silver shaft
    const w = spec.width
    const h = spec.height
    const handleW = w * 0.55
    const handleH = h
    const shaftW = 5
    const shaftLen = w * 0.45
    return (
      <g>
        <defs>
          <linearGradient id={`bs104-${spec.sku}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COL.redHi} />
            <stop offset="60%" stopColor={COL.red} />
            <stop offset="100%" stopColor={COL.redDark} />
          </linearGradient>
          <linearGradient id={`bs104-shaft-${spec.sku}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COL.silverHi} />
            <stop offset="100%" stopColor={COL.silverDark} />
          </linearGradient>
        </defs>
        {/* shaft */}
        <rect
          x={handleW}
          y={h / 2 - shaftW / 2}
          width={shaftLen}
          height={shaftW}
          fill={`url(#bs104-shaft-${spec.sku})`}
          stroke={COL.silverDark}
          strokeWidth={0.4}
        />
        {/* hex tip */}
        <polygon
          points={`${handleW + shaftLen - 6},${h / 2 - shaftW / 2 - 1} ${handleW + shaftLen},${h / 2 - shaftW / 2 - 1} ${handleW + shaftLen + 2},${h / 2} ${handleW + shaftLen},${h / 2 + shaftW / 2 + 1} ${handleW + shaftLen - 6},${h / 2 + shaftW / 2 + 1}`}
          fill="#1a1d20"
          stroke="#000"
          strokeWidth={0.5}
        />
        {/* T-shaped red handle */}
        <rect x={0} y={0} width={handleW} height={handleH} rx={4} fill={`url(#bs104-${spec.sku})`} stroke={COL.redDark} strokeWidth={0.7} />
        <rect x={2} y={2} width={handleW - 4} height={1.5} rx={0.7} fill="white" opacity={0.35} />
        <rect x={handleW - 6} y={h * 0.25} width={3} height={h * 0.5} fill={COL.redDark} opacity={0.5} />
      </g>
    )
  }
  if (spec.variant === 'wrench-box') {
    return (
      <g>
        <defs>
          <linearGradient id={`wr-${spec.sku}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COL.redHi} />
            <stop offset="100%" stopColor={COL.redDark} />
          </linearGradient>
        </defs>
        <rect x={4} y={spec.height / 2 - 3} width={spec.width * 0.7} height={6} fill={`url(#wr-${spec.sku})`} stroke={COL.redDark} />
        <circle cx={spec.width - 8} cy={spec.height / 2} r={7} fill={`url(#wr-${spec.sku})`} stroke={COL.redDark} />
        <circle cx={spec.width - 8} cy={spec.height / 2} r={3.5} fill="#0c0e10" />
      </g>
    )
  }
  // wrench-open (silver)
  return (
    <g>
      <defs>
        <linearGradient id={`wo-${spec.sku}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COL.silverHi} />
          <stop offset="100%" stopColor={COL.silverDark} />
        </linearGradient>
      </defs>
      <path
        d={`M0 ${spec.height / 2 - 3} L${spec.width - 14} ${spec.height / 2 - 3} L${spec.width - 14} ${spec.height / 2 + 3} L0 ${spec.height / 2 + 3} Z M${spec.width - 14} 1 L${spec.width - 2} 1 L${spec.width} ${spec.height / 2} L${spec.width - 2} ${spec.height - 1} L${spec.width - 14} ${spec.height - 1} Z`}
        fill={`url(#wo-${spec.sku})`}
        stroke={COL.silverDark}
        strokeWidth={0.6}
      />
      <path
        d={`M${spec.width - 12} ${spec.height * 0.3} L${spec.width - 4} ${spec.height * 0.3} L${spec.width - 2} ${spec.height / 2} L${spec.width - 4} ${spec.height * 0.7} L${spec.width - 12} ${spec.height * 0.7} Z`}
        fill="#0c0e10"
      />
    </g>
  )
}

// --------------------------------------------------------------------------

export default function PartSvg({ sku, selected, ghost }: Props) {
  const spec = PARTS[sku]
  if (!spec) return null
  let body: React.ReactElement | null = null
  switch (spec.category) {
    case 'beam':
      body = <Beam spec={spec} />
      break
    case 'plate':
      if (spec.variant === 'u-small' || spec.variant === 'u-mid') body = <UChannel spec={spec} />
      else if (spec.variant === 'wing' || spec.variant === 'wing-long') body = <WingPlate spec={spec} />
      else if (spec.variant === 'tab') body = <TabPlate spec={spec} />
      else if (spec.variant === 'wedge') body = <WedgePlate spec={spec} />
      else if (spec.variant === 'h-trim') body = <HTrim spec={spec} />
      else body = <GridPlate spec={spec} />
      break
    case 'bracket':
      body = <Bracket spec={spec} />
      break
    case 'bolt':
      body = <Bolt spec={spec} />
      break
    case 'nut':
      body = <Nut spec={spec} />
      break
    case 'washer':
      body = <Washer spec={spec} />
      break
    case 'axle':
      body = <Axle spec={spec} />
      break
    case 'tire':
      body = <Tire spec={spec} />
      break
    case 'gear':
      body = <Gear spec={spec} />
      break
    case 'hub':
    case 'spacer':
      body = <Spacer spec={spec} />
      break
    case 'bearing':
      body = <Bearing spec={spec} />
      break
    case 'pad':
      body = <Pad spec={spec} />
      break
    case 'tool':
      body = <Tool spec={spec} />
      break
  }
  return (
    <g
      style={{
        filter: selected
          ? 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.95))'
          : 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
        opacity: ghost ? 0.55 : 1,
      }}
    >
      {body}
    </g>
  )
}

export function getPartBounds(sku: PartSku): { width: number; height: number } {
  const spec = PARTS[sku]
  return { width: spec.width, height: spec.height }
}
