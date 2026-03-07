import { useState, useMemo, useCallback } from 'react'
import {
  Search, TrainFront, AlertTriangle, ExternalLink,
  Loader2, Clock, ArrowRightLeft, Info,
} from 'lucide-react'
import StationAutocomplete from '../components/ui/StationAutocomplete'
import type { StationOption } from '../data/stations'
import { searchTrains, type NormalizedJourney, type NormalizedLeg } from '../services/trainApi'
import { formatPrice } from '../utils/currency'
import { formatDisplayDate, todayISO } from '../utils/dateFormat'

// --- Types ---
type SortBy = 'departure' | 'cheapest' | 'fastest' | 'fewest_changes'

const SORT_OPTIONS: { key: SortBy; label: string }[] = [
  { key: 'departure', label: 'Departure' },
  { key: 'cheapest', label: 'Cheapest' },
  { key: 'fastest', label: 'Fastest' },
  { key: 'fewest_changes', label: 'Fewest Changes' },
]

// --- Helpers ---
function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m > 0 ? `${m}m` : ''}`
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch {
    return '--:--'
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

function sortJourneys(items: NormalizedJourney[], by: SortBy): NormalizedJourney[] {
  const sorted = [...items]
  switch (by) {
    case 'cheapest':
      return sorted.sort((a, b) => {
        if (a.price === null && b.price === null) return 0
        if (a.price === null) return 1
        if (b.price === null) return -1
        return a.price - b.price
      })
    case 'fastest':
      return sorted.sort((a, b) => a.totalDurationSeconds - b.totalDurationSeconds)
    case 'fewest_changes':
      return sorted.sort((a, b) => a.changes - b.changes)
    default:
      return sorted.sort((a, b) => new Date(a.departure).getTime() - new Date(b.departure).getTime())
  }
}

// Build booking URLs
function buildTrainlineUrl(from: string, to: string, date: string): string {
  const d = date.split('T')[0]
  return `https://www.thetrainline.com/book/results?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&outwardDate=${d}`
}

function buildOmioUrl(from: string, to: string, date: string): string {
  const d = date.split('T')[0]
  return `https://www.omio.com/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${d}&mode=train`
}

// --- Product badge colors ---
function getProductColor(product: string): string {
  const p = product.toLowerCase()
  if (p.includes('ice') || p.includes('tgv') || p.includes('eurostar') || p.includes('thalys')) return 'bg-red-500/15 text-red-400 border-red-500/20'
  if (p.includes('ic') || p.includes('ec')) return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
  if (p.includes('re') || p.includes('rb') || p.includes('regional')) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
  return 'bg-purple-500/15 text-purple-400 border-purple-500/20'
}

// --- Journey Card ---
function JourneyCard({
  journey,
  departureDate,
}: {
  journey: NormalizedJourney
  departureDate: string
}) {
  const trainLegs = journey.legs.filter((l) => !l.walking)
  const changesLabel = journey.changes === 0 ? 'Direct' : `${journey.changes} change${journey.changes > 1 ? 's' : ''}`
  const viaStations = journey.changes > 0
    ? trainLegs.slice(0, -1).map((l) => l.destination.split(/[,(]/)[0].trim())
    : []

  return (
    <div className="bg-bg-secondary border border-border hover:border-border-light rounded-xl transition-all overflow-hidden">
      <div className="flex items-stretch">
        {/* Main journey info */}
        <div className="flex-1 p-4 md:p-5">
          {/* Product + operator row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {journey.products.map((prod, i) => (
              <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getProductColor(prod)}`}>
                {prod}
              </span>
            ))}
            <span className="text-xs text-text-muted">
              {journey.operators.join(', ')}
            </span>
          </div>

          {/* Time / Route / Duration row */}
          <div className="flex items-center gap-4">
            <div className="text-left min-w-[60px]">
              <p className="text-xl font-bold text-text-primary font-mono leading-tight">
                {formatTime(journey.departure)}
              </p>
              <p className="text-xs text-text-muted truncate max-w-[120px]" title={journey.origin}>
                {journey.origin.split(/[,(]/)[0].trim()}
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center px-2">
              <span className="text-[11px] text-text-muted mb-1">
                {formatDuration(journey.totalDurationSeconds)}
              </span>
              <div className="relative w-full flex items-center">
                <div className="h-[2px] w-full bg-border rounded" />
                {journey.changes > 0 && trainLegs.slice(0, -1).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-accent border-2 border-bg-secondary"
                    style={{ left: `${((i + 1) / trainLegs.length) * 100}%`, transform: 'translateX(-50%)' }}
                  />
                ))}
              </div>
              <span className={`text-[11px] mt-1 ${journey.changes === 0 ? 'text-emerald-400 font-medium' : 'text-text-muted'}`}>
                {changesLabel}
                {viaStations.length > 0 && (
                  <span className="text-text-muted"> via {viaStations.join(', ')}</span>
                )}
              </span>
            </div>

            <div className="text-right min-w-[60px]">
              <p className="text-xl font-bold text-text-primary font-mono leading-tight">
                {formatTime(journey.arrival)}
              </p>
              <p className="text-xs text-text-muted truncate max-w-[120px]" title={journey.destination}>
                {journey.destination.split(/[,(]/)[0].trim()}
              </p>
            </div>
          </div>

          {/* Leg details */}
          {journey.changes > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
              {trainLegs.map((leg, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] text-text-muted">
                  <span className={`font-semibold px-1.5 py-0.5 rounded border ${getProductColor(leg.product)}`}>
                    {leg.lineName || leg.product}
                  </span>
                  <span>{leg.origin.split(/[,(]/)[0].trim()}</span>
                  <span className="text-text-muted">→</span>
                  <span>{leg.destination.split(/[,(]/)[0].trim()}</span>
                  <span className="text-text-muted/60">
                    {formatTime(leg.departure)}–{formatTime(leg.arrival)}
                  </span>
                  {leg.platform && (
                    <span className="text-text-muted/60">Pl. {leg.platform}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price + Book column */}
        <div className="flex flex-col items-center justify-center bg-bg-primary/30 border-l border-border px-5 py-4 min-w-[150px]">
          {journey.price !== null ? (
            <p className="text-lg font-bold text-text-primary font-mono leading-tight">
              {formatPrice(journey.price, journey.currency)}
            </p>
          ) : (
            <p className="text-sm text-text-muted">Check price</p>
          )}
          <a
            href={buildTrainlineUrl(journey.origin, journey.destination, journey.departure)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            Book →
          </a>
          <a
            href={buildOmioUrl(journey.origin, journey.destination, journey.departure)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 text-[10px] text-text-muted hover:text-accent transition-colors"
          >
            Compare on Omio
          </a>
        </div>
      </div>
    </div>
  )
}

// ============================
// MAIN COMPONENT
// ============================
export default function TrainsPage() {
  const [fromStation, setFromStation] = useState<StationOption | null>(null)
  const [toStation, setToStation] = useState<StationOption | null>(null)
  const [departureDate, setDepartureDate] = useState(todayISO())
  const [departureTime, setDepartureTime] = useState('08:00')

  const [results, setResults] = useState<NormalizedJourney[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('departure')

  const datePlaceholder = 'dd/mm/yyyy'

  const doSearch = useCallback(async (fromId: string, toId: string, dep: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await searchTrains({
        fromId,
        toId,
        departure: dep,
        results: 10,
      })
      setResults(res.journeys)
      setSearched(true)
    } catch (err: any) {
      setError(err.message || 'Search failed')
      setResults([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromStation || !toStation) {
      setError('Please select both departure and arrival stations')
      return
    }
    if (!departureDate) {
      setError('Please select a departure date')
      return
    }
    const depISO = `${departureDate}T${departureTime}:00`
    doSearch(fromStation.id, toStation.id, depISO)
  }

  const handleSwap = () => {
    const tmp = fromStation
    setFromStation(toStation)
    setToStation(tmp)
  }

  const sortedResults = useMemo(() => sortJourneys(results, sortBy), [results, sortBy])
  const resultCount = sortedResults.length

  // Stats
  const cheapestPrice = results.length > 0
    ? results.filter((j) => j.price !== null).reduce((min, j) => Math.min(min, j.price!), Infinity)
    : 0
  const cheapestCurrency = results.find((j) => j.price !== null)?.currency || 'EUR'
  const fastestDuration = results.length > 0
    ? Math.min(...results.map((j) => j.totalDurationSeconds))
    : 0

  return (
    <div className="space-y-5 animate-fade-in">
      {/* SEARCH FORM */}
      <form onSubmit={handleSearch} className="bg-bg-secondary border border-border rounded-xl p-4 md:p-5">
        <div className="flex items-end gap-2 flex-wrap">
          <StationAutocomplete label="From" value={fromStation} onChange={setFromStation} placeholder="City or station" />
          <button type="button" onClick={handleSwap} className="mb-1 p-2 rounded-lg text-text-muted hover:text-accent hover:bg-bg-tertiary transition-colors" title="Swap">
            <ArrowRightLeft className="w-4 h-4" />
          </button>
          <StationAutocomplete label="To" value={toStation} onChange={setToStation} placeholder="City or station" />
        </div>

        <div className="flex items-end gap-2 flex-wrap mt-3">
          <div className="flex-1 min-w-[130px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">Date</label>
            <div className="relative">
              <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} min={todayISO()}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-transparent focus:outline-none focus:border-accent/50 cursor-pointer" style={{ colorScheme: 'dark' }} />
              <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                <span className="text-sm font-mono text-text-primary">{departureDate ? formatDisplayDate(departureDate) : datePlaceholder}</span>
              </div>
            </div>
          </div>

          <div className="min-w-[100px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">Time</label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/50"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <button type="submit" disabled={loading}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {error}
          </p>
        )}
      </form>

      {/* RESULTS */}
      {searched && (
        <div className="space-y-3 animate-fade-in">
          {/* Sort tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1 bg-bg-secondary border border-border rounded-lg p-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`text-xs px-3 py-2 rounded-md font-medium transition-colors ${
                    sortBy === opt.key ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
                  }`}
                >
                  <span className="block">{opt.label}</span>
                  {opt.key === 'cheapest' && cheapestPrice > 0 && cheapestPrice < Infinity && (
                    <span className="block text-[10px] opacity-80">{formatPrice(cheapestPrice, cheapestCurrency)}</span>
                  )}
                  {opt.key === 'fastest' && fastestDuration > 0 && (
                    <span className="block text-[10px] opacity-80">{formatDuration(fastestDuration)}</span>
                  )}
                </button>
              ))}
            </div>

            <span className="text-[10px] text-text-muted font-mono">{resultCount} results</span>
          </div>

          {/* Info banner */}
          {!loading && resultCount > 0 && (
            <div className="flex items-start gap-2 bg-blue-500/5 border border-blue-500/15 rounded-lg px-3 py-2.5">
              <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-300/80 leading-relaxed">
                Schedules from Deutsche Bahn network covering European rail. Click <strong>Book</strong> to purchase tickets on Trainline or compare on Omio.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12 gap-2">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
              <span className="text-sm text-text-muted">Searching trains...</span>
            </div>
          )}

          {!loading && sortedResults.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} departureDate={departureDate} />
          ))}

          {!loading && resultCount === 0 && (
            <div className="text-center py-10">
              <TrainFront className="w-6 h-6 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No trains found for this route.</p>
              <p className="text-xs text-text-muted mt-1">Try different dates or nearby stations.</p>
            </div>
          )}
        </div>
      )}

      {!searched && !loading && (
        <div className="text-center py-16">
          <TrainFront className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <h2 className="text-sm font-medium text-text-secondary mb-1">Search European rail</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Find trains across Europe — ICE, TGV, Eurostar, and more. Book on Trainline or Omio for the best prices.
          </p>
        </div>
      )}
    </div>
  )
}
