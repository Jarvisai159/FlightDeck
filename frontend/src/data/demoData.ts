// All demo data for the frontend — works without any backend

export interface FlightStatus {
  flight_number: string
  airline_iata: string
  airline_name: string
  departure_airport: string
  departure_airport_name: string
  arrival_airport: string
  arrival_airport_name: string
  scheduled_departure: string
  scheduled_arrival: string
  actual_departure: string | null
  actual_arrival: string | null
  status: 'on_time' | 'delayed' | 'cancelled' | 'landed' | 'in_air' | 'boarding' | 'scheduled'
  delay_minutes: number
  delay_reason: string | null
  gate: string | null
  terminal: string | null
  aircraft_type: string
  aircraft_registration: string
  latitude: number | null
  longitude: number | null
  altitude: number | null
  heading: number | null
  speed: number | null
  departure_weather: { temperature_c: number; condition: string; wind_speed_kmh: number; humidity: number }
  arrival_weather: { temperature_c: number; condition: string; wind_speed_kmh: number; humidity: number }
}

export interface FlightPerformance {
  flight_number: string
  route: string
  period_days: number
  total_flights: number
  on_time_percentage: number
  average_delay_minutes: number
  cancellation_rate: number
  delay_distribution: { under_15: number; '15_to_30': number; '30_to_60': number; over_60: number }
  daily_performance: { date: string; status: string; delay: number }[]
  best_days: string[]
  worst_days: string[]
}

export interface FlightSegment {
  airline_iata: string
  airline_name: string
  flight_number: string
  departure_airport: string
  departure_airport_name: string
  arrival_airport: string
  arrival_airport_name: string
  departure_time: string
  arrival_time: string
  duration_minutes: number
  cabin_class: string
  on_time_percentage: number | null
  reliability_color: 'green' | 'amber' | 'red' | null
}

export interface Itinerary {
  id: string
  segments: FlightSegment[]
  total_price: number
  currency: string
  total_duration_minutes: number
  total_stops: number
  airlines_involved: string[]
  layover_durations: number[]
  best_value_score: number
  reliability_score: number
  booking_links: { airline: string; url: string; segment_index: number }[]
  source: string
  deep_link: string | null
  uses_nearby_airports: boolean
  nearby_airport_note: string | null
  risk_warnings: string[]
}

// --- Demo Flight Statuses ---
export const demoFlights: Record<string, FlightStatus> = {
  EK203: {
    flight_number: 'EK203',
    airline_iata: 'EK',
    airline_name: 'Emirates',
    departure_airport: 'DXB',
    departure_airport_name: 'Dubai International Airport',
    arrival_airport: 'LIS',
    arrival_airport_name: 'Lisbon Humberto Delgado Airport',
    scheduled_departure: '2026-03-05T08:30:00Z',
    scheduled_arrival: '2026-03-05T14:15:00Z',
    actual_departure: '2026-03-05T08:45:00Z',
    actual_arrival: null,
    status: 'in_air',
    delay_minutes: 15,
    delay_reason: 'Late arrival of incoming aircraft',
    gate: 'B22',
    terminal: '3',
    aircraft_type: 'Boeing 777-300ER',
    aircraft_registration: 'A6-EGO',
    latitude: 36.8,
    longitude: 10.5,
    altitude: 37000,
    heading: 305,
    speed: 485,
    departure_weather: { temperature_c: 28, condition: 'Clear', wind_speed_kmh: 12, humidity: 55 },
    arrival_weather: { temperature_c: 16, condition: 'Partly Cloudy', wind_speed_kmh: 20, humidity: 72 },
  },
  TK762: {
    flight_number: 'TK762',
    airline_iata: 'TK',
    airline_name: 'Turkish Airlines',
    departure_airport: 'DXB',
    departure_airport_name: 'Dubai International Airport',
    arrival_airport: 'IST',
    arrival_airport_name: 'Istanbul Airport',
    scheduled_departure: '2026-03-05T11:00:00Z',
    scheduled_arrival: '2026-03-05T15:30:00Z',
    actual_departure: null,
    actual_arrival: null,
    status: 'on_time',
    delay_minutes: 0,
    delay_reason: null,
    gate: 'A14',
    terminal: '1',
    aircraft_type: 'Airbus A330-300',
    aircraft_registration: 'TC-JNI',
    latitude: null,
    longitude: null,
    altitude: null,
    heading: null,
    speed: null,
    departure_weather: { temperature_c: 28, condition: 'Clear', wind_speed_kmh: 12, humidity: 55 },
    arrival_weather: { temperature_c: 8, condition: 'Overcast', wind_speed_kmh: 25, humidity: 80 },
  },
  FR1234: {
    flight_number: 'FR1234',
    airline_iata: 'FR',
    airline_name: 'Ryanair',
    departure_airport: 'STN',
    departure_airport_name: 'London Stansted Airport',
    arrival_airport: 'LIS',
    arrival_airport_name: 'Lisbon Humberto Delgado Airport',
    scheduled_departure: '2026-03-05T06:00:00Z',
    scheduled_arrival: '2026-03-05T09:00:00Z',
    actual_departure: '2026-03-05T06:55:00Z',
    actual_arrival: '2026-03-05T09:45:00Z',
    status: 'landed',
    delay_minutes: 45,
    delay_reason: 'Air traffic control restrictions',
    gate: '23',
    terminal: null,
    aircraft_type: 'Boeing 737-800',
    aircraft_registration: 'EI-DWL',
    latitude: 38.7813,
    longitude: -9.1359,
    altitude: 0,
    heading: 0,
    speed: 0,
    departure_weather: { temperature_c: 6, condition: 'Rain', wind_speed_kmh: 30, humidity: 88 },
    arrival_weather: { temperature_c: 16, condition: 'Partly Cloudy', wind_speed_kmh: 20, humidity: 72 },
  },
}

// Returns any flight - for unknown ones, generates demo data
export function getFlightStatus(flightNumber: string): FlightStatus {
  const upper = flightNumber.toUpperCase().replace(/\s/g, '')
  if (demoFlights[upper]) return demoFlights[upper]

  // Generate a plausible demo status for any flight number
  const statuses: FlightStatus['status'][] = ['in_air', 'on_time', 'delayed', 'boarding', 'landed']
  const hash = upper.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const status = statuses[hash % statuses.length]
  const delayMin = status === 'delayed' ? 20 + (hash % 40) : status === 'in_air' ? hash % 15 : 0

  return {
    flight_number: upper,
    airline_iata: upper.replace(/[0-9]/g, '').slice(0, 2) || 'XX',
    airline_name: `Airline ${upper.slice(0, 2)}`,
    departure_airport: 'DXB',
    departure_airport_name: 'Dubai International Airport',
    arrival_airport: 'LHR',
    arrival_airport_name: 'London Heathrow Airport',
    scheduled_departure: '2026-03-05T10:00:00Z',
    scheduled_arrival: '2026-03-05T15:30:00Z',
    actual_departure: status !== 'on_time' ? '2026-03-05T10:15:00Z' : null,
    actual_arrival: status === 'landed' ? '2026-03-05T15:45:00Z' : null,
    status,
    delay_minutes: delayMin,
    delay_reason: delayMin > 0 ? 'Weather conditions at origin' : null,
    gate: `${String.fromCharCode(65 + (hash % 6))}${10 + (hash % 30)}`,
    terminal: `${1 + (hash % 4)}`,
    aircraft_type: ['Boeing 777-300ER', 'Airbus A380-800', 'Boeing 787-9', 'Airbus A350-900'][hash % 4],
    aircraft_registration: `A6-${String.fromCharCode(65 + (hash % 26))}${String.fromCharCode(65 + ((hash + 1) % 26))}${String.fromCharCode(65 + ((hash + 2) % 26))}`,
    latitude: status === 'in_air' ? 35 + (hash % 15) : null,
    longitude: status === 'in_air' ? -5 + (hash % 40) : null,
    altitude: status === 'in_air' ? 30000 + (hash % 10000) : null,
    heading: status === 'in_air' ? hash % 360 : null,
    speed: status === 'in_air' ? 400 + (hash % 150) : null,
    departure_weather: { temperature_c: 25 + (hash % 15), condition: 'Clear', wind_speed_kmh: 10 + (hash % 20), humidity: 40 + (hash % 30) },
    arrival_weather: { temperature_c: 5 + (hash % 20), condition: 'Cloudy', wind_speed_kmh: 15 + (hash % 25), humidity: 50 + (hash % 35) },
  }
}

// --- Demo Performance Data ---
export function getFlightPerformance(flightNumber: string, days: number = 30): FlightPerformance {
  const daily = []
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const hash = (flightNumber.charCodeAt(0) + i * 7) % 10
    let status: string, delay: number
    if (hash < 5) { status = 'on_time'; delay = 0 }
    else if (hash < 7) { status = 'minor_delay'; delay = 10 + (hash * 3) }
    else if (hash < 9) { status = 'major_delay'; delay = 35 + (hash * 5) }
    else { status = 'cancelled'; delay = 0 }
    daily.push({ date: d.toISOString().split('T')[0], status, delay })
  }

  const onTime = daily.filter(d => d.status === 'on_time').length
  const cancelled = daily.filter(d => d.status === 'cancelled').length
  const totalDelay = daily.reduce((sum, d) => sum + d.delay, 0)

  return {
    flight_number: flightNumber.toUpperCase(),
    route: 'DXB → LIS',
    period_days: days,
    total_flights: days,
    on_time_percentage: Math.round((onTime / days) * 1000) / 10,
    average_delay_minutes: Math.round((totalDelay / days) * 10) / 10,
    cancellation_rate: Math.round((cancelled / days) * 1000) / 10,
    delay_distribution: { under_15: 48, '15_to_30': 22, '30_to_60': 18, over_60: 12 },
    daily_performance: daily.reverse(),
    best_days: ['Tuesday', 'Wednesday', 'Thursday'],
    worst_days: ['Friday', 'Sunday'],
  }
}

// --- Dynamic Demo Search Results Generator ---
// Generates realistic demo itineraries for ANY airport pair

interface AirlineInfo {
  iata: string
  name: string
  url: string
  hub?: string
}

const MAJOR_AIRLINES: AirlineInfo[] = [
  { iata: 'EK', name: 'Emirates', url: 'https://www.emirates.com', hub: 'DXB' },
  { iata: 'TK', name: 'Turkish Airlines', url: 'https://www.turkishairlines.com', hub: 'IST' },
  { iata: 'QR', name: 'Qatar Airways', url: 'https://www.qatarairways.com', hub: 'DOH' },
  { iata: 'LH', name: 'Lufthansa', url: 'https://www.lufthansa.com', hub: 'FRA' },
  { iata: 'BA', name: 'British Airways', url: 'https://www.britishairways.com', hub: 'LHR' },
  { iata: 'AF', name: 'Air France', url: 'https://www.airfrance.com', hub: 'CDG' },
  { iata: 'KL', name: 'KLM', url: 'https://www.klm.com', hub: 'AMS' },
  { iata: 'EY', name: 'Etihad', url: 'https://www.etihad.com', hub: 'AUH' },
]

const BUDGET_AIRLINES: AirlineInfo[] = [
  { iata: 'FR', name: 'Ryanair', url: 'https://www.ryanair.com' },
  { iata: 'W6', name: 'Wizz Air', url: 'https://wizzair.com' },
  { iata: 'U2', name: 'easyJet', url: 'https://www.easyjet.com' },
  { iata: 'VY', name: 'Vueling', url: 'https://www.vueling.com' },
  { iata: 'PC', name: 'Pegasus', url: 'https://www.flypgs.com' },
]

const HUB_AIRPORTS = ['IST', 'DOH', 'FRA', 'LHR', 'CDG', 'AMS', 'BCN', 'MXP', 'DXB', 'AUH', 'VIE', 'ZRH']

function pickRandom<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]
}

function hashStr(s: string): number {
  return s.split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 0)
}

function addHours(base: string, hours: number): string {
  const d = new Date(base)
  d.setTime(d.getTime() + hours * 3600000)
  return d.toISOString()
}

export function generateDemoItineraries(from: string, to: string, dateISO: string): Itinerary[] {
  const seed = hashStr(from + to + dateISO)
  const baseDate = dateISO || '2026-03-10'
  const baseDep = `${baseDate}T06:00:00Z`

  // Estimate a reasonable direct flight duration (3-14 hours based on hash)
  const directHours = 3 + (Math.abs(seed) % 11)
  const directPrice = 180 + (Math.abs(seed * 7) % 400)

  // Pick connecting hubs (exclude from and to)
  const availableHubs = HUB_AIRPORTS.filter(h => h !== from && h !== to)

  const itineraries: Itinerary[] = []

  // 1. Direct flight (major airline)
  const directAirline = pickRandom(MAJOR_AIRLINES, seed)
  itineraries.push({
    id: `demo-${from}-${to}-1`,
    segments: [{
      airline_iata: directAirline.iata,
      airline_name: directAirline.name,
      flight_number: `${directAirline.iata}${100 + (Math.abs(seed) % 900)}`,
      departure_airport: from, departure_airport_name: from,
      arrival_airport: to, arrival_airport_name: to,
      departure_time: addHours(baseDep, 2),
      arrival_time: addHours(baseDep, 2 + directHours),
      duration_minutes: directHours * 60,
      cabin_class: 'Economy',
      on_time_percentage: 82 + (Math.abs(seed) % 12),
      reliability_color: 'green',
    }],
    total_price: directPrice,
    currency: 'EUR',
    total_duration_minutes: directHours * 60,
    total_stops: 0,
    airlines_involved: [directAirline.name],
    layover_durations: [],
    best_value_score: 0.75 + (Math.abs(seed) % 15) / 100,
    reliability_score: 0.82 + (Math.abs(seed) % 10) / 100,
    booking_links: [{ airline: directAirline.iata, url: directAirline.url, segment_index: 0 }],
    source: 'demo',
    deep_link: directAirline.url,
    uses_nearby_airports: false,
    nearby_airport_note: null,
    risk_warnings: [],
  })

  // 2. One-stop via hub (same airline both legs)
  const hub1 = pickRandom(availableHubs, seed + 1)
  const conn1Airline = pickRandom(MAJOR_AIRLINES.filter(a => a.hub === hub1 || true), seed + 2)
  const leg1Hours = 2 + (Math.abs(seed + 3) % 6)
  const layover1 = 90 + (Math.abs(seed + 4) % 120)
  const leg2Hours = 2 + (Math.abs(seed + 5) % 6)
  itineraries.push({
    id: `demo-${from}-${to}-2`,
    segments: [
      {
        airline_iata: conn1Airline.iata, airline_name: conn1Airline.name,
        flight_number: `${conn1Airline.iata}${200 + (Math.abs(seed + 6) % 800)}`,
        departure_airport: from, departure_airport_name: from,
        arrival_airport: hub1, arrival_airport_name: hub1,
        departure_time: addHours(baseDep, 0),
        arrival_time: addHours(baseDep, leg1Hours),
        duration_minutes: leg1Hours * 60,
        cabin_class: 'Economy',
        on_time_percentage: 75 + (Math.abs(seed + 7) % 15),
        reliability_color: 'green',
      },
      {
        airline_iata: conn1Airline.iata, airline_name: conn1Airline.name,
        flight_number: `${conn1Airline.iata}${300 + (Math.abs(seed + 8) % 700)}`,
        departure_airport: hub1, departure_airport_name: hub1,
        arrival_airport: to, arrival_airport_name: to,
        departure_time: addHours(baseDep, leg1Hours + layover1 / 60),
        arrival_time: addHours(baseDep, leg1Hours + layover1 / 60 + leg2Hours),
        duration_minutes: leg2Hours * 60,
        cabin_class: 'Economy',
        on_time_percentage: 72 + (Math.abs(seed + 9) % 18),
        reliability_color: 'amber',
      },
    ],
    total_price: Math.round(directPrice * 0.7),
    currency: 'EUR',
    total_duration_minutes: (leg1Hours + leg2Hours) * 60 + layover1,
    total_stops: 1,
    airlines_involved: [conn1Airline.name],
    layover_durations: [layover1],
    best_value_score: 0.72 + (Math.abs(seed) % 10) / 100,
    reliability_score: 0.74 + (Math.abs(seed) % 8) / 100,
    booking_links: [
      { airline: conn1Airline.iata, url: conn1Airline.url, segment_index: 0 },
      { airline: conn1Airline.iata, url: conn1Airline.url, segment_index: 1 },
    ],
    source: 'demo',
    deep_link: conn1Airline.url,
    uses_nearby_airports: false,
    nearby_airport_note: null,
    risk_warnings: [],
  })

  // 3. Budget multi-airline option (two different airlines via a hub)
  const hub2 = pickRandom(availableHubs.filter(h => h !== hub1), seed + 10)
  const budgetAirline1 = pickRandom(BUDGET_AIRLINES, seed + 11)
  const budgetAirline2 = pickRandom(BUDGET_AIRLINES.filter(a => a.iata !== budgetAirline1.iata), seed + 12)
  const bLeg1Hours = 3 + (Math.abs(seed + 13) % 5)
  const bLayover = 180 + (Math.abs(seed + 14) % 120)
  const bLeg2Hours = 2 + (Math.abs(seed + 15) % 4)
  itineraries.push({
    id: `demo-${from}-${to}-3`,
    segments: [
      {
        airline_iata: budgetAirline1.iata, airline_name: budgetAirline1.name,
        flight_number: `${budgetAirline1.iata}${400 + (Math.abs(seed + 16) % 600)}`,
        departure_airport: from, departure_airport_name: from,
        arrival_airport: hub2, arrival_airport_name: hub2,
        departure_time: addHours(baseDep, -1),
        arrival_time: addHours(baseDep, -1 + bLeg1Hours),
        duration_minutes: bLeg1Hours * 60,
        cabin_class: 'Economy',
        on_time_percentage: 65 + (Math.abs(seed + 17) % 15),
        reliability_color: 'amber',
      },
      {
        airline_iata: budgetAirline2.iata, airline_name: budgetAirline2.name,
        flight_number: `${budgetAirline2.iata}${500 + (Math.abs(seed + 18) % 500)}`,
        departure_airport: hub2, departure_airport_name: hub2,
        arrival_airport: to, arrival_airport_name: to,
        departure_time: addHours(baseDep, -1 + bLeg1Hours + bLayover / 60),
        arrival_time: addHours(baseDep, -1 + bLeg1Hours + bLayover / 60 + bLeg2Hours),
        duration_minutes: bLeg2Hours * 60,
        cabin_class: 'Economy',
        on_time_percentage: 68 + (Math.abs(seed + 19) % 12),
        reliability_color: 'amber',
      },
    ],
    total_price: Math.round(directPrice * 0.4),
    currency: 'EUR',
    total_duration_minutes: (bLeg1Hours + bLeg2Hours) * 60 + bLayover,
    total_stops: 1,
    airlines_involved: [budgetAirline1.name, budgetAirline2.name],
    layover_durations: [bLayover],
    best_value_score: 0.85 + (Math.abs(seed) % 8) / 100,
    reliability_score: 0.65 + (Math.abs(seed) % 10) / 100,
    booking_links: [
      { airline: budgetAirline1.iata, url: budgetAirline1.url, segment_index: 0 },
      { airline: budgetAirline2.iata, url: budgetAirline2.url, segment_index: 1 },
    ],
    source: 'demo',
    deep_link: null,
    uses_nearby_airports: false,
    nearby_airport_note: null,
    risk_warnings: [
      `Separate bookings: if ${budgetAirline1.name} is delayed, ${budgetAirline2.name} won't wait`,
      `Self-transfer at ${hub2} — collect and re-check luggage`,
    ],
  })

  // 4. Another connecting option via different hub
  const hub3 = pickRandom(availableHubs.filter(h => h !== hub1 && h !== hub2), seed + 20)
  const conn2Airline = pickRandom(MAJOR_AIRLINES.filter(a => a.iata !== conn1Airline.iata), seed + 21)
  const c2Leg1Hours = 2 + (Math.abs(seed + 22) % 5)
  const c2Layover = 120 + (Math.abs(seed + 23) % 90)
  const c2Leg2Hours = 3 + (Math.abs(seed + 24) % 5)
  itineraries.push({
    id: `demo-${from}-${to}-4`,
    segments: [
      {
        airline_iata: conn2Airline.iata, airline_name: conn2Airline.name,
        flight_number: `${conn2Airline.iata}${600 + (Math.abs(seed + 25) % 400)}`,
        departure_airport: from, departure_airport_name: from,
        arrival_airport: hub3, arrival_airport_name: hub3,
        departure_time: addHours(baseDep, 1),
        arrival_time: addHours(baseDep, 1 + c2Leg1Hours),
        duration_minutes: c2Leg1Hours * 60,
        cabin_class: 'Economy',
        on_time_percentage: 77 + (Math.abs(seed + 26) % 13),
        reliability_color: 'green',
      },
      {
        airline_iata: conn2Airline.iata, airline_name: conn2Airline.name,
        flight_number: `${conn2Airline.iata}${700 + (Math.abs(seed + 27) % 300)}`,
        departure_airport: hub3, departure_airport_name: hub3,
        arrival_airport: to, arrival_airport_name: to,
        departure_time: addHours(baseDep, 1 + c2Leg1Hours + c2Layover / 60),
        arrival_time: addHours(baseDep, 1 + c2Leg1Hours + c2Layover / 60 + c2Leg2Hours),
        duration_minutes: c2Leg2Hours * 60,
        cabin_class: 'Economy',
        on_time_percentage: 73 + (Math.abs(seed + 28) % 15),
        reliability_color: 'amber',
      },
    ],
    total_price: Math.round(directPrice * 0.6),
    currency: 'EUR',
    total_duration_minutes: (c2Leg1Hours + c2Leg2Hours) * 60 + c2Layover,
    total_stops: 1,
    airlines_involved: [conn2Airline.name],
    layover_durations: [c2Layover],
    best_value_score: 0.70 + (Math.abs(seed) % 12) / 100,
    reliability_score: 0.75 + (Math.abs(seed) % 9) / 100,
    booking_links: [
      { airline: conn2Airline.iata, url: conn2Airline.url, segment_index: 0 },
      { airline: conn2Airline.iata, url: conn2Airline.url, segment_index: 1 },
    ],
    source: 'demo',
    deep_link: conn2Airline.url,
    uses_nearby_airports: false,
    nearby_airport_note: null,
    risk_warnings: [],
  })

  return itineraries
}
