// Flight search API service — calls Vercel serverless functions (Amadeus API proxy)
import type { AirportOption } from '../data/airports'

// --- Amadeus API response types ---
interface AmadeusSegment {
  departure: { iataCode: string; terminal?: string; at: string }
  arrival: { iataCode: string; terminal?: string; at: string }
  carrierCode: string
  number: string
  operating?: { carrierCode: string }
  duration: string // ISO 8601 duration, e.g. "PT8H30M"
  numberOfStops: number
}

interface AmadeusItinerary {
  duration: string
  segments: AmadeusSegment[]
}

interface AmadeusFlightOffer {
  id: string
  source: string
  instantTicketingRequired: boolean
  numberOfBookableSeats: number
  itineraries: AmadeusItinerary[]
  price: {
    currency: string
    total: string
    base: string
    grandTotal: string
  }
  validatingAirlineCodes: string[]
  travelerPricings: any[]
}

interface AmadeusResponse {
  data: AmadeusFlightOffer[]
  dictionaries?: {
    carriers?: Record<string, string>
    aircraft?: Record<string, string>
    currencies?: Record<string, string>
  }
  meta?: { count: number }
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

// --- Airline name lookup ---
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
  UX: 'Air Europa', SK: 'SAS', AY: 'Finnair', LO: 'LOT Polish',
  DY: 'Norwegian', BT: 'airBaltic',
}

function getAirlineName(code: string, dictionaries?: Record<string, string>): string {
  // Try Amadeus dictionary first, then our local map
  if (dictionaries?.[code]) return dictionaries[code]
  return AIRLINE_NAMES[code] || code
}

// Parse ISO 8601 duration (PT8H30M) to seconds
function parseDuration(iso: string): number {
  if (!iso) return 0
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  return hours * 3600 + minutes * 60
}

// Build a Google Flights booking link (since Amadeus doesn't provide deep links)
function buildBookingLink(from: string, to: string, date: string, airlines: string[]): string {
  const airline = airlines[0] || ''
  return `https://www.google.com/travel/flights?q=flights+from+${from}+to+${to}+on+${date}+${airline}`
}

// Normalize Amadeus response into our UI format
export function normalizeAmadeusResults(data: AmadeusResponse): NormalizedItinerary[] {
  const carriers = data.dictionaries?.carriers || {}

  return data.data.map((offer) => {
    // We only use the first itinerary (outbound) for one-way; for return trips Amadeus includes both
    const outbound = offer.itineraries[0]
    const segments: NormalizedSegment[] = outbound.segments.map((seg) => {
      const durationSec = parseDuration(seg.duration)
      return {
        airline: seg.carrierCode,
        airlineName: getAirlineName(seg.carrierCode, carriers),
        flightNumber: `${seg.carrierCode}${seg.number}`,
        from: seg.departure.iataCode,
        fromCity: seg.departure.iataCode, // Amadeus doesn't return city names in search
        to: seg.arrival.iataCode,
        toCity: seg.arrival.iataCode,
        departureTime: seg.departure.at,
        arrivalTime: seg.arrival.at,
        durationSeconds: durationSec,
      }
    })

    const uniqueAirlines = [...new Set(outbound.segments.map((s) => s.carrierCode))]
    const totalDuration = parseDuration(outbound.duration)
    const price = parseFloat(offer.price.grandTotal || offer.price.total)
    const firstSeg = outbound.segments[0]
    const lastSeg = outbound.segments[outbound.segments.length - 1]

    return {
      id: offer.id,
      price,
      currency: offer.price.currency,
      deepLink: buildBookingLink(
        firstSeg.departure.iataCode,
        lastSeg.arrival.iataCode,
        firstSeg.departure.at.split('T')[0],
        uniqueAirlines,
      ),
      totalDurationSeconds: totalDuration,
      stops: outbound.segments.length - 1,
      airlines: uniqueAirlines,
      segments,
      quality: price / (totalDuration / 3600), // price per hour as quality metric
      seatsLeft: offer.numberOfBookableSeats || null,
      bagsPrice: {},
      isMultiAirline: uniqueAirlines.length > 1,
      from: firstSeg.departure.iataCode,
      to: lastSeg.arrival.iataCode,
      fromCity: firstSeg.departure.iataCode,
      toCity: lastSeg.arrival.iataCode,
    }
  })
}

// --- API calls ---
export interface SearchParams {
  flyFrom: string
  flyTo: string
  dateFrom: string   // YYYY-MM-DD
  dateTo?: string    // YYYY-MM-DD (optional for return)
  maxStopovers?: number
  currency?: string
  adults?: number
  limit?: number
  sort?: 'quality' | 'price' | 'duration' | 'date'
  cabin?: string     // ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
}

// Map our cabin codes to Amadeus travelClass
const CABIN_MAP: Record<string, string> = {
  M: 'ECONOMY',
  W: 'PREMIUM_ECONOMY',
  C: 'BUSINESS',
  F: 'FIRST',
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
    curr: params.currency || 'USD',
    adults: String(params.adults ?? 1),
    limit: String(params.limit ?? 15),
    cabin: CABIN_MAP[params.cabin || 'M'] || 'ECONOMY',
  })

  const res = await fetch(`/api/search?${qs.toString()}`)

  if (res.status === 503) {
    // API credentials not configured
    return { results: [], currency: params.currency || 'USD', totalResults: 0, isDemo: true }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Search failed' }))
    throw new Error(err.error || `Search failed (${res.status})`)
  }

  const data: AmadeusResponse = await res.json()
  const results = normalizeAmadeusResults(data)

  return {
    results,
    currency: data.data?.[0]?.price?.currency || params.currency || 'USD',
    totalResults: data.meta?.count || results.length,
    isDemo: false,
  }
}

// Search airports via API (uses built-in database on server)
export async function searchAirportsAPI(term: string): Promise<AirportOption[]> {
  if (term.length < 1) return []

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
