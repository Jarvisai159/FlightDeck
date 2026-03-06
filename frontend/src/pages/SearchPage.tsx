import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Search, Plane, AlertTriangle, ExternalLink, MapPin,
  Loader2, RefreshCw, Clock, Users, ChevronDown, ArrowRightLeft, Info,
} from 'lucide-react'
import AirportAutocomplete from '../components/ui/AirportAutocomplete'
import type { AirportOption } from '../data/airports'
import { searchFlights, type NormalizedItinerary, type NormalizedSegment } from '../services/flightApi'
import { buildGoogleFlightsUrl, buildKiwiUrl, buildSegmentBookingUrl, buildSkyscannerUrl, getAirlineUrl, hasAirlineWebsite } from '../utils/booking'
import { generateDemoItineraries } from '../data/demoData'
import { getCurrencyCode, formatPrice } from '../utils/currency'
import { formatDisplayDate, getDatePlaceholder, todayISO } from '../utils/dateFormat'

// --- Types ---
type SortBy = 'best_value' | 'cheapest' | 'fastest' | 'fewest_stops'
type CabinClass = 'M' | 'W' | 'C' | 'F'

const SORT_OPTIONS: { key: SortBy; label: string }[] = [
  { key: 'best_value', label: 'Best' },
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

const REFRESH_INTERVAL = 15 * 60 * 1000

// --- Helpers ---
function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m > 0 ? `${m}m` : ''}`
}

function formatDurationMins(mins: number) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m > 0 ? `${m}m` : ''}`
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch {
    return '--:--'
  }
}

const datePlaceholder = getDatePlaceholder()

function sortResults(items: NormalizedItinerary[], by: SortBy): NormalizedItinerary[] {
  const sorted = [...items]
  switch (by) {
    case 'cheapest': return sorted.sort((a, b) => a.price - b.price)
    case 'fastest': return sorted.sort((a, b) => a.totalDurationSeconds - b.totalDurationSeconds)
    case 'fewest_stops': return sorted.sort((a, b) => a.stops - b.stops)
    default: return sorted.sort((a, b) => a.quality - b.quality)
  }
}

function sortDemo(items: ReturnType<typeof generateDemoItineraries>, by: SortBy) {
  const sorted = [...items]
  switch (by) {
    case 'cheapest': return sorted.sort((a, b) => a.total_price - b.total_price)
    case 'fastest': return sorted.sort((a, b) => a.total_duration_minutes - b.total_duration_minutes)
    case 'fewest_stops': return sorted.sort((a, b) => a.total_stops - b.total_stops)
    default: return sorted.sort((a, b) => b.best_value_score - a.best_value_score)
  }
}

// --- Skyscanner-style Flight Card (Real API) ---
function FlightCard({
  itin,
  currency,
  departureDate,
  returnDate,
  cabinClass,
  passengers,
}: {
  itin: NormalizedItinerary
  currency: string
  departureDate: string
  returnDate: string
  cabinClass: CabinClass
  passengers: number
}) {
  const firstSeg = itin.segments[0]
  const lastSeg = itin.segments[itin.segments.length - 1]
  const mainAirline = firstSeg.airline
  const stopsLabel = itin.stops === 0 ? 'Direct' : `${itin.stops} stop${itin.stops > 1 ? 's' : ''}`
  const viaAirports = itin.stops > 0
    ? itin.segments.slice(0, -1).map(s => s.to).join(', ')
    : null

  return (
    <div className="bg-bg-secondary border border-border hover:border-border-light rounded-xl transition-all overflow-hidden">
      <div className="flex items-stretch">
        {/* Main flight info */}
        <div className="flex-1 p-4 md:p-5">
          {/* Airline row */}
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src={`https://pics.avs.io/36/36/${mainAirline}.png`}
              alt=""
              className="w-7 h-7 rounded"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-xs text-text-secondary font-medium">
              {firstSeg.airlineName}
              {itin.isMultiAirline && (
                <span className="text-text-muted"> + {itin.airlines.length - 1} other</span>
              )}
            </span>
            {itin.segments.map((seg, i) => (
              <span key={i} className="text-[10px] text-text-muted font-mono">
                {seg.flightNumber}{i < itin.segments.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>

          {/* Time / Route / Duration row */}
          <div className="flex items-center gap-4">
            <div className="text-left min-w-[60px]">
              <p className="text-xl font-bold text-text-primary font-mono leading-tight">
                {formatTime(firstSeg.departureTime)}
              </p>
              <p className="text-xs text-text-muted font-mono">{firstSeg.from}</p>
            </div>

            <div className="flex-1 flex flex-col items-center px-2">
              <span className="text-[11px] text-text-muted mb-1">
                {formatDuration(itin.totalDurationSeconds)}
              </span>
              <div className="relative w-full flex items-center">
                <div className="h-[2px] w-full bg-border rounded" />
                {itin.stops > 0 && itin.segments.slice(0, -1).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-accent border-2 border-bg-secondary"
                    style={{ left: `${((i + 1) / itin.segments.length) * 100}%`, transform: 'translateX(-50%)' }}
                  />
                ))}
              </div>
              <span className={`text-[11px] mt-1 ${itin.stops === 0 ? 'text-emerald-400 font-medium' : 'text-text-muted'}`}>
                {stopsLabel}
                {viaAirports && <span className="text-text-muted"> via {viaAirports}</span>}
              </span>
            </div>

            <div className="text-right min-w-[60px]">
              <p className="text-xl font-bold text-text-primary font-mono leading-tight">
                {formatTime(lastSeg.arrivalTime)}
              </p>
              <p className="text-xs text-text-muted font-mono">{lastSeg.to}</p>
            </div>
          </div>

          {/* Multi-airline booking warning */}
          {itin.isMultiAirline && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-[10px] text-amber-400 flex items-center gap-1 mb-1.5">
                <AlertTriangle className="w-3 h-3" />
                Separate bookings — book each leg:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {itin.segments.map((seg, i) => (
                  <a
                    key={i}
                    href={buildSegmentBookingUrl(seg.airline, seg.from, seg.to, seg.departureTime)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-medium text-accent bg-accent/5 hover:bg-accent/10 border border-accent/20 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                  >
                    {seg.airlineName}: {seg.from}→{seg.to}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {itin.seatsLeft !== null && itin.seatsLeft > 0 && itin.seatsLeft <= 5 && (
            <p className="mt-2 text-[10px] text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Only {itin.seatsLeft} seat{itin.seatsLeft > 1 ? 's' : ''} left
            </p>
          )}
        </div>

        {/* Price + Book column */}
        <div className="flex flex-col items-center justify-center bg-bg-primary/30 border-l border-border px-5 py-4 min-w-[150px]">
          <p className="text-2xl font-bold text-text-primary font-mono leading-tight">
            {formatPrice(itin.price, itin.currency)}
          </p>
          {passengers > 1 && (
            <p className="text-[10px] text-text-muted mt-0.5">{passengers} passengers</p>
          )}
          <a
            href={itin.deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            Select →
          </a>
          <a
            href={buildSkyscannerUrl(itin.from, itin.to, departureDate, returnDate || undefined)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 text-[10px] text-text-muted hover:text-accent transition-colors"
          >
            Compare on Skyscanner
          </a>
        </div>
      </div>
    </div>
  )
}

// --- Skyscanner-style Flight Card (Demo data) ---
function DemoFlightCard({
  itin,
  departureDate,
  returnDate,
  cabinClass,
  passengers,
}: {
  itin: ReturnType<typeof generateDemoItineraries>[0]
  departureDate: string
  returnDate: string
  cabinClass: CabinClass
  passengers: number
}) {
  const firstSeg = itin.segments[0]
  const lastSeg = itin.segments[itin.segments.length - 1]
  const mainAirline = firstSeg.airline_iata
  const stopsLabel = itin.total_stops === 0 ? 'Direct' : `${itin.total_stops} stop${itin.total_stops > 1 ? 's' : ''}`
  const viaAirports = itin.total_stops > 0
    ? itin.segments.slice(0, -1).map(s => s.arrival_airport).join(', ')
    : null

  return (
    <div className="bg-bg-secondary border border-border hover:border-border-light rounded-xl transition-all overflow-hidden">
      <div className="flex items-stretch">
        <div className="flex-1 p-4 md:p-5">
          {/* Airline row */}
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src={`https://pics.avs.io/36/36/${mainAirline}.png`}
              alt=""
              className="w-7 h-7 rounded"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-xs text-text-secondary font-medium">
              {firstSeg.airline_name}
              {itin.airlines_involved.length > 1 && (
                <span className="text-text-muted"> + {itin.airlines_involved.length - 1} other</span>
              )}
            </span>
            {itin.segments.map((seg, i) => (
              <span key={i} className="text-[10px] text-text-muted font-mono">
                {seg.flight_number}{i < itin.segments.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>

          {/* Time / Route / Duration row */}
          <div className="flex items-center gap-4">
            <div className="text-left min-w-[60px]">
              <p className="text-xl font-bold text-text-primary font-mono leading-tight">
                {formatTime(firstSeg.departure_time)}
              </p>
              <p className="text-xs text-text-muted font-mono">{firstSeg.departure_airport}</p>
            </div>

            <div className="flex-1 flex flex-col items-center px-2">
              <span className="text-[11px] text-text-muted mb-1">
                {formatDurationMins(itin.total_duration_minutes)}
              </span>
              <div className="relative w-full flex items-center">
                <div className="h-[2px] w-full bg-border rounded" />
                {itin.total_stops > 0 && itin.segments.slice(0, -1).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-accent border-2 border-bg-secondary"
                    style={{ left: `${((i + 1) / itin.segments.length) * 100}%`, transform: 'translateX(-50%)' }}
                  />
                ))}
              </div>
              <span className={`text-[11px] mt-1 ${itin.total_stops === 0 ? 'text-emerald-400 font-medium' : 'text-text-muted'}`}>
                {stopsLabel}
                {viaAirports && <span className="text-text-muted"> via {viaAirports}</span>}
              </span>
            </div>

            <div className="text-right min-w-[60px]">
              <p className="text-xl font-bold text-text-primary font-mono leading-tight">
                {formatTime(lastSeg.arrival_time)}
              </p>
              <p className="text-xs text-text-muted font-mono">{lastSeg.arrival_airport}</p>
            </div>
          </div>

          {/* Multi-airline warning */}
          {itin.airlines_involved.length > 1 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-[10px] text-amber-400 flex items-center gap-1 mb-1.5">
                <AlertTriangle className="w-3 h-3" />
                Separate bookings — book each leg:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {itin.booking_links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-medium text-accent bg-accent/5 hover:bg-accent/10 border border-accent/20 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                  >
                    {link.airline}: {itin.segments[link.segment_index]?.departure_airport}→{itin.segments[link.segment_index]?.arrival_airport}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {itin.risk_warnings.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {itin.risk_warnings.map((w, i) => (
                <p key={i} className="text-[10px] text-amber-400/80 flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 mt-px shrink-0" /> {w}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Price + Book column */}
        <div className="flex flex-col items-center justify-center bg-bg-primary/30 border-l border-border px-5 py-4 min-w-[150px]">
          <p className="text-2xl font-bold text-text-primary font-mono leading-tight">
            {formatPrice(itin.total_price, itin.currency)}
          </p>
          <a
            href={
              itin.deep_link ||
              buildKiwiUrl(firstSeg.departure_airport, lastSeg.arrival_airport, departureDate, returnDate || undefined)
            }
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            Select →
          </a>
          <a
            href={buildSkyscannerUrl(firstSeg.departure_airport, lastSeg.arrival_airport, departureDate, returnDate || undefined)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 text-[10px] text-text-muted hover:text-accent transition-colors"
          >
            Compare on Skyscanner
          </a>
        </div>
      </div>
    </div>
  )
}

// ============================
// MAIN COMPONENT
// ============================
export default function SearchPage() {
  const [fromAirport, setFromAirport] = useState<AirportOption | null>(null)
  const [toAirport, setToAirport] = useState<AirportOption | null>(null)
  const [departureDate, setDepartureDate] = useState(todayISO())
  const [returnDate, setReturnDate] = useState('')
  const [cabinClass, setCabinClass] = useState<CabinClass>('M')
  const [passengers, setPassengers] = useState(1)

  const [results, setResults] = useState<NormalizedItinerary[]>([])
  const [demoResults, setDemoResults] = useState<ReturnType<typeof generateDemoItineraries>>([])
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('best_value')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [nextRefresh, setNextRefresh] = useState<number>(0)

  const refreshTimerRef = useRef<ReturnType<typeof setInterval>>()
  const countdownRef = useRef<ReturnType<typeof setInterval>>()
  const searchParamsRef = useRef<{ from: string; to: string; dep: string; ret: string; cabin: CabinClass; pax: number } | null>(null)

  const currCode = getCurrencyCode()
  const isReturn = returnDate.length > 0

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

  const startRefreshTimer = () => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    setNextRefresh(REFRESH_INTERVAL / 1000)
    countdownRef.current = setInterval(() => {
      setNextRefresh((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
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

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const handleSwap = () => {
    const tmp = fromAirport
    setFromAirport(toAirport)
    setToAirport(tmp)
  }

  const sortedResults = useMemo(() => sortResults(results, sortBy), [results, sortBy])
  const sortedDemoResults = useMemo(() => sortDemo(demoResults, sortBy), [demoResults, sortBy])
  const resultCount = isDemo ? sortedDemoResults.length : sortedResults.length

  const refreshMin = Math.floor(nextRefresh / 60)
  const refreshSec = nextRefresh % 60

  // Summary stats for sort tabs
  const cheapestPrice = isDemo
    ? (demoResults.length > 0 ? Math.min(...demoResults.map(r => r.total_price)) : 0)
    : (results.length > 0 ? Math.min(...results.map(r => r.price)) : 0)
  const cheapestCurrency = isDemo ? (demoResults[0]?.currency || 'EUR') : (results[0]?.currency || currCode)
  const fastestDuration = isDemo
    ? (demoResults.length > 0 ? Math.min(...demoResults.map(r => r.total_duration_minutes)) : 0)
    : (results.length > 0 ? Math.min(...results.map(r => r.totalDurationSeconds)) : 0)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* SEARCH FORM */}
      <form onSubmit={handleSearch} className="bg-bg-secondary border border-border rounded-xl p-4 md:p-5">
        <div className="flex items-end gap-2 flex-wrap">
          <AirportAutocomplete label="From" value={fromAirport} onChange={setFromAirport} placeholder="City or airport code" />
          <button type="button" onClick={handleSwap} className="mb-1 p-2 rounded-lg text-text-muted hover:text-accent hover:bg-bg-tertiary transition-colors" title="Swap">
            <ArrowRightLeft className="w-4 h-4" />
          </button>
          <AirportAutocomplete label="To" value={toAirport} onChange={setToAirport} placeholder="City or airport code" />
        </div>

        <div className="flex items-end gap-2 flex-wrap mt-3">
          <div className="flex-1 min-w-[130px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">Departure</label>
            <div className="relative">
              <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} min={todayISO()}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-transparent focus:outline-none focus:border-accent/50 cursor-pointer" style={{ colorScheme: 'dark' }} />
              <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                <span className="text-sm font-mono text-text-primary">{departureDate ? formatDisplayDate(departureDate) : datePlaceholder}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[130px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">Return <span className="text-text-muted/50">(optional)</span></label>
            <div className="relative">
              <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={departureDate || todayISO()}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-transparent focus:outline-none focus:border-accent/50 cursor-pointer" style={{ colorScheme: 'dark' }} />
              <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                <span className={`text-sm font-mono ${returnDate ? 'text-text-primary' : 'text-accent/60'}`}>{returnDate ? formatDisplayDate(returnDate) : 'One-way'}</span>
              </div>
            </div>
          </div>

          <div className="min-w-[130px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">Class</label>
            <div className="relative">
              <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/50 appearance-none pr-7">
                {CABIN_CLASSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
          </div>

          <div className="min-w-[90px]">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1">Passengers</label>
            <div className="relative">
              <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full bg-bg-primary border border-border rounded-lg pl-8 pr-7 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent/50 appearance-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <p className="flex items-center gap-1.5 text-[10px] text-text-muted">
            <MapPin className="w-3 h-3" />
            {!isReturn ? 'One-way trip' : 'Round trip'} · {currCode}
          </p>
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
                  {opt.key === 'cheapest' && searched && cheapestPrice > 0 && (
                    <span className="block text-[10px] opacity-80">{formatPrice(cheapestPrice, cheapestCurrency)}</span>
                  )}
                  {opt.key === 'fastest' && searched && fastestDuration > 0 && (
                    <span className="block text-[10px] opacity-80">{isDemo ? formatDurationMins(fastestDuration) : formatDuration(fastestDuration)}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {isDemo && (
                <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
                  <Info className="w-3 h-3" /> Demo
                </span>
              )}
              {lastUpdated && (
                <span className="text-[10px] text-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />{refreshMin}:{String(refreshSec).padStart(2, '0')}
                </span>
              )}
              <button onClick={handleManualRefresh} disabled={loading} className="text-text-muted hover:text-accent transition-colors disabled:opacity-50" title="Refresh">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <span className="text-[10px] text-text-muted font-mono">{resultCount} results</span>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12 gap-2">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
              <span className="text-sm text-text-muted">Searching flights...</span>
            </div>
          )}

          {!isDemo && !loading && sortedResults.map((itin) => (
            <FlightCard key={itin.id} itin={itin} currency={currCode} departureDate={departureDate} returnDate={returnDate} cabinClass={cabinClass} passengers={passengers} />
          ))}

          {isDemo && !loading && sortedDemoResults.map((itin) => (
            <DemoFlightCard key={itin.id} itin={itin} departureDate={departureDate} returnDate={returnDate} cabinClass={cabinClass} passengers={passengers} />
          ))}

          {!loading && resultCount === 0 && (
            <div className="text-center py-10">
              <Plane className="w-6 h-6 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No flights found for this route.</p>
              <p className="text-xs text-text-muted mt-1">Try different dates or nearby airports.</p>
            </div>
          )}
        </div>
      )}

      {!searched && !loading && (
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
