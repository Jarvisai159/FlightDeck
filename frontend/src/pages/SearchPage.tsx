import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Search, Plane, AlertTriangle, ExternalLink, MapPin, Star, Shield,
  Loader2, RefreshCw, Clock, Users, ChevronDown, ArrowRightLeft, Info,
} from 'lucide-react'
import AirportAutocomplete from '../components/ui/AirportAutocomplete'
import type { AirportOption } from '../data/airports'
import { searchFlights, type NormalizedItinerary, type NormalizedSegment } from '../services/flightApi'
import { buildGoogleFlightsUrl, buildKiwiUrl, buildSegmentBookingUrl, getAirlineUrl, hasAirlineWebsite } from '../utils/booking'
import { generateDemoItineraries } from '../data/demoData'
import { convertPrice, getCurrencyCode } from '../utils/currency'
import { formatDisplayDate, getDatePlaceholder, todayISO } from '../utils/dateFormat'

// --- Types ---
type SortBy = 'best_value' | 'cheapest' | 'fastest' | 'fewest_stops'
type CabinClass = 'M' | 'W' | 'C' | 'F'

const SORT_OPTIONS: { key: SortBy; label: string }[] = [
  { key: 'best_value', label: 'Best Value' },
  { key: 'cheapest', label: 'Cheapest' },
  { key: 'fastest', label: 'Fastest' },
  { key: 'fewest_stops', label: 'Fewest Stops' },
]

const CABIN_CLASSES: { value: CabinClass; label: string }[] = [
  { value: 'M', label: 'Economy' },
  { value: 'W', label: 'Premium Economy' },
  { value: 'C', label: 'Business' },
  { value: 'F', label: 'First Class' },
]

const REFRESH_INTERVAL = 15 * 60 * 1000 // 15 minutes

// --- Helpers ---
function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h${m > 0 ? ` ${m}m` : ''}`
}

function formatDurationMins(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h${m > 0 ? ` ${m}m` : ''}`
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch {
    return '--:--'
  }
}

// Date helpers — delegate to dateFormat utility
const datePlaceholder = getDatePlaceholder()

function sortResults(items: NormalizedItinerary[], by: SortBy): NormalizedItinerary[] {
  const sorted = [...items]
  switch (by) {
    case 'cheapest': return sorted.sort((a, b) => a.price - b.price)
    case 'fastest': return sorted.sort((a, b) => a.totalDurationSeconds - b.totalDurationSeconds)
    case 'fewest_stops': return sorted.sort((a, b) => a.stops - b.stops)
    default: return sorted.sort((a, b) => a.quality - b.quality) // lower quality = better in Kiwi
  }
}

// Sort demo data (Itinerary type from demoData)
function sortDemo(items: ReturnType<typeof generateDemoItineraries>, by: SortBy) {
  const sorted = [...items]
  switch (by) {
    case 'cheapest': return sorted.sort((a, b) => a.total_price - b.total_price)
    case 'fastest': return sorted.sort((a, b) => a.total_duration_minutes - b.total_duration_minutes)
    case 'fewest_stops': return sorted.sort((a, b) => a.total_stops - b.total_stops)
    default: return sorted.sort((a, b) => b.best_value_score - a.best_value_score)
  }
}

// --- Segment Timeline for real API results ---
function ApiSegmentTimeline({ segments }: { segments: NormalizedSegment[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {segments.map((seg, i) => {
        // Calculate layover time if not first segment
        let layoverSeconds = 0
        if (i > 0) {
          const prevArrival = new Date(segments[i - 1].arrivalTime).getTime()
          const thisDeparture = new Date(seg.departureTime).getTime()
          layoverSeconds = (thisDeparture - prevArrival) / 1000
        }
        return (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && (
              <div className="flex flex-col items-center px-1.5">
                <div className="w-px h-2 bg-border-light" />
                <span className="text-[9px] font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                  {formatDuration(layoverSeconds)}
                </span>
                <div className="w-px h-2 bg-border-light" />
              </div>
            )}
            <div className="flex items-center gap-2 bg-bg-tertiary/40 rounded-md px-2.5 py-1.5">
              <div className="text-center">
                <p className="font-mono text-xs font-semibold">{seg.from}</p>
                <p className="text-[9px] text-text-muted">{formatTime(seg.departureTime)}</p>
              </div>
              <div className="flex flex-col items-center px-1.5">
                <span className="text-[8px] text-text-muted">{seg.airline}</span>
                <div className="flex items-center gap-0.5 my-0.5">
                  <div className="h-px w-4 bg-border-light" />
                  <Plane className="w-2.5 h-2.5 text-text-muted" />
                  <div className="h-px w-4 bg-border-light" />
                </div>
                <span className="text-[8px] text-text-muted">{formatDuration(seg.durationSeconds)}</span>
              </div>
              <div className="text-center">
                <p className="font-mono text-xs font-semibold">{seg.to}</p>
                <p className="text-[9px] text-text-muted">{formatTime(seg.arrivalTime)}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// --- Demo Segment Timeline (from demoData types) ---
function DemoSegmentTimeline({ itinerary }: { itinerary: typeof demoItineraries[0] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {itinerary.segments.map((seg, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && (
            <div className="flex flex-col items-center px-1.5">
              <div className="w-px h-2 bg-border-light" />
              <span className="text-[9px] font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                {formatDurationMins(itinerary.layover_durations[i - 1])}
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
              <span className="text-[8px] text-text-muted">{formatDurationMins(seg.duration_minutes)}</span>
            </div>
            <div className="text-center">
              <p className="font-mono text-xs font-semibold">{seg.arrival_airport}</p>
              <p className="text-[9px] text-text-muted">{formatTime(seg.arrival_time)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================
// MAIN COMPONENT
// ============================
export default function SearchPage() {
  // Search form state
  const [fromAirport, setFromAirport] = useState<AirportOption | null>(null)
  const [toAirport, setToAirport] = useState<AirportOption | null>(null)
  const [departureDate, setDepartureDate] = useState(todayISO())
  const [returnDate, setReturnDate] = useState('')
  const [cabinClass, setCabinClass] = useState<CabinClass>('M')
  const [passengers, setPassengers] = useState(1)

  // Results state
  const [results, setResults] = useState<NormalizedItinerary[]>([])
  const [demoResults, setDemoResults] = useState<ReturnType<typeof generateDemoItineraries>>([])
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('best_value')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [nextRefresh, setNextRefresh] = useState<number>(0)

  // Refs
  const refreshTimerRef = useRef<ReturnType<typeof setInterval>>()
  const countdownRef = useRef<ReturnType<typeof setInterval>>()
  const searchParamsRef = useRef<{ from: string; to: string; dep: string; ret: string; cabin: CabinClass; pax: number } | null>(null)

  const currCode = getCurrencyCode()
  const isReturn = returnDate.length > 0

  // --- Search handler ---
  const doSearch = useCallback(async (from: string, to: string, dep: string, ret: string, cabin: CabinClass, pax: number) => {
    setLoading(true)
    setError('')
    try {
      const res = await searchFlights({
        flyFrom: from,
        flyTo: to,
        dateFrom: dep,
        dateTo: ret || undefined,
        currency: currCode,
        adults: pax,
        maxStopovers: 2,
        sort: 'quality',
        limit: 15,
        cabin: cabin,
      })

      if (res.isDemo || res.results.length === 0) {
        // Fallback to dynamic demo data using the airports selected
        setDemoResults(generateDemoItineraries(from, to, dep))
        setResults([])
        setIsDemo(true)
      } else {
        setResults(res.results)
        setIsDemo(false)
      }
      setLastUpdated(new Date())
      setSearched(true)
    } catch (err: any) {
      setError(err.message || 'Search failed')
      // Show demo data for the actual route
      setDemoResults(generateDemoItineraries(from, to, dep))
      setResults([])
      setIsDemo(true)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }, [currCode])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromAirport || !toAirport) {
      setError('Please select both departure and arrival airports')
      return
    }
    if (!departureDate) {
      setError('Please select a departure date')
      return
    }
    const params = { from: fromAirport.iata, to: toAirport.iata, dep: departureDate, ret: returnDate, cabin: cabinClass, pax: passengers }
    searchParamsRef.current = params
    doSearch(params.from, params.to, params.dep, params.ret, params.cabin, params.pax)
    startRefreshTimer()
  }

  // --- Auto-refresh every 15 min ---
  const startRefreshTimer = () => {
    // Clear existing timers
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    setNextRefresh(REFRESH_INTERVAL / 1000)

    // Countdown
    countdownRef.current = setInterval(() => {
      setNextRefresh((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    // Refresh
    refreshTimerRef.current = setInterval(() => {
      if (searchParamsRef.current) {
        const p = searchParamsRef.current
        doSearch(p.from, p.to, p.dep, p.ret, p.cabin, p.pax)
        setNextRefresh(REFRESH_INTERVAL / 1000)
      }
    }, REFRESH_INTERVAL)
  }

  const handleManualRefresh = () => {
    if (searchParamsRef.current) {
      const p = searchParamsRef.current
      doSearch(p.from, p.to, p.dep, p.ret, p.cabin, p.pax)
      startRefreshTimer()
    }
  }

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  // Swap airports
  const handleSwap = () => {
    const tmp = fromAirport
    setFromAirport(toAirport)
    setToAirport(tmp)
  }

  // --- Sorted results ---
  const sortedResults = useMemo(() => sortResults(results, sortBy), [results, sortBy])
  const sortedDemoResults = useMemo(() => sortDemo(demoResults, sortBy), [demoResults, sortBy])

  const resultCount = isDemo ? sortedDemoResults.length : sortedResults.length

  // Countdown display
  const refreshMin = Math.floor(nextRefresh / 60)
  const refreshSec = nextRefresh % 60

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ======== SEARCH FORM ======== */}
      <form onSubmit={handleSearch} className="bg-bg-secondary border border-border rounded-lg p-4">
        {/* Row 1: Airports + Swap */}
        <div className="flex items-end gap-2 flex-wrap">
          <AirportAutocomplete
            label="From"
            value={fromAirport}
            onChange={setFromAirport}
            placeholder="City or airport code"
          />
          <button
            type="button"
            onClick={handleSwap}
            className="mb-1 p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-bg-tertiary transition-colors"
            title="Swap airports"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
          <AirportAutocomplete
            label="To"
            value={toAirport}
            onChange={setToAirport}
            placeholder="City or airport code"
          />
        </div>

        {/* Row 2: Dates + Class + Passengers + Search */}
        <div className="flex items-end gap-2 flex-wrap mt-3">
          {/* Departure Date */}
          <div className="flex-1 min-w-[130px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">
              Departure <span className="text-text-muted/50">({datePlaceholder})</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={todayISO()}
                className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-transparent focus:outline-none focus:border-accent/50 cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
              {/* Overlay showing locale-formatted date */}
              <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                <span className="text-sm font-mono text-text-primary">
                  {departureDate ? formatDisplayDate(departureDate) : datePlaceholder}
                </span>
              </div>
            </div>
          </div>

          {/* Return Date */}
          <div className="flex-1 min-w-[130px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">
              Return <span className="text-text-muted/50">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                min={departureDate || todayISO()}
                className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-transparent focus:outline-none focus:border-accent/50 cursor-pointer"
                style={{ colorScheme: 'dark' }}
              />
              {/* Overlay showing locale-formatted date */}
              <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                <span className={`text-sm font-mono ${returnDate ? 'text-text-primary' : 'text-accent/60'}`}>
                  {returnDate ? formatDisplayDate(returnDate) : 'One-way'}
                </span>
              </div>
            </div>
          </div>

          {/* Cabin Class */}
          <div className="min-w-[130px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">
              Class
            </label>
            <div className="relative">
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50 appearance-none pr-7"
              >
                {CABIN_CLASSES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Passengers */}
          <div className="min-w-[90px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">
              Passengers
            </label>
            <div className="relative">
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full bg-bg-primary border border-border rounded-md pl-8 pr-7 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50 appearance-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Search
          </button>
        </div>

        {/* Info row */}
        <div className="flex items-center justify-between mt-2.5">
          <p className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <MapPin className="w-3 h-3" />
            Also checking nearby airports
            {!isReturn && <span className="ml-1 text-accent/70 font-medium">One-way trip</span>}
            {isReturn && <span className="ml-1 text-accent/70 font-medium">Round trip</span>}
          </p>
          <span className="text-[10px] font-mono text-text-muted">{currCode}</span>
        </div>

        {error && (
          <p className="mt-2 text-xs text-status-major-delay flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {error}
          </p>
        )}
      </form>

      {/* ======== RESULTS ======== */}
      {searched && (
        <div className="space-y-3 animate-fade-in">
          {/* Sort bar + refresh */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1">
              {SORT_OPTIONS.map((opt) => (
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
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-[9px] text-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Refreshes in {refreshMin}:{String(refreshSec).padStart(2, '0')}
                </span>
              )}
              {searched && (
                <button
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="text-[10px] text-text-muted hover:text-accent flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              )}
              <span className="text-[10px] text-text-muted font-mono">{resultCount} results</span>
            </div>
          </div>

          {/* Demo mode banner */}
          {isDemo && (
            <div className="bg-accent/5 border border-accent/20 rounded-md px-3 py-2 flex items-start gap-2">
              <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-accent font-medium">Demo Mode</p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  Showing sample results. Add a Kiwi Tequila API key in Vercel environment variables for live flight data.
                </p>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
              <span className="text-sm text-text-muted">Searching flights...</span>
            </div>
          )}

          {/* ======== REAL API RESULTS ======== */}
          {!isDemo && !loading && sortedResults.map((itin) => (
            <div
              key={itin.id}
              className="bg-bg-secondary border border-border hover:border-border-light rounded-lg p-4 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Route Info */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  {/* Airline badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {itin.airlines.map((a) => (
                      <span key={a} className="text-[10px] font-medium text-text-secondary bg-bg-tertiary px-1.5 py-0.5 rounded">
                        {a}
                      </span>
                    ))}
                    {itin.stops === 0 && (
                      <span className="text-[9px] font-semibold text-status-ontime bg-status-ontime/8 px-1.5 py-0.5 rounded">DIRECT</span>
                    )}
                    {itin.isMultiAirline && (
                      <span className="text-[9px] font-medium text-status-minor-delay bg-status-minor-delay/8 px-1.5 py-0.5 rounded">
                        Multi-airline
                      </span>
                    )}
                  </div>

                  {/* Route timeline */}
                  <ApiSegmentTimeline segments={itin.segments} />

                  {/* Per-leg booking links for multi-airline */}
                  {itin.isMultiAirline && (
                    <div className="space-y-1 pt-1">
                      <p className="text-[9px] text-status-minor-delay/80 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Separate bookings required — book each leg individually:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {itin.segments.map((seg, i) => (
                          <a
                            key={i}
                            href={hasAirlineWebsite(seg.airline)
                              ? getAirlineUrl(seg.airline)
                              : buildSegmentBookingUrl(seg.airline, seg.from, seg.to, seg.departureTime)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] font-medium text-accent bg-accent/5 hover:bg-accent/10 border border-accent/20 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                          >
                            {seg.airlineName}: {seg.from}&rarr;{seg.to}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seats left warning */}
                  {itin.seatsLeft !== null && itin.seatsLeft > 0 && itin.seatsLeft <= 5 && (
                    <p className="text-[10px] text-status-major-delay/80 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Only {itin.seatsLeft} seat{itin.seatsLeft > 1 ? 's' : ''} left
                    </p>
                  )}
                </div>

                {/* Right: Price + Book */}
                <div className="text-right shrink-0 space-y-1.5 min-w-[120px]">
                  <p className="font-mono text-xl font-bold text-text-primary">
                    {itin.currency === 'EUR' ? convertPrice(itin.price).display : `${itin.price} ${itin.currency}`}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {formatDuration(itin.totalDurationSeconds)} · {itin.stops === 0 ? 'Direct' : `${itin.stops} stop${itin.stops > 1 ? 's' : ''}`}
                  </p>
                  {passengers > 1 && (
                    <p className="text-[9px] text-text-muted font-mono">{passengers} pax</p>
                  )}

                  <div className="flex flex-col gap-1 pt-1">
                    {/* Main Book button — opens Kiwi deep link */}
                    <a
                      href={itin.deepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-accent hover:bg-accent-hover text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors flex items-center justify-center gap-1"
                    >
                      Book <ExternalLink className="w-3 h-3" />
                    </a>
                    {/* Alternative booking: Google Flights */}
                    <a
                      href={buildGoogleFlightsUrl(itin.from, itin.to, departureDate, cabinClass, passengers)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-text-muted hover:text-accent py-1 px-3 rounded-md border border-border transition-colors text-center"
                    >
                      Google Flights
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* ======== DEMO RESULTS ======== */}
          {isDemo && !loading && sortedDemoResults.map((itin) => {
            const price = convertPrice(itin.total_price)
            return (
              <div
                key={itin.id}
                className="bg-bg-secondary border border-border hover:border-border-light rounded-lg p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2.5">
                    {/* Airline badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {itin.airlines_involved.map((a) => (
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

                    <DemoSegmentTimeline itinerary={itin} />

                    {/* Per-leg booking links for multi-airline demo */}
                    {itin.airlines_involved.length > 1 && (
                      <div className="space-y-1 pt-1">
                        <p className="text-[9px] text-status-minor-delay/80 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Separate bookings required — book each leg individually:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {itin.booking_links.map((link, i) => (
                            <a
                              key={i}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] font-medium text-accent bg-accent/5 hover:bg-accent/10 border border-accent/20 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                            >
                              {link.airline}: {itin.segments[link.segment_index]?.departure_airport}&rarr;{itin.segments[link.segment_index]?.arrival_airport}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

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
                      {formatDurationMins(itin.total_duration_minutes)} · {itin.total_stops === 0 ? 'Direct' : `${itin.total_stops} stop`}
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
                      {/* Main booking — opens Kiwi search for the route */}
                      <a
                        href={
                          itin.deep_link ||
                          buildKiwiUrl(
                            itin.segments[0].departure_airport,
                            itin.segments[itin.segments.length - 1].arrival_airport,
                            departureDate,
                            returnDate || undefined,
                          )
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-accent hover:bg-accent-hover text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors flex items-center justify-center gap-1"
                      >
                        Book <ExternalLink className="w-3 h-3" />
                      </a>
                      {/* Google Flights link */}
                      <a
                        href={buildGoogleFlightsUrl(
                          itin.segments[0].departure_airport,
                          itin.segments[itin.segments.length - 1].arrival_airport,
                          departureDate,
                          cabinClass,
                          passengers,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] text-text-muted hover:text-accent py-1 px-3 rounded-md border border-border transition-colors text-center"
                      >
                        Google Flights
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* No results */}
          {!loading && resultCount === 0 && !isDemo && (
            <div className="text-center py-10">
              <Plane className="w-6 h-6 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No flights found for this route.</p>
              <p className="text-xs text-text-muted mt-1">Try different dates or nearby airports.</p>
            </div>
          )}
        </div>
      )}

      {/* ======== EMPTY STATE ======== */}
      {!searched && !loading && (
        <div className="text-center py-16">
          <Search className="w-8 h-8 text-text-muted mx-auto mb-3" />
          <h2 className="text-sm font-medium text-text-secondary mb-1">Find creative flight combinations</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Search multiple airlines and nearby airports to find routes traditional booking sites miss.
            Results auto-refresh every 15 minutes.
          </p>
        </div>
      )}
    </div>
  )
}
