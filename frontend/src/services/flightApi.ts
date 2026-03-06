// Flight search API service — calls Vercel serverless functions (Kiwi Tequila proxy)
import type { AirportOption } from '../data/airports'

// --- Kiwi API response types ---
export interface KiwiRouteSegment {
  flyFrom: string
  flyTo: string
  cityFrom: string
  cityTo: string
  airline: string
  operating_carrier: string
  flight_no: number
  local_departure: string
  local_arrival: string
  utc_departure: string
  utc_arrival: string
}

export interface KiwiFlightResult {
  id: string
  flyFrom: string
  flyTo: string
  cityFrom: string
  cityTo: string
  countryFrom: { code: string; name: string }
  countryTo: { code: string; name: string }
  price: number
  deep_link: string
  route: KiwiRouteSegment[]
  duration: { departure: number; return: number; total: number }
  quality: number
  airlines: string[]
  availability: { seats: number | null }
  bags_price: Record<string, number>
  booking_token: string
}

export interface KiwiSearchResponse {
  data: KiwiFlightResult[]
  currency: string
  _results: number
  search_id: string
}

// --- Normalized types for the UI ---
export interface NormalizedSegment {
  airline: string
  airlineName: string
  flightNumber: string
  from: string
  fromCity: string
  to: string
  toCity: string
  departureTime: string
  arrivalTime: string
  durationSeconds: number
}

export interface NormalizedItinerary {
  id: string
  price: number
  currency: string
  deepLink: string
  totalDurationSeconds: number
  stops: number
  airlines: string[]
  segments: NormalizedSegment[]
  quality: number
  seatsLeft: number | null
  bagsPrice: Record<string, number>
  isMultiAirline: boolean
  from: string
  to: string
  fromCity: string
  toCity: string
}

// Airline name lookup
const AIRLINE_NAMES: Record<string, string> = {
  EK: 'Emirates', TK: 'Turkish Airlines', FR: 'Ryanair', W6: 'Wizz Air',
  G9: 'Air Arabia', TP: 'TAP Portugal', FZ: 'flydubai', QR: 'Qatar Airways',
  '6E': 'IndiGo', SV: 'Saudia', LH: 'Lufthansa', BA: 'British Airways',
  AF: 'Air France', KL: 'KLM', LX: 'SWISS', OS: 'Austrian',
  AZ: 'ITA Airways', IB: 'Iberia', VY: 'Vueling', U2: 'easyJet',
  PC: 'Pegasus', SU: 'Aeroflot', EY: 'Etihad', WY: 'Oman Air',
  SQ: 'Singapore Airlines', CX: 'Cathay Pacific', QF: 'Qantas', NH: 'ANA',
  JL: 'Japan Airlines', KE: 'Korean Air', OZ: 'Asiana', TG: 'Thai Airways',
  AI: 'Air India', PK: 'PIA', ET: 'Ethiopian', MS: 'EgyptAir',
  AT: 'Royal Air Maroc', RJ: 'Royal Jordanian', GF: 'Gulf Air',
  WN: 'Southwest', DL: 'Delta', AA: 'American Airlines', UA: 'United',
  AC: 'Air Canada', AM: 'Aeromexico', LA: 'LATAM', AV: 'Avianca',
  UX: 'Air Europa', S7: 'S7 Airlines', SK: 'SAS', AY: 'Finnair',
  LO: 'LOT Polish', OK: 'Czech Airlines', RO: 'TAROM', JU: 'Air Serbia',
  HV: 'Transavia', DY: 'Norwegian', BT: 'airBaltic', W4: 'Wizz Air Malta',
}

function getAirlineName(code: string): string {
  return AIRLINE_NAMES[code] || code
}

// Normalize a Kiwi response into our UI-friendly format
export function normalizeResults(data: KiwiSearchResponse): NormalizedItinerary[] {
  return data.data.map((flight) => {
    const segments: NormalizedSegment[] = flight.route.map((seg) => ({
      airline: seg.airline,
      airlineName: getAirlineName(seg.airline),
      flightNumber: `${seg.airline}${seg.flight_no}`,
      from: seg.flyFrom,
      fromCity: seg.cityFrom,
      to: seg.flyTo,
      toCity: seg.cityTo,
      departureTime: seg.local_departure,
      arrivalTime: seg.local_arrival,
      durationSeconds: (new Date(seg.utc_arrival).getTime() - new Date(seg.utc_departure).getTime()) / 1000,
    }))

    const uniqueAirlines = [...new Set(flight.airlines)]

    return {
      id: flight.id,
      price: flight.price,
      currency: data.currency,
      deepLink: flight.deep_link,
      totalDurationSeconds: flight.duration.departure || flight.duration.total,
      stops: flight.route.length - 1,
      airlines: uniqueAirlines,
      segments,
      quality: flight.quality,
      seatsLeft: flight.availability?.seats ?? null,
      bagsPrice: flight.bags_price || {},
      isMultiAirline: uniqueAirlines.length > 1,
      from: flight.flyFrom,
      to: flight.flyTo,
      fromCity: flight.cityFrom,
      toCity: flight.cityTo,
    }
  })
}

// --- API calls ---
export interface SearchParams {
  flyFrom: string
  flyTo: string
  dateFrom: string // dd/mm/yyyy
  dateTo?: string
  maxStopovers?: number
  currency?: string
  adults?: number
  limit?: number
  sort?: 'quality' | 'price' | 'duration' | 'date'
}

export async function searchFlights(params: SearchParams): Promise<{
  results: NormalizedItinerary[]
  currency: string
  totalResults: number
  isDemo: boolean
}> {
  const qs = new URLSearchParams({
    fly_from: params.flyFrom,
    fly_to: params.flyTo,
    date_from: params.dateFrom,
    ...(params.dateTo && { date_to: params.dateTo }),
    max_stopovers: String(params.maxStopovers ?? 2),
    curr: params.currency || 'USD',
    adults: String(params.adults ?? 1),
    limit: String(params.limit ?? 20),
    sort: params.sort || 'quality',
  })

  const res = await fetch(`/api/search?${qs.toString()}`)

  if (res.status === 503) {
    // API key not configured — return demo flag
    return { results: [], currency: params.currency || 'USD', totalResults: 0, isDemo: true }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Search failed' }))
    throw new Error(err.error || `Search failed (${res.status})`)
  }

  const data: KiwiSearchResponse = await res.json()
  const results = normalizeResults(data)

  return {
    results,
    currency: data.currency,
    totalResults: data._results || results.length,
    isDemo: false,
  }
}

// Search airports via API
export async function searchAirportsAPI(term: string): Promise<AirportOption[]> {
  if (term.length < 2) return []

  const res = await fetch(`/api/locations?term=${encodeURIComponent(term)}&limit=8`)
  if (!res.ok) return []

  const data = await res.json()
  if (!data.locations) return []

  return data.locations
    .filter((loc: any) => loc.code && loc.type === 'airport')
    .map((loc: any) => ({
      iata: loc.code,
      name: loc.name || '',
      city: loc.city?.name || '',
      country: loc.city?.country?.name || loc.country?.name || '',
    }))
}
