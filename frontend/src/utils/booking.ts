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
}

export function getAirlineUrl(airlineIata: string): string {
  return airlineWebsites[airlineIata] || `https://www.google.com/travel/flights?q=${airlineIata}`
}

// Build a Google Flights search URL for a specific route + date
export function buildGoogleFlightsUrl(
  from: string,
  to: string,
  date: string, // YYYY-MM-DD
): string {
  return `https://www.google.com/travel/flights?q=flights+from+${from}+to+${to}+on+${date}`
}

// Build a Kiwi.com search URL
export function buildKiwiUrl(
  from: string,
  to: string,
  date: string, // YYYY-MM-DD
): string {
  // Kiwi date format: dd/mm/yyyy
  const [y, m, d] = date.split('-')
  return `https://www.kiwi.com/en/search/results/${from}/${to}/${d}-${m}-${y}`
}

// Build a Skyscanner search URL
export function buildSkyscannerUrl(
  from: string,
  to: string,
  date: string, // YYYY-MM-DD
): string {
  const d = date.replace(/-/g, '').slice(2) // 260310 format
  return `https://www.skyscanner.net/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/${d}/`
}

// Build a booking link for an itinerary — prefers airline direct, falls back to OTA
export function buildBookingUrl(
  airlineIata: string,
  from: string,
  to: string,
  date: string,
): string {
  // If we know the airline's website, link there
  if (airlineWebsites[airlineIata]) {
    return airlineWebsites[airlineIata]
  }
  // Fallback to Kiwi search
  return buildKiwiUrl(from, to, date)
}
