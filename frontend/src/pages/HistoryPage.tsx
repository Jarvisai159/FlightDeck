import { useState, useCallback } from 'react'
import {
  PlaneLanding,
  PlaneTakeoff,
  Search,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Info,
} from 'lucide-react'
import AirportAutocomplete from '../components/ui/AirportAutocomplete'
import type { AirportOption } from '../data/airports'

interface FlightRecord {
  flight_number: string
  airline: string
  airline_iata: string
  origin: string
  origin_name: string
  destination: string
  destination_name: string
  scheduled: string
  actual: string | null
  estimated: string | null
  status: string
  terminal: string | null
  gate: string | null
  delay_minutes: number
}

type TabType = 'arrivals' | 'departures'
type SortField = 'scheduled' | 'flight_number' | 'airline' | 'status'

export default function HistoryPage() {
  const [airport, setAirport] = useState<AirportOption | null>(null)
  const [tab, setTab] = useState<TabType>('arrivals')
  const [flights, setFlights] = useState<FlightRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [sortField, setSortField] = useState<SortField>('scheduled')
  const [sortAsc, setSortAsc] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get date offsets for navigation
  const dateOffset = Math.round(
    (new Date(selectedDate).getTime() - new Date(new Date().toISOString().split('T')[0]).getTime()) / 86400000
  )

  const fetchFlights = useCallback(
    async (airportCode: string, type: TabType, date: string) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/history?airport=${encodeURIComponent(airportCode)}&type=${type}&date=${date}`
        )
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = await res.json()
        setFlights(data.flights || [])
        setIsDemo(data.isDemo || false)
        setSearched(true)
      } catch (err: any) {
        console.error('History fetch error:', err)
        setError('Failed to fetch flight data. Please try again.')
        setFlights([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const handleSearch = () => {
    if (!airport) return
    fetchFlights(airport.iata, tab, selectedDate)
  }

  const handleTabChange = (newTab: TabType) => {
    setTab(newTab)
    if (airport && searched) {
      fetchFlights(airport.iata, newTab, selectedDate)
    }
  }

  const handleDateChange = (offset: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + offset)
    const newDate = d.toISOString().split('T')[0]
    setSelectedDate(newDate)
    if (airport && searched) {
      fetchFlights(airport.iata, tab, newDate)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  // Sort flights
  const sortedFlights = [...flights].sort((a, b) => {
    let cmp = 0
    switch (sortField) {
      case 'scheduled':
        cmp = (a.scheduled || '').localeCompare(b.scheduled || '')
        break
      case 'flight_number':
        cmp = a.flight_number.localeCompare(b.flight_number)
        break
      case 'airline':
        cmp = a.airline.localeCompare(b.airline)
        break
      case 'status':
        cmp = a.status.localeCompare(b.status)
        break
    }
    return sortAsc ? cmp : -cmp
  })

  // Stats
  const totalFlights = flights.length
  const onTimeCount = flights.filter(
    (f) => f.status === 'Landed' && f.delay_minutes < 15 || f.status === 'Scheduled' || f.status === 'Departed' || f.status === 'Boarding' || f.status === 'Expected'
  ).length
  const delayedCount = flights.filter((f) => f.delay_minutes >= 15).length
  const cancelledCount = flights.filter((f) => f.status === 'Cancelled').length

  // Format time from ISO string
  const formatTime = (iso: string | null) => {
    if (!iso) return '—'
    try {
      const d = new Date(iso)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    } catch {
      return '—'
    }
  }

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000)

    const formatted = d.toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    if (diff === 0) return `Today, ${formatted}`
    if (diff === -1) return `Yesterday, ${formatted}`
    if (diff === 1) return `Tomorrow, ${formatted}`
    return formatted
  }

  // Status badge styles
  const getStatusStyle = (status: string, delay: number) => {
    if (status === 'Cancelled')
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' }
    if (status === 'Diverted')
      return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' }
    if (delay >= 30)
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' }
    if (delay >= 15)
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' }
    if (status === 'Landed' || status === 'Departed')
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' }
    if (status === 'In Air')
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' }
    if (status === 'Boarding' || status === 'Expected')
      return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' }
    return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' }
  }

  const getStatusLabel = (status: string, delay: number) => {
    if (status === 'Cancelled') return 'Cancelled'
    if (status === 'Diverted') return 'Diverted'
    if (delay >= 30) return `Delayed ${delay}m`
    if (delay >= 15) return `Delayed ${delay}m`
    if (delay > 0 && (status === 'Landed' || status === 'Departed')) return `${status} (+${delay}m)`
    return status
  }

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`w-3 h-3 inline ml-1 cursor-pointer transition-colors ${
        sortField === field ? 'text-accent' : 'text-text-muted hover:text-text-secondary'
      }`}
    />
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Search Bar */}
      <div className="bg-bg-secondary border border-border rounded-xl p-4 md:p-5">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <AirportAutocomplete
              label="Airport"
              value={airport}
              onChange={setAirport}
              placeholder="Enter airport name or code"
            />
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-1">
            <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider block mb-1 sr-only">
              Date
            </label>
            <button
              onClick={() => handleDateChange(-1)}
              className="p-2 bg-bg-primary border border-border rounded-md hover:bg-bg-hover transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4 text-text-muted" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                if (airport && searched) {
                  fetchFlights(airport.iata, tab, e.target.value)
                }
              }}
              className="bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50"
            />
            <button
              onClick={() => handleDateChange(1)}
              className="p-2 bg-bg-primary border border-border rounded-md hover:bg-bg-hover transition-colors"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          <button
            onClick={handleSearch}
            disabled={!airport || loading}
            className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
      </div>

      {/* Tabs: Arrivals / Departures */}
      {searched && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-bg-secondary border border-border rounded-lg p-1">
              <button
                onClick={() => handleTabChange('arrivals')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                  tab === 'arrivals'
                    ? 'bg-accent text-white'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
                }`}
              >
                <PlaneLanding className="w-4 h-4" />
                Arrivals
              </button>
              <button
                onClick={() => handleTabChange('departures')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                  tab === 'departures'
                    ? 'bg-accent text-white'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
                }`}
              >
                <PlaneTakeoff className="w-4 h-4" />
                Departures
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isDemo && (
                <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
                  <Info className="w-3 h-3" />
                  Demo Data
                </span>
              )}
              <button
                onClick={handleSearch}
                disabled={loading}
                className="text-text-muted hover:text-accent transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Date Display */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-secondary">
              <span className="text-text-muted">{airport?.city} ({airport?.iata})</span>
              {' '} — {formatDisplayDate(selectedDate)}
            </h2>
            <p className="text-xs text-text-muted">
              {totalFlights} flights
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Total"
              value={totalFlights}
              icon={<Clock className="w-4 h-4" />}
              color="text-accent"
            />
            <StatCard
              label="On Time"
              value={onTimeCount}
              icon={<CheckCircle2 className="w-4 h-4" />}
              color="text-emerald-400"
            />
            <StatCard
              label="Delayed"
              value={delayedCount}
              icon={<AlertTriangle className="w-4 h-4" />}
              color="text-amber-400"
            />
            <StatCard
              label="Cancelled"
              value={cancelledCount}
              icon={<XCircle className="w-4 h-4" />}
              color="text-red-400"
            />
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Flights Table */}
          {loading ? (
            <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
              <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-3" />
              <p className="text-sm text-text-muted">Loading flight data...</p>
            </div>
          ) : sortedFlights.length > 0 ? (
            <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-bg-primary/50">
                      <th
                        className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-colors"
                        onClick={() => handleSort('flight_number')}
                      >
                        Flight <SortIcon field="flight_number" />
                      </th>
                      <th
                        className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-colors"
                        onClick={() => handleSort('airline')}
                      >
                        Airline <SortIcon field="airline" />
                      </th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                        {tab === 'arrivals' ? 'From' : 'To'}
                      </th>
                      <th
                        className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-colors"
                        onClick={() => handleSort('scheduled')}
                      >
                        Scheduled <SortIcon field="scheduled" />
                      </th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                        Actual
                      </th>
                      <th
                        className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-secondary transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        Status <SortIcon field="status" />
                      </th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                        Terminal
                      </th>
                      <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                        Gate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFlights.map((flight, idx) => {
                      const style = getStatusStyle(flight.status, flight.delay_minutes)
                      const statusLabel = getStatusLabel(flight.status, flight.delay_minutes)
                      return (
                        <tr
                          key={`${flight.flight_number}-${idx}`}
                          className="border-b border-border/50 hover:bg-bg-hover/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono font-semibold text-accent">
                              {flight.flight_number}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={`https://pics.avs.io/28/28/${flight.airline_iata}.png`}
                                alt=""
                                className="w-5 h-5 rounded"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                              <span className="text-text-secondary text-xs truncate max-w-[120px]">
                                {flight.airline}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-text-primary font-semibold">
                              {tab === 'arrivals' ? flight.origin : flight.destination}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs text-text-secondary">
                              {formatTime(flight.scheduled)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-mono text-xs ${
                                flight.delay_minutes >= 15
                                  ? 'text-amber-400'
                                  : flight.delay_minutes >= 30
                                    ? 'text-red-400'
                                    : 'text-text-secondary'
                              }`}
                            >
                              {formatTime(flight.actual || flight.estimated)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}
                            >
                              {flight.status === 'Cancelled' && <XCircle className="w-2.5 h-2.5" />}
                              {flight.status === 'Landed' && flight.delay_minutes < 15 && (
                                <CheckCircle2 className="w-2.5 h-2.5" />
                              )}
                              {flight.delay_minutes >= 15 && flight.status !== 'Cancelled' && (
                                <AlertTriangle className="w-2.5 h-2.5" />
                              )}
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-text-muted">{flight.terminal || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-text-muted font-mono">{flight.gate || '—'}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-bg-secondary border border-border rounded-xl p-12 text-center">
              <p className="text-sm text-text-muted">No flights found for this date.</p>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!searched && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-secondary border border-border mb-4">
            <PlaneLanding className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-lg font-semibold text-text-secondary mb-1">Airport arrivals & departures</h2>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Enter an airport name or code to view all arrivals and departures with real-time status, delays, and gate information.
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <p className={`font-mono text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
