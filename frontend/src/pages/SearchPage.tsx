import { useState } from 'react'
import { Search, Plane, AlertTriangle, ArrowRight, ExternalLink, MapPin, Shield, Star } from 'lucide-react'
import { demoItineraries, type Itinerary } from '../data/demoData'
import { convertPrice, getCurrencyCode } from '../utils/currency'

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

const reliabilityBorder: Record<string, string> = {
  green: 'border-status-ontime/40 text-status-ontime',
  amber: 'border-status-minor-delay/40 text-status-minor-delay',
  red: 'border-status-major-delay/40 text-status-major-delay',
}

function SegmentTimeline({ itinerary }: { itinerary: Itinerary }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {itinerary.segments.map((seg, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && (
            <div className="flex flex-col items-center px-1.5">
              <div className="w-px h-2 bg-border-light" />
              <span className="text-[9px] font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                {formatDuration(itinerary.layover_durations[i - 1])}
              </span>
              <div className="w-px h-2 bg-border-light" />
            </div>
          )}
          <div className="flex items-center gap-2 bg-bg-tertiary/40 rounded-md px-2.5 py-1.5">
            <div className="text-center">
              <p className="font-mono text-xs font-semibold">{seg.departure_airport}</p>
              <p className="text-[9px] text-text-muted">{formatTime(seg.departure_time)}</p>
            </div>
            <div className="flex flex-col items-center px-1.5">
              <span className="text-[8px] text-text-muted">{seg.airline_iata}</span>
              <div className="flex items-center gap-0.5 my-0.5">
                <div className="h-px w-4 bg-border-light" />
                <Plane className="w-2.5 h-2.5 text-text-muted" />
                <div className="h-px w-4 bg-border-light" />
              </div>
              <span className="text-[8px] text-text-muted">{formatDuration(seg.duration_minutes)}</span>
            </div>
            <div className="text-center">
              <p className="font-mono text-xs font-semibold">{seg.arrival_airport}</p>
              <p className="text-[9px] text-text-muted">{formatTime(seg.arrival_time)}</p>
            </div>
            {seg.reliability_color && (
              <span className={`text-[8px] font-mono font-semibold px-1 py-0.5 rounded border ${reliabilityBorder[seg.reliability_color]}`}>
                {seg.on_time_percentage}%
              </span>
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
  const currCode = getCurrencyCode()

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

  const handleBook = (itin: Itinerary) => {
    // Open the first available booking link in a new tab
    const link = itin.deep_link || itin.booking_links[0]?.url
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-bg-secondary border border-border rounded-lg p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">From</label>
            <input
              type="text"
              value={origin}
              onChange={e => setOrigin(e.target.value.toUpperCase())}
              placeholder="DXB"
              maxLength={3}
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 font-mono text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
            />
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted mb-2.5" />
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">To</label>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value.toUpperCase())}
              placeholder="LIS"
              maxLength={3}
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 font-mono text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">Date</label>
            <input
              type="date"
              defaultValue="2026-03-10"
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50"
            />
          </div>
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </button>
        </div>
        <p className="flex items-center gap-1.5 mt-2.5 text-[10px] text-text-muted">
          <MapPin className="w-3 h-3" />
          Also checking nearby airports: SHJ, AUH, OPO, FAO
          <span className="ml-auto font-mono">{currCode}</span>
        </p>
      </form>

      {/* Results */}
      {searched && (
        <div className="space-y-3 animate-fade-in">
          {/* Sort bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {sortOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                    sortBy === opt.key
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-text-muted font-mono">{results.length} results</span>
          </div>

          {/* Itinerary Cards */}
          {results.map(itin => {
            const price = convertPrice(itin.total_price)
            return (
              <div
                key={itin.id}
                className={`bg-bg-secondary border rounded-lg p-4 transition-all ${
                  selectedIds.has(itin.id)
                    ? 'border-accent/40'
                    : 'border-border hover:border-border-light'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Timeline */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {itin.airlines_involved.map(a => (
                        <span key={a} className="text-[10px] font-medium text-text-secondary bg-bg-tertiary px-1.5 py-0.5 rounded">{a}</span>
                      ))}
                      {itin.total_stops === 0 && (
                        <span className="text-[9px] font-semibold text-status-ontime bg-status-ontime/8 px-1.5 py-0.5 rounded">DIRECT</span>
                      )}
                      {itin.uses_nearby_airports && (
                        <span className="text-[9px] font-medium text-accent bg-accent/8 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" /> Alt airport
                        </span>
                      )}
                    </div>

                    <SegmentTimeline itinerary={itin} />

                    {itin.risk_warnings.length > 0 && (
                      <div className="space-y-0.5">
                        {itin.risk_warnings.map((w, i) => (
                          <p key={i} className="flex items-start gap-1 text-[10px] text-status-minor-delay/80">
                            <AlertTriangle className="w-3 h-3 mt-px shrink-0" />
                            {w}
                          </p>
                        ))}
                      </div>
                    )}

                    {itin.nearby_airport_note && (
                      <p className="text-[10px] text-accent/70 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {itin.nearby_airport_note}
                      </p>
                    )}
                  </div>

                  {/* Right: Price + Actions */}
                  <div className="text-right shrink-0 space-y-1.5 min-w-[120px]">
                    <p className="font-mono text-xl font-bold text-text-primary">{price.display}</p>
                    <p className="text-[10px] text-text-muted">
                      {formatDuration(itin.total_duration_minutes)} · {itin.total_stops === 0 ? 'Direct' : `${itin.total_stops} stop`}
                    </p>

                    <div className="flex items-center justify-end gap-2">
                      <span className="flex items-center gap-0.5 text-[10px] font-mono text-accent" title="Value score">
                        <Star className="w-3 h-3" />{(itin.best_value_score * 100).toFixed(0)}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] font-mono text-status-ontime" title="Reliability">
                        <Shield className="w-3 h-3" />{(itin.reliability_score * 100).toFixed(0)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleBook(itin)}
                        className="bg-accent hover:bg-accent-hover text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors flex items-center justify-center gap-1"
                      >
                        Book <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => toggleCompare(itin.id)}
                        className={`text-[10px] py-1 px-3 rounded-md border transition-colors ${
                          selectedIds.has(itin.id)
                            ? 'border-accent/40 text-accent'
                            : 'border-border text-text-muted hover:text-text-secondary'
                        }`}
                      >
                        {selectedIds.has(itin.id) ? 'Selected' : 'Compare'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {!searched && (
        <div className="text-center py-16">
          <Search className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <h2 className="text-sm font-medium text-text-secondary mb-1">Find creative flight combinations</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Search multiple airlines and nearby airports to find routes traditional booking sites miss.
          </p>
        </div>
      )}
    </div>
  )
}
