import { useState } from 'react'
import { Search, Plane, Clock, AlertTriangle, ArrowRight, ExternalLink, MapPin, Shield, Star } from 'lucide-react'
import { demoItineraries, type Itinerary } from '../data/demoData'

type SortBy = 'best_value' | 'cheapest' | 'fastest' | 'fewest_stops' | 'most_reliable'

const sortOptions: { key: SortBy; label: string }[] = [
  { key: 'best_value', label: 'Best Value' },
  { key: 'cheapest', label: 'Cheapest' },
  { key: 'fastest', label: 'Fastest' },
  { key: 'fewest_stops', label: 'Fewest Stops' },
  { key: 'most_reliable', label: 'Most Reliable' },
]

function sortItineraries(items: Itinerary[], by: SortBy): Itinerary[] {
  const sorted = [...items]
  switch (by) {
    case 'cheapest': return sorted.sort((a, b) => a.total_price - b.total_price)
    case 'fastest': return sorted.sort((a, b) => a.total_duration_minutes - b.total_duration_minutes)
    case 'fewest_stops': return sorted.sort((a, b) => a.total_stops - b.total_stops)
    case 'most_reliable': return sorted.sort((a, b) => b.reliability_score - a.reliability_score)
    default: return sorted.sort((a, b) => b.best_value_score - a.best_value_score)
  }
}

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m > 0 ? m + 'm' : ''}`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const reliabilityColors: Record<string, string> = {
  green: 'text-status-ontime bg-status-ontime/10 border-status-ontime/30',
  amber: 'text-status-minor-delay bg-status-minor-delay/10 border-status-minor-delay/30',
  red: 'text-status-major-delay bg-status-major-delay/10 border-status-major-delay/30',
}

function SegmentTimeline({ itinerary }: { itinerary: Itinerary }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {itinerary.segments.map((seg, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && (
            <div className="flex flex-col items-center px-2">
              <div className="w-px h-3 bg-border-light" />
              <span className="text-[9px] font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                {formatDuration(itinerary.layover_durations[i - 1])} layover
              </span>
              <div className="w-px h-3 bg-border-light" />
            </div>
          )}
          <div className="flex items-center gap-2 bg-bg-tertiary/50 rounded-lg px-3 py-2">
            <div className="text-center">
              <p className="font-mono text-sm font-bold">{seg.departure_airport}</p>
              <p className="text-[10px] text-text-muted">{formatTime(seg.departure_time)}</p>
            </div>
            <div className="flex flex-col items-center px-2">
              <span className="text-[9px] text-text-muted">{seg.airline_iata} {seg.flight_number?.replace(seg.airline_iata, '')}</span>
              <div className="flex items-center gap-1 my-0.5">
                <div className="h-px w-6 bg-accent" />
                <Plane className="w-3 h-3 text-accent" />
                <div className="h-px w-6 bg-accent" />
              </div>
              <span className="text-[9px] text-text-muted">{formatDuration(seg.duration_minutes)}</span>
            </div>
            <div className="text-center">
              <p className="font-mono text-sm font-bold">{seg.arrival_airport}</p>
              <p className="text-[10px] text-text-muted">{formatTime(seg.arrival_time)}</p>
            </div>
            {seg.reliability_color && (
              <div className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${reliabilityColors[seg.reliability_color]}`}>
                {seg.on_time_percentage}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SearchPage() {
  const [origin, setOrigin] = useState('DXB')
  const [destination, setDestination] = useState('LIS')
  const [searched, setSearched] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('best_value')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const results = sortItineraries(demoItineraries, sortBy)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearched(true)
  }

  const toggleCompare = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 3) next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-bg-secondary border border-border rounded-xl p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">From</label>
            <input
              type="text"
              value={origin}
              onChange={e => setOrigin(e.target.value.toUpperCase())}
              placeholder="DXB"
              maxLength={3}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 font-mono text-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-text-muted" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">To</label>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value.toUpperCase())}
              placeholder="LIS"
              maxLength={3}
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 font-mono text-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">Date</label>
            <input
              type="date"
              defaultValue="2026-03-10"
              className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {/* Search Meta */}
        <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
          <MapPin className="w-3 h-3" />
          <span>Also checking nearby airports: SHJ, AUH, OPO, FAO</span>
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div className="space-y-4 animate-fade-in">
          {/* Sort + Compare Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {sortOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    sortBy === opt.key
                      ? 'bg-accent text-white'
                      : 'bg-bg-secondary text-text-muted hover:text-text-primary border border-border'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-text-muted font-mono">
              {results.length} results · 1.2s
            </span>
          </div>

          {/* Compare Bar */}
          {selectedIds.size > 0 && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-accent font-semibold">
                {selectedIds.size}/3 selected for comparison
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-accent hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          {/* Itinerary Cards */}
          {results.map(itin => (
            <div
              key={itin.id}
              className={`bg-bg-secondary border rounded-xl p-5 transition-all ${
                selectedIds.has(itin.id)
                  ? 'border-accent shadow-lg shadow-accent/10'
                  : 'border-border hover:border-border-light'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Timeline */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {itin.airlines_involved.map(a => (
                      <span key={a} className="text-xs font-semibold bg-bg-tertiary text-text-secondary px-2 py-0.5 rounded">{a}</span>
                    ))}
                    {itin.total_stops === 0 && (
                      <span className="text-[10px] font-bold text-status-ontime bg-status-ontime/10 px-2 py-0.5 rounded">DIRECT</span>
                    )}
                    {itin.uses_nearby_airports && (
                      <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> ALT AIRPORT
                      </span>
                    )}
                  </div>

                  <SegmentTimeline itinerary={itin} />

                  {/* Warnings */}
                  {itin.risk_warnings.length > 0 && (
                    <div className="space-y-1">
                      {itin.risk_warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-status-minor-delay">
                          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {itin.nearby_airport_note && (
                    <p className="text-xs text-accent flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {itin.nearby_airport_note}
                    </p>
                  )}
                </div>

                {/* Right: Price + Actions */}
                <div className="text-right shrink-0 space-y-2 min-w-[130px]">
                  <div>
                    <p className="font-mono text-2xl font-bold text-text-primary">
                      {itin.currency === 'EUR' ? '€' : '$'}{itin.total_price}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatDuration(itin.total_duration_minutes)} · {itin.total_stops === 0 ? 'Direct' : `${itin.total_stops} stop${itin.total_stops > 1 ? 's' : ''}`}
                    </p>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex items-center gap-1" title="Best value score">
                      <Star className="w-3 h-3 text-accent" />
                      <span className="text-xs font-mono text-accent">{(itin.best_value_score * 100).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Reliability score">
                      <Shield className="w-3 h-3 text-status-ontime" />
                      <span className="text-xs font-mono text-status-ontime">{(itin.reliability_score * 100).toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5">
                    <button className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                      Book <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => toggleCompare(itin.id)}
                      className={`text-xs py-1.5 px-4 rounded-lg border transition-colors ${
                        selectedIds.has(itin.id)
                          ? 'border-accent text-accent bg-accent/10'
                          : 'border-border text-text-muted hover:text-text-primary hover:border-border-light'
                      }`}
                    >
                      {selectedIds.has(itin.id) ? 'Selected' : 'Compare'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!searched && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-secondary border border-border mb-4">
            <Search className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-lg font-semibold text-text-secondary mb-1">Find creative flight combinations</h2>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            We search multiple airlines and nearby airports to find routes that traditional booking sites miss — including multi-airline combos with up to 2 stops.
          </p>
        </div>
      )}
    </div>
  )
}
