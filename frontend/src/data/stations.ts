// Major European rail stations for local autocomplete fallback
// IDs are Deutsche Bahn station IDs used by v6.db.transport.rest

export interface StationOption {
  id: string
  name: string
  city: string
  country: string
}

export const stations: StationOption[] = [
  // Germany
  { id: '8011160', name: 'Berlin Hbf', city: 'Berlin', country: 'Germany' },
  { id: '8000261', name: 'München Hbf', city: 'Munich', country: 'Germany' },
  { id: '8000105', name: 'Frankfurt (Main) Hbf', city: 'Frankfurt', country: 'Germany' },
  { id: '8000152', name: 'Hamburg Hbf', city: 'Hamburg', country: 'Germany' },
  { id: '8000207', name: 'Köln Hbf', city: 'Cologne', country: 'Germany' },
  { id: '8000244', name: 'Mannheim Hbf', city: 'Mannheim', country: 'Germany' },
  { id: '8000284', name: 'Nürnberg Hbf', city: 'Nuremberg', country: 'Germany' },
  { id: '8000096', name: 'Stuttgart Hbf', city: 'Stuttgart', country: 'Germany' },
  { id: '8000080', name: 'Düsseldorf Hbf', city: 'Düsseldorf', country: 'Germany' },
  { id: '8000149', name: 'Hannover Hbf', city: 'Hannover', country: 'Germany' },
  { id: '8010205', name: 'Leipzig Hbf', city: 'Leipzig', country: 'Germany' },
  { id: '8010089', name: 'Dresden Hbf', city: 'Dresden', country: 'Germany' },
  // France
  { id: '8796001', name: 'Paris (all stations)', city: 'Paris', country: 'France' },
  { id: '8700014', name: 'Paris Nord', city: 'Paris', country: 'France' },
  { id: '8700011', name: 'Paris Est', city: 'Paris', country: 'France' },
  { id: '8700012', name: 'Paris Lyon', city: 'Paris', country: 'France' },
  { id: '8774164', name: 'Lyon Part-Dieu', city: 'Lyon', country: 'France' },
  { id: '8775100', name: 'Marseille St-Charles', city: 'Marseille', country: 'France' },
  { id: '8700015', name: 'Strasbourg', city: 'Strasbourg', country: 'France' },
  { id: '8778100', name: 'Bordeaux St-Jean', city: 'Bordeaux', country: 'France' },
  { id: '8771605', name: 'Lille Europe', city: 'Lille', country: 'France' },
  // UK
  { id: '7015400', name: 'London St Pancras', city: 'London', country: 'UK' },
  // Netherlands
  { id: '8400058', name: 'Amsterdam Centraal', city: 'Amsterdam', country: 'Netherlands' },
  { id: '8400530', name: 'Rotterdam Centraal', city: 'Rotterdam', country: 'Netherlands' },
  { id: '8400621', name: 'Utrecht Centraal', city: 'Utrecht', country: 'Netherlands' },
  // Belgium
  { id: '8814001', name: 'Bruxelles-Midi', city: 'Brussels', country: 'Belgium' },
  { id: '8800004', name: 'Antwerpen-Centraal', city: 'Antwerp', country: 'Belgium' },
  // Switzerland
  { id: '8503000', name: 'Zürich HB', city: 'Zurich', country: 'Switzerland' },
  { id: '8507000', name: 'Bern', city: 'Bern', country: 'Switzerland' },
  { id: '8501120', name: 'Genève', city: 'Geneva', country: 'Switzerland' },
  { id: '8505000', name: 'Basel SBB', city: 'Basel', country: 'Switzerland' },
  // Austria
  { id: '8100003', name: 'Wien Hbf', city: 'Vienna', country: 'Austria' },
  { id: '8100002', name: 'Salzburg Hbf', city: 'Salzburg', country: 'Austria' },
  { id: '8100173', name: 'Innsbruck Hbf', city: 'Innsbruck', country: 'Austria' },
  // Italy
  { id: '8300263', name: 'Milano Centrale', city: 'Milan', country: 'Italy' },
  { id: '8300270', name: 'Roma Termini', city: 'Rome', country: 'Italy' },
  { id: '8300148', name: 'Firenze S.M.N.', city: 'Florence', country: 'Italy' },
  { id: '8300307', name: 'Venezia Santa Lucia', city: 'Venice', country: 'Italy' },
  { id: '8300271', name: 'Napoli Centrale', city: 'Naples', country: 'Italy' },
  { id: '8300316', name: 'Bologna Centrale', city: 'Bologna', country: 'Italy' },
  { id: '8300304', name: 'Torino Porta Nuova', city: 'Turin', country: 'Italy' },
  // Spain
  { id: '7100003', name: 'Madrid Puerta de Atocha', city: 'Madrid', country: 'Spain' },
  { id: '7100020', name: 'Barcelona Sants', city: 'Barcelona', country: 'Spain' },
  // Czech Republic
  { id: '5400014', name: 'Praha hl.n.', city: 'Prague', country: 'Czech Republic' },
  // Poland
  { id: '5100028', name: 'Warszawa Centralna', city: 'Warsaw', country: 'Poland' },
  { id: '5100036', name: 'Kraków Główny', city: 'Krakow', country: 'Poland' },
  // Denmark
  { id: '8600626', name: 'København H', city: 'Copenhagen', country: 'Denmark' },
  // Sweden
  { id: '7400004', name: 'Stockholm Central', city: 'Stockholm', country: 'Sweden' },
  // Hungary
  { id: '5500017', name: 'Budapest Keleti', city: 'Budapest', country: 'Hungary' },
]

export function searchStationsLocal(term: string): StationOption[] {
  const q = term.toLowerCase().trim()
  if (q.length < 2) return []
  return stations
    .filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.id.includes(q)
    )
    .slice(0, 8)
}
