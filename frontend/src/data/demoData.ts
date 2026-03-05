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

// --- Demo Search Results ---
export const demoItineraries: Itinerary[] = [
  {
    id: 'itin-1',
    segments: [{
      airline_iata: 'EK', airline_name: 'Emirates', flight_number: 'EK191',
      departure_airport: 'DXB', departure_airport_name: 'Dubai Intl',
      arrival_airport: 'LIS', arrival_airport_name: 'Lisbon',
      departure_time: '2026-03-10T08:00:00Z', arrival_time: '2026-03-10T14:30:00Z',
      duration_minutes: 510, cabin_class: 'Economy',
      on_time_percentage: 85.2, reliability_color: 'green',
    }],
    total_price: 385, currency: 'EUR', total_duration_minutes: 510, total_stops: 0,
    airlines_involved: ['Emirates'], layover_durations: [],
    best_value_score: 0.78, reliability_score: 0.85,
    booking_links: [{ airline: 'EK', url: '#', segment_index: 0 }],
    source: 'demo', deep_link: '#',
    uses_nearby_airports: false, nearby_airport_note: null, risk_warnings: [],
  },
  {
    id: 'itin-2',
    segments: [
      {
        airline_iata: 'TK', airline_name: 'Turkish Airlines', flight_number: 'TK762',
        departure_airport: 'DXB', departure_airport_name: 'Dubai Intl',
        arrival_airport: 'IST', arrival_airport_name: 'Istanbul',
        departure_time: '2026-03-10T06:00:00Z', arrival_time: '2026-03-10T10:30:00Z',
        duration_minutes: 270, cabin_class: 'Economy',
        on_time_percentage: 78.0, reliability_color: 'green',
      },
      {
        airline_iata: 'TK', airline_name: 'Turkish Airlines', flight_number: 'TK1755',
        departure_airport: 'IST', arrival_airport_name: 'Lisbon',
        departure_airport_name: 'Istanbul', arrival_airport: 'LIS',
        departure_time: '2026-03-10T13:00:00Z', arrival_time: '2026-03-10T16:15:00Z',
        duration_minutes: 255, cabin_class: 'Economy',
        on_time_percentage: 74.5, reliability_color: 'amber',
      },
    ],
    total_price: 245, currency: 'EUR', total_duration_minutes: 615, total_stops: 1,
    airlines_involved: ['Turkish Airlines'], layover_durations: [150],
    best_value_score: 0.75, reliability_score: 0.76,
    booking_links: [
      { airline: 'TK', url: '#', segment_index: 0 },
      { airline: 'TK', url: '#', segment_index: 1 },
    ],
    source: 'demo', deep_link: '#',
    uses_nearby_airports: false, nearby_airport_note: null, risk_warnings: [],
  },
  {
    id: 'itin-3',
    segments: [
      {
        airline_iata: 'W6', airline_name: 'Wizz Air', flight_number: 'W6101',
        departure_airport: 'SHJ', departure_airport_name: 'Sharjah',
        arrival_airport: 'BGY', arrival_airport_name: 'Milan Bergamo',
        departure_time: '2026-03-10T03:00:00Z', arrival_time: '2026-03-10T08:00:00Z',
        duration_minutes: 360, cabin_class: 'Economy',
        on_time_percentage: 68.3, reliability_color: 'amber',
      },
      {
        airline_iata: 'FR', airline_name: 'Ryanair', flight_number: 'FR4782',
        departure_airport: 'BGY', departure_airport_name: 'Milan Bergamo',
        arrival_airport: 'LIS', arrival_airport_name: 'Lisbon',
        departure_time: '2026-03-10T12:00:00Z', arrival_time: '2026-03-10T14:00:00Z',
        duration_minutes: 180, cabin_class: 'Economy',
        on_time_percentage: 71.0, reliability_color: 'amber',
      },
    ],
    total_price: 127, currency: 'EUR', total_duration_minutes: 780, total_stops: 1,
    airlines_involved: ['Wizz Air', 'Ryanair'], layover_durations: [240],
    best_value_score: 0.88, reliability_score: 0.69,
    booking_links: [
      { airline: 'W6', url: '#', segment_index: 0 },
      { airline: 'FR', url: '#', segment_index: 1 },
    ],
    source: 'demo', deep_link: null,
    uses_nearby_airports: true,
    nearby_airport_note: 'Departs from Sharjah (SHJ) instead of Dubai (DXB) — 30 min drive',
    risk_warnings: ['Separate bookings: if Wizz Air is delayed, Ryanair won\'t wait', 'Self-transfer at Milan Bergamo — collect and re-check luggage'],
  },
  {
    id: 'itin-4',
    segments: [
      {
        airline_iata: 'G9', airline_name: 'Air Arabia', flight_number: 'G9345',
        departure_airport: 'SHJ', departure_airport_name: 'Sharjah',
        arrival_airport: 'BCN', arrival_airport_name: 'Barcelona',
        departure_time: '2026-03-10T07:00:00Z', arrival_time: '2026-03-10T12:30:00Z',
        duration_minutes: 390, cabin_class: 'Economy',
        on_time_percentage: 72.0, reliability_color: 'amber',
      },
      {
        airline_iata: 'TP', airline_name: 'TAP Portugal', flight_number: 'TP1040',
        departure_airport: 'BCN', departure_airport_name: 'Barcelona',
        arrival_airport: 'LIS', arrival_airport_name: 'Lisbon',
        departure_time: '2026-03-10T15:30:00Z', arrival_time: '2026-03-10T16:45:00Z',
        duration_minutes: 135, cabin_class: 'Economy',
        on_time_percentage: 80.5, reliability_color: 'green',
      },
    ],
    total_price: 198, currency: 'EUR', total_duration_minutes: 705, total_stops: 1,
    airlines_involved: ['Air Arabia', 'TAP Portugal'], layover_durations: [180],
    best_value_score: 0.72, reliability_score: 0.76,
    booking_links: [
      { airline: 'G9', url: '#', segment_index: 0 },
      { airline: 'TP', url: '#', segment_index: 1 },
    ],
    source: 'demo', deep_link: null,
    uses_nearby_airports: true,
    nearby_airport_note: 'Departs from Sharjah (SHJ) — check Air Arabia for best fares',
    risk_warnings: ['Separate bookings — self-transfer in Barcelona'],
  },
]
