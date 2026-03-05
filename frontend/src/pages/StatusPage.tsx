import { useState } from 'react'
import { Search, Plane, Clock, MapPin, Wind, Thermometer, Droplets, AlertTriangle, CheckCircle2, XCircle, Navigation } from 'lucide-react'
import { getFlightStatus, type FlightStatus } from '../data/demoData'
import FlightMap from '../components/maps/FlightMap'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  on_time: { label: 'On Time', color: 'text-status-ontime', bg: 'bg-status-ontime/15' },
  delayed: { label: 'Delayed', color: 'text-status-minor-delay', bg: 'bg-status-minor-delay/15' },
  cancelled: { label: 'Cancelled', color: 'text-status-cancelled', bg: 'bg-status-cancelled/15' },
  landed: { label: 'Landed', color: 'text-status-landed', bg: 'bg-status-landed/15' },
  in_air: { label: 'In Air', color: 'text-status-in-air', bg: 'bg-status-in-air/15' },
  boarding: { label: 'Boarding', color: 'text-status-boarding', bg: 'bg-status-boarding/15' },
  scheduled: { label: 'Scheduled', color: 'text-text-secondary', bg: 'bg-bg-tertiary' },
}

function formatTime(iso: string | null) {
  if (!iso) return '--:--'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function WeatherCard({ label, weather }: { label: string; weather: FlightStatus['departure_weather'] }) {
  return (
    <div className="bg-bg-tertiary/50 rounded-lg p-3">
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-status-minor-delay" />
          <span className="font-mono text-sm">{weather.temperature_c}°C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-status-in-air" />
          <span className="font-mono text-sm">{weather.wind_speed_kmh} km/h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets className="w-3.5 h-3.5 text-accent" />
          <span className="font-mono text-sm">{weather.humidity}%</span>
        </div>
      </div>
      <p className="text-xs text-text-muted mt-1">{weather.condition}</p>
    </div>
  )
}

export default function StatusPage() {
  const [query, setQuery] = useState('')
  const [flight, setFlight] = useState<FlightStatus | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setFlight(getFlightStatus(query.trim()))
    }
  }

  const status = flight ? statusConfig[flight.status] || statusConfig.scheduled : null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
        <div className="flex items-center bg-bg-secondary border border-border rounded-xl overflow-hidden focus-within:border-accent transition-colors shadow-lg">
          <div className="pl-4">
            <Search className="w-5 h-5 text-text-muted" />
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter flight number (e.g. EK203, TK762, FR1234)"
            className="flex-1 bg-transparent px-3 py-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none font-mono"
          />
          <button
            type="submit"
            className="bg-accent hover:bg-accent-hover text-white px-6 py-3.5 text-sm font-semibold transition-colors"
          >
            Track
          </button>
        </div>
        <p className="text-xs text-text-muted text-center mt-2">
          Try: <button type="button" onClick={() => { setQuery('EK203'); setFlight(getFlightStatus('EK203')) }} className="text-accent hover:underline">EK203</button>
          {' · '}
          <button type="button" onClick={() => { setQuery('TK762'); setFlight(getFlightStatus('TK762')) }} className="text-accent hover:underline">TK762</button>
          {' · '}
          <button type="button" onClick={() => { setQuery('FR1234'); setFlight(getFlightStatus('FR1234')) }} className="text-accent hover:underline">FR1234</button>
        </p>
      </form>

      {/* Flight Result */}
      {flight && status && (
        <div className="space-y-4 animate-fade-in">
          {/* Status Header */}
          <div className="bg-bg-secondary border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-bold">{flight.flight_number}</span>
                <span className="text-sm text-text-secondary">{flight.airline_name}</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg}`}>
                {flight.status === 'in_air' && <Navigation className={`w-4 h-4 ${status.color}`} />}
                {flight.status === 'on_time' && <CheckCircle2 className={`w-4 h-4 ${status.color}`} />}
                {flight.status === 'delayed' && <AlertTriangle className={`w-4 h-4 ${status.color}`} />}
                {flight.status === 'cancelled' && <XCircle className={`w-4 h-4 ${status.color}`} />}
                {flight.status === 'landed' && <CheckCircle2 className={`w-4 h-4 ${status.color}`} />}
                {flight.status === 'boarding' && <Plane className={`w-4 h-4 ${status.color}`} />}
                <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
                {flight.delay_minutes > 0 && (
                  <span className="text-sm font-mono text-status-minor-delay">+{flight.delay_minutes}m</span>
                )}
              </div>
            </div>

            {/* Route Timeline */}
            <div className="flex items-center gap-4">
              {/* Departure */}
              <div className="flex-1">
                <p className="font-mono text-3xl font-bold">{flight.departure_airport}</p>
                <p className="text-xs text-text-secondary mt-0.5">{flight.departure_airport_name}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-text-muted" />
                    <span className="text-xs text-text-muted">Scheduled:</span>
                    <span className="font-mono text-sm">{formatTime(flight.scheduled_departure)}</span>
                  </div>
                  {flight.actual_departure && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-accent" />
                      <span className="text-xs text-accent">Actual:</span>
                      <span className="font-mono text-sm text-accent">{formatTime(flight.actual_departure)}</span>
                    </div>
                  )}
                  {flight.terminal && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-text-muted" />
                      <span className="text-xs text-text-muted">Terminal {flight.terminal}, Gate {flight.gate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Flight Path Visualization */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <Plane className="w-5 h-5 text-accent -rotate-0 shrink-0" />
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-text-muted">{flight.aircraft_type}</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted mt-0.5">{flight.aircraft_registration}</span>
              </div>

              {/* Arrival */}
              <div className="flex-1 text-right">
                <p className="font-mono text-3xl font-bold">{flight.arrival_airport}</p>
                <p className="text-xs text-text-secondary mt-0.5">{flight.arrival_airport_name}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-text-muted">Scheduled:</span>
                    <span className="font-mono text-sm">{formatTime(flight.scheduled_arrival)}</span>
                  </div>
                  {flight.actual_arrival && (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-accent">Actual:</span>
                      <span className="font-mono text-sm text-accent">{formatTime(flight.actual_arrival)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delay Reason */}
            {flight.delay_reason && (
              <div className="mt-4 flex items-center gap-2 bg-status-minor-delay/10 text-status-minor-delay px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-sm">{flight.delay_reason}</span>
              </div>
            )}
          </div>

          {/* Map + Weather Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Map */}
            <div className="lg:col-span-2 bg-bg-secondary border border-border rounded-xl overflow-hidden" style={{ height: 350 }}>
              <FlightMap flight={flight} />
            </div>

            {/* Weather + Info */}
            <div className="space-y-4">
              <div className="bg-bg-secondary border border-border rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Weather</h3>
                <WeatherCard label={`${flight.departure_airport} Departure`} weather={flight.departure_weather} />
                <WeatherCard label={`${flight.arrival_airport} Arrival`} weather={flight.arrival_weather} />
              </div>

              {flight.status === 'in_air' && flight.altitude && (
                <div className="bg-bg-secondary border border-border rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Live Data</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-text-muted">Altitude</p>
                      <p className="font-mono text-lg font-bold">{(flight.altitude / 1000).toFixed(1)}k ft</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted">Speed</p>
                      <p className="font-mono text-lg font-bold">{flight.speed} kts</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted">Heading</p>
                      <p className="font-mono text-lg font-bold">{flight.heading}°</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted">Position</p>
                      <p className="font-mono text-xs">{flight.latitude?.toFixed(2)}°, {flight.longitude?.toFixed(2)}°</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!flight && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-secondary border border-border mb-4">
            <Plane className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-lg font-semibold text-text-secondary mb-1">Track any flight in real-time</h2>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Enter a flight number to see live status, position on map, weather conditions, and more.
          </p>
        </div>
      )}
    </div>
  )
}
