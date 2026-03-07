// Static airport database for instant autocomplete (fallback when API unavailable)
export interface AirportOption {
  iata: string
  name: string
  city: string
  country: string
}

export const airports: AirportOption[] = [
  // Middle East
  { iata: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  { iata: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE' },
  { iata: 'SHJ', name: 'Sharjah International', city: 'Sharjah', country: 'UAE' },
  { iata: 'DWC', name: 'Al Maktoum International', city: 'Dubai', country: 'UAE' },
  { iata: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Qatar' },
  { iata: 'BAH', name: 'Bahrain International', city: 'Manama', country: 'Bahrain' },
  { iata: 'KWI', name: 'Kuwait International', city: 'Kuwait City', country: 'Kuwait' },
  { iata: 'RUH', name: 'King Khalid International', city: 'Riyadh', country: 'Saudi Arabia' },
  { iata: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },
  { iata: 'MCT', name: 'Muscat International', city: 'Muscat', country: 'Oman' },
  { iata: 'AMM', name: 'Queen Alia International', city: 'Amman', country: 'Jordan' },
  { iata: 'BEY', name: 'Rafic Hariri International', city: 'Beirut', country: 'Lebanon' },
  { iata: 'TLV', name: 'Ben Gurion International', city: 'Tel Aviv', country: 'Israel' },
  // Europe - Major hubs
  { iata: 'LHR', name: 'Heathrow', city: 'London', country: 'UK' },
  { iata: 'LGW', name: 'Gatwick', city: 'London', country: 'UK' },
  { iata: 'STN', name: 'Stansted', city: 'London', country: 'UK' },
  { iata: 'LTN', name: 'Luton', city: 'London', country: 'UK' },
  { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { iata: 'ORY', name: 'Orly', city: 'Paris', country: 'France' },
  { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { iata: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
  { iata: 'AMS', name: 'Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { iata: 'MAD', name: 'Adolfo Suarez Madrid-Barajas', city: 'Madrid', country: 'Spain' },
  { iata: 'BCN', name: 'El Prat', city: 'Barcelona', country: 'Spain' },
  { iata: 'FCO', name: 'Leonardo da Vinci-Fiumicino', city: 'Rome', country: 'Italy' },
  { iata: 'MXP', name: 'Malpensa', city: 'Milan', country: 'Italy' },
  { iata: 'BGY', name: 'Orio al Serio', city: 'Milan Bergamo', country: 'Italy' },
  { iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
  { iata: 'SAW', name: 'Sabiha Gokcen', city: 'Istanbul', country: 'Turkey' },
  { iata: 'LIS', name: 'Humberto Delgado', city: 'Lisbon', country: 'Portugal' },
  { iata: 'OPO', name: 'Francisco Sa Carneiro', city: 'Porto', country: 'Portugal' },
  { iata: 'FAO', name: 'Faro Airport', city: 'Faro', country: 'Portugal' },
  { iata: 'ATH', name: 'Eleftherios Venizelos', city: 'Athens', country: 'Greece' },
  { iata: 'VIE', name: 'Vienna International', city: 'Vienna', country: 'Austria' },
  { iata: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
  { iata: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland' },
  { iata: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium' },
  { iata: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland' },
  { iata: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
  { iata: 'OSL', name: 'Oslo Airport Gardermoen', city: 'Oslo', country: 'Norway' },
  { iata: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'Sweden' },
  { iata: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finland' },
  { iata: 'WAW', name: 'Chopin Airport', city: 'Warsaw', country: 'Poland' },
  { iata: 'PRG', name: 'Vaclav Havel Airport', city: 'Prague', country: 'Czech Republic' },
  { iata: 'BUD', name: 'Budapest Ferenc Liszt', city: 'Budapest', country: 'Hungary' },
  { iata: 'OTP', name: 'Henri Coanda International', city: 'Bucharest', country: 'Romania' },
  { iata: 'SOF', name: 'Sofia Airport', city: 'Sofia', country: 'Bulgaria' },
  { iata: 'BEG', name: 'Nikola Tesla Airport', city: 'Belgrade', country: 'Serbia' },
  { iata: 'ZAG', name: 'Franjo Tudman Airport', city: 'Zagreb', country: 'Croatia' },
  { iata: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'UK' },
  { iata: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'UK' },
  // Americas
  { iata: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
  { iata: 'EWR', name: 'Newark Liberty International', city: 'Newark', country: 'USA' },
  { iata: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
  { iata: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA' },
  { iata: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA' },
  { iata: 'MIA', name: 'Miami International', city: 'Miami', country: 'USA' },
  { iata: 'ATL', name: 'Hartsfield-Jackson Atlanta', city: 'Atlanta', country: 'USA' },
  { iata: 'DFW', name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA' },
  { iata: 'DEN', name: 'Denver International', city: 'Denver', country: 'USA' },
  { iata: 'SEA', name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA' },
  { iata: 'BOS', name: 'Logan International', city: 'Boston', country: 'USA' },
  { iata: 'IAD', name: 'Washington Dulles International', city: 'Washington DC', country: 'USA' },
  { iata: 'YYZ', name: 'Toronto Pearson International', city: 'Toronto', country: 'Canada' },
  { iata: 'YVR', name: 'Vancouver International', city: 'Vancouver', country: 'Canada' },
  { iata: 'MEX', name: 'Benito Juarez International', city: 'Mexico City', country: 'Mexico' },
  { iata: 'CUN', name: 'Cancun International', city: 'Cancun', country: 'Mexico' },
  { iata: 'GRU', name: 'Guarulhos International', city: 'Sao Paulo', country: 'Brazil' },
  { iata: 'GIG', name: 'Galeao International', city: 'Rio de Janeiro', country: 'Brazil' },
  { iata: 'SCL', name: 'Arturo Merino Benitez', city: 'Santiago', country: 'Chile' },
  { iata: 'BOG', name: 'El Dorado International', city: 'Bogota', country: 'Colombia' },
  { iata: 'EZE', name: 'Ministro Pistarini', city: 'Buenos Aires', country: 'Argentina' },
  { iata: 'LIM', name: 'Jorge Chavez International', city: 'Lima', country: 'Peru' },
  // Asia
  { iata: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China' },
  { iata: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore' },
  { iata: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  { iata: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan' },
  { iata: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
  { iata: 'ICN', name: 'Incheon International', city: 'Seoul', country: 'South Korea' },
  { iata: 'PEK', name: 'Beijing Capital International', city: 'Beijing', country: 'China' },
  { iata: 'PVG', name: 'Pudong International', city: 'Shanghai', country: 'China' },
  { iata: 'DEL', name: 'Indira Gandhi International', city: 'New Delhi', country: 'India' },
  { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', country: 'India' },
  { iata: 'BLR', name: 'Kempegowda International', city: 'Bangalore', country: 'India' },
  { iata: 'MAA', name: 'Chennai International', city: 'Chennai', country: 'India' },
  { iata: 'CCU', name: 'Netaji Subhas Chandra Bose', city: 'Kolkata', country: 'India' },
  { iata: 'KUL', name: 'Kuala Lumpur International', city: 'Kuala Lumpur', country: 'Malaysia' },
  { iata: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', country: 'Indonesia' },
  { iata: 'MNL', name: 'Ninoy Aquino International', city: 'Manila', country: 'Philippines' },
  { iata: 'TPE', name: 'Taiwan Taoyuan International', city: 'Taipei', country: 'Taiwan' },
  { iata: 'SGN', name: 'Tan Son Nhat International', city: 'Ho Chi Minh City', country: 'Vietnam' },
  { iata: 'HAN', name: 'Noi Bai International', city: 'Hanoi', country: 'Vietnam' },
  { iata: 'CMB', name: 'Bandaranaike International', city: 'Colombo', country: 'Sri Lanka' },
  { iata: 'KTM', name: 'Tribhuvan International', city: 'Kathmandu', country: 'Nepal' },
  { iata: 'DAC', name: 'Hazrat Shahjalal International', city: 'Dhaka', country: 'Bangladesh' },
  { iata: 'ISB', name: 'Islamabad International', city: 'Islamabad', country: 'Pakistan' },
  { iata: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
  // Africa
  { iata: 'CAI', name: 'Cairo International', city: 'Cairo', country: 'Egypt' },
  { iata: 'JNB', name: 'O.R. Tambo International', city: 'Johannesburg', country: 'South Africa' },
  { iata: 'CPT', name: 'Cape Town International', city: 'Cape Town', country: 'South Africa' },
  { iata: 'NBO', name: 'Jomo Kenyatta International', city: 'Nairobi', country: 'Kenya' },
  { iata: 'ADD', name: 'Bole International', city: 'Addis Ababa', country: 'Ethiopia' },
  { iata: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'Morocco' },
  { iata: 'LOS', name: 'Murtala Muhammed International', city: 'Lagos', country: 'Nigeria' },
  { iata: 'ALG', name: 'Houari Boumediene', city: 'Algiers', country: 'Algeria' },
  { iata: 'TUN', name: 'Tunis-Carthage International', city: 'Tunis', country: 'Tunisia' },
  // Oceania
  { iata: 'SYD', name: 'Kingsford Smith', city: 'Sydney', country: 'Australia' },
  { iata: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' },
  { iata: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia' },
  { iata: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia' },
  { iata: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand' },
]

// Search airports locally (used as fallback when API is unavailable)
export function searchAirportsLocal(term: string): AirportOption[] {
  const q = term.toLowerCase().trim()
  if (q.length < 1) return []

  return airports
    .filter(
      (a) =>
        a.iata.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    )
    .slice(0, 8)
}
