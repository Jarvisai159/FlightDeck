// Train journey search API service — calls Vercel serverless functions (DB transport REST proxy)

export interface NormalizedLeg {
  origin: string
  originId: string
  destination: string
  destinationId: string
  departure: string   // ISO datetime
  arrival: string     // ISO datetime
  durationSeconds: number
  product: string     // ICE, TGV, Eurostar, IC, RE, etc.
  lineName: string    // e.g. "ICE 1044"
  operator: string    // e.g. "DB Fernverkehr AG"
  platform: string
  walking: boolean
}

export interface NormalizedJourney {
  id: string
  price: number | null
  currency: string
  legs: NormalizedLeg[]
  totalDurationSeconds: number
  changes: number         // non-walking legs minus 1
  departure: string       // first leg departure
  arrival: string         // last leg arrival
  origin: string
  destination: string
  operators: string[]
  products: string[]      // unique product types used
}

// Parse ISO duration or compute from departure/arrival
function computeDuration(dep: string, arr: string): number {
  try {
    return (new Date(arr).getTime() - new Date(dep).getTime()) / 1000
  } catch {
    return 0
  }
}

// Normalize a DB transport REST journey into our UI format
function normalizeJourney(journey: any, index: number): NormalizedJourney {
  const legs: NormalizedLeg[] = (journey.legs || []).map((leg: any) => {
    const dep = leg.departure || leg.plannedDeparture || ''
    const arr = leg.arrival || leg.plannedArrival || ''
    return {
      origin: leg.origin?.name || '?',
      originId: leg.origin?.id || '',
      destination: leg.destination?.name || '?',
      destinationId: leg.destination?.id || '',
      departure: dep,
      arrival: arr,
      durationSeconds: computeDuration(dep, arr),
      product: leg.line?.productName || (leg.walking ? 'Transfer' : ''),
      lineName: leg.line?.name || '',
      operator: leg.line?.operator?.name || '',
      platform: leg.departurePlatform || leg.plannedDeparturePlatform || '',
      walking: leg.walking || false,
    }
  })

  // Filter out walking legs for counting changes
  const trainLegs = legs.filter((l) => !l.walking)
  const changes = Math.max(0, trainLegs.length - 1)

  const firstLeg = legs[0]
  const lastLeg = legs[legs.length - 1]
  const totalDuration = computeDuration(firstLeg?.departure || '', lastLeg?.arrival || '')

  const operators = [...new Set(trainLegs.map((l) => l.operator).filter(Boolean))]
  const products = [...new Set(trainLegs.map((l) => l.product).filter(Boolean))]

  const price = journey.price?.amount ?? null
  const currency = journey.price?.currency || 'EUR'

  return {
    id: `journey-${index}`,
    price,
    currency,
    legs,
    totalDurationSeconds: totalDuration,
    changes,
    departure: firstLeg?.departure || '',
    arrival: lastLeg?.arrival || '',
    origin: firstLeg?.origin || '',
    destination: lastLeg?.destination || '',
    operators,
    products,
  }
}

// --- API calls ---
export interface TrainSearchParams {
  fromId: string
  toId: string
  departure: string   // ISO datetime
  results?: number
}

export async function searchTrains(params: TrainSearchParams): Promise<{
  journeys: NormalizedJourney[]
  totalResults: number
}> {
  const qs = new URLSearchParams({
    from: params.fromId,
    to: params.toId,
    departure: params.departure,
    results: String(params.results ?? 10),
  })

  const res = await fetch(`/api/trains?${qs.toString()}`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Search failed' }))
    throw new Error(err.error || `Search failed (${res.status})`)
  }

  const data = await res.json()
  const journeys = (data.journeys || []).map(normalizeJourney)

  return {
    journeys,
    totalResults: journeys.length,
  }
}
