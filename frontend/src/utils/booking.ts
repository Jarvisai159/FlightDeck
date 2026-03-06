// Generate real booking URLs for airline websites and OTAs

const airlineWebsites: Record<string, string> = {
  EK: 'https://www.emirates.com',
  TK: 'https://www.turkishairlines.com',
  FR: 'https://www.ryanair.com',
  W6: 'https://wizzair.com',
  G9: 'https://www.airarabia.com',
  TP: 'https://www.flytap.com',
  FZ: 'https://www.flydubai.com',
  QR: 'https://www.qatarairways.com',
  '6E': 'https://www.goindigo.in',
  SV: 'https://www.saudia.com',
  LH: 'https://www.lufthansa.com',
  BA: 'https://www.britishairways.com',
  AF: 'https://www.airfrance.com',
  KL: 'https://www.klm.com',
  EY: 'https://www.etihad.com',
  SQ: 'https://www.singaporeair.com',
  QF: 'https://www.qantas.com',
  AI: 'https://www.airindia.com',
  ET: 'https://www.ethiopianairlines.com',
  IB: 'https://www.iberia.com',
  VY: 'https://www.vueling.com',
  U2: 'https://www.easyjet.com',
  PC: 'https://www.flypgs.com',
  DL: 'https://www.delta.com',
  AA: 'https://www.aa.com',
  UA: 'https://www.united.com',
  AC: 'https://www.aircanada.com',
  WY: 'https://www.omanair.com',
  GF: 'https://www.gulfair.com',
  RJ: 'https://www.rj.com',
  MS: 'https://www.egyptair.com',
}

export function getAirlineUrl(airlineIata: string): string {
  return airlineWebsites[airlineIata] || `https://www.google.com/travel/flights?q=${airlineIata}`
}

// Build a Google Flights search URL for a specific route + date
export function buildGoogleFlightsUrl(
  from: string,
  to: string,
  date: string, // YYYY-MM-DD
  cabinClass?: string,
  passengers?: number,
): string {
  let url = `https://www.google.com/travel/flights?q=flights+from+${from}+to+${to}+on+${date}`
  if (cabinClass && cabinClass !== 'M') {
    const classMap: Record<string, string> = { W: 'premium+economy', C: 'business', F: 'first' }
    url += `+${classMap[cabinClass] || ''}`
  }
  if (passengers && passengers > 1) url += `+${passengers}+passengers`
  return url
}

// Build a Kiwi.com search URL (date in dd-mm-yyyy)
export function buildKiwiUrl(
  from: string,
  to: string,
  date: string, // YYYY-MM-DD
  returnDate?: string,
): string {
  const [y, m, d] = date.split('-')
  let url = `https://www.kiwi.com/en/search/results/${from}/${to}/${d}-${m}-${y}`
  if (returnDate) {
    const [ry, rm, rd] = returnDate.split('-')
    url += `/${rd}-${rm}-${ry}`
  }
  return url
}

// Build a Skyscanner search URL
export function buildSkyscannerUrl(
  from: string,
  to: string,
  date: string, // YYYY-MM-DD
  returnDate?: string,
): string {
  const d = date.replace(/-/g, '').slice(2)
  let url = `https://www.skyscanner.net/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${d}/`
  if (returnDate) {
    const rd = returnDate.replace(/-/g, '').slice(2)
    url += `${rd}/`
  }
  return url
}

// Build a per-leg booking URL — deep link to airline site with route params
export function buildSegmentBookingUrl(
  airlineIata: string,
  from: string,
  to: string,
  date: string, // ISO datetime or YYYY-MM-DD
): string {
  // Extract date from ISO string if needed
  const dateStr = date.includes('T') ? date.split('T')[0] : date

  // If we have the airline website, build a Google Flights URL for that specific leg
  // (most airline sites don't support deep linking with route params)
  return buildGoogleFlightsUrl(from, to, dateStr)
}

// Build a booking link for an itinerary — prefers airline direct, falls back to OTA
export function buildBookingUrl(
  airlineIata: string,
  from: string,
  to: string,
  date: string,
  returnDate?: string,
): string {
  if (airlineWebsites[airlineIata]) {
    return airlineWebsites[airlineIata]
  }
  return buildKiwiUrl(from, to, date, returnDate)
}

// Check if an airline website is known
export function hasAirlineWebsite(airlineIata: string): boolean {
  return airlineIata in airlineWebsites
}
