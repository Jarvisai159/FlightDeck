// Vercel Serverless Function — Airport arrivals/departures history
// Uses AviationStack API if available, otherwise generates realistic demo data

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { airport, type = 'arrivals', date } = req.query;

  if (!airport) {
    return res.status(400).json({ error: 'airport IATA code is required' });
  }

  const iata = airport.toUpperCase();
  const apiKey = process.env.AVIATIONSTACK_API_KEY;

  // Try real API if available
  if (apiKey) {
    try {
      const params = new URLSearchParams({
        access_key: apiKey,
        limit: '50',
      });

      if (type === 'departures') {
        params.set('dep_iata', iata);
      } else {
        params.set('arr_iata', iata);
      }

      if (date) {
        params.set('flight_date', date);
      }

      const apiRes = await fetch(
        `http://api.aviationstack.com/v1/flights?${params.toString()}`
      );

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.data && apiData.data.length > 0) {
          const flights = apiData.data.map((f) => ({
            flight_number: f.flight?.iata || 'N/A',
            airline: f.airline?.name || 'Unknown',
            airline_iata: f.airline?.iata || '',
            origin: f.departure?.iata || '',
            origin_name: f.departure?.airport || '',
            destination: f.arrival?.iata || '',
            destination_name: f.arrival?.airport || '',
            scheduled: type === 'departures' ? f.departure?.scheduled : f.arrival?.scheduled,
            actual: type === 'departures' ? f.departure?.actual : f.arrival?.actual,
            estimated: type === 'departures' ? f.departure?.estimated : f.arrival?.estimated,
            status: mapStatus(f.flight_status),
            terminal: type === 'departures' ? f.departure?.terminal : f.arrival?.terminal,
            gate: type === 'departures' ? f.departure?.gate : f.arrival?.gate,
            delay_minutes: type === 'departures' ? f.departure?.delay : f.arrival?.delay,
          }));

          res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
          return res.status(200).json({ flights, isDemo: false, airport: iata, type });
        }
      }
    } catch (err) {
      console.error('AviationStack error:', err.message);
    }
  }

  // Generate demo data
  const flights = generateDemoSchedule(iata, type, date);
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({ flights, isDemo: true, airport: iata, type });
}

function mapStatus(status) {
  const map = {
    scheduled: 'Scheduled',
    active: 'In Air',
    landed: 'Landed',
    cancelled: 'Cancelled',
    incident: 'Diverted',
    diverted: 'Diverted',
  };
  return map[status] || status || 'Scheduled';
}

// --- Demo data generator ---
// Creates realistic airport schedule for any IATA code

const AIRLINE_DATABASE = [
  { iata: 'EK', name: 'Emirates', hubs: ['DXB'] },
  { iata: 'TK', name: 'Turkish Airlines', hubs: ['IST', 'SAW'] },
  { iata: 'QR', name: 'Qatar Airways', hubs: ['DOH'] },
  { iata: 'LH', name: 'Lufthansa', hubs: ['FRA', 'MUC'] },
  { iata: 'BA', name: 'British Airways', hubs: ['LHR', 'LGW'] },
  { iata: 'AF', name: 'Air France', hubs: ['CDG', 'ORY'] },
  { iata: 'KL', name: 'KLM', hubs: ['AMS'] },
  { iata: 'EY', name: 'Etihad Airways', hubs: ['AUH'] },
  { iata: 'SQ', name: 'Singapore Airlines', hubs: ['SIN'] },
  { iata: 'CX', name: 'Cathay Pacific', hubs: ['HKG'] },
  { iata: 'AA', name: 'American Airlines', hubs: ['DFW', 'MIA', 'ORD', 'JFK'] },
  { iata: 'UA', name: 'United Airlines', hubs: ['EWR', 'IAD', 'ORD', 'SFO', 'DEN'] },
  { iata: 'DL', name: 'Delta Air Lines', hubs: ['ATL', 'JFK', 'LAX', 'SEA'] },
  { iata: 'FR', name: 'Ryanair', hubs: ['STN', 'DUB'] },
  { iata: 'U2', name: 'easyJet', hubs: ['LGW', 'LTN'] },
  { iata: 'W6', name: 'Wizz Air', hubs: ['BUD'] },
  { iata: 'TP', name: 'TAP Portugal', hubs: ['LIS', 'OPO'] },
  { iata: 'IB', name: 'Iberia', hubs: ['MAD'] },
  { iata: 'VY', name: 'Vueling', hubs: ['BCN'] },
  { iata: 'AI', name: 'Air India', hubs: ['DEL', 'BOM'] },
  { iata: 'SV', name: 'Saudia', hubs: ['JED', 'RUH'] },
  { iata: 'FZ', name: 'flydubai', hubs: ['DXB'] },
  { iata: 'G9', name: 'Air Arabia', hubs: ['SHJ'] },
  { iata: 'WY', name: 'Oman Air', hubs: ['MCT'] },
  { iata: 'MS', name: 'EgyptAir', hubs: ['CAI'] },
  { iata: 'ET', name: 'Ethiopian Airlines', hubs: ['ADD'] },
  { iata: 'QF', name: 'Qantas', hubs: ['SYD', 'MEL'] },
  { iata: 'NZ', name: 'Air New Zealand', hubs: ['AKL'] },
  { iata: 'NH', name: 'ANA', hubs: ['NRT', 'HND'] },
  { iata: 'JL', name: 'Japan Airlines', hubs: ['NRT', 'HND'] },
  { iata: 'KE', name: 'Korean Air', hubs: ['ICN'] },
  { iata: 'TG', name: 'Thai Airways', hubs: ['BKK'] },
  { iata: 'MH', name: 'Malaysia Airlines', hubs: ['KUL'] },
  { iata: 'LO', name: 'LOT Polish Airlines', hubs: ['WAW'] },
  { iata: 'SK', name: 'SAS', hubs: ['CPH', 'OSL', 'ARN'] },
  { iata: 'AY', name: 'Finnair', hubs: ['HEL'] },
  { iata: 'OS', name: 'Austrian Airlines', hubs: ['VIE'] },
  { iata: 'LX', name: 'Swiss International', hubs: ['ZRH', 'GVA'] },
  { iata: 'SN', name: 'Brussels Airlines', hubs: ['BRU'] },
  { iata: 'EI', name: 'Aer Lingus', hubs: ['DUB'] },
  { iata: 'PC', name: 'Pegasus Airlines', hubs: ['SAW', 'IST'] },
  { iata: 'RJ', name: 'Royal Jordanian', hubs: ['AMM'] },
  { iata: 'GF', name: 'Gulf Air', hubs: ['BAH'] },
  { iata: 'KU', name: 'Kuwait Airways', hubs: ['KWI'] },
];

const COMMON_ROUTES = {
  DXB: ['LHR', 'IST', 'DOH', 'LIS', 'CDG', 'FRA', 'BOM', 'DEL', 'SIN', 'BKK', 'JFK', 'AMS', 'MXP', 'MCT', 'BAH', 'KWI', 'RUH', 'CAI', 'AMM', 'KHI'],
  LHR: ['DXB', 'JFK', 'LAX', 'CDG', 'FRA', 'AMS', 'MAD', 'IST', 'SIN', 'HKG', 'DEL', 'BOM', 'SYD', 'DOH', 'DUB', 'EDI', 'MAN'],
  JFK: ['LHR', 'CDG', 'FRA', 'DXB', 'LAX', 'MIA', 'ORD', 'ATL', 'SFO', 'BOS', 'YYZ', 'DOH', 'IST', 'AMS', 'FCO'],
  IST: ['DXB', 'LHR', 'FRA', 'CDG', 'AMS', 'FCO', 'ATH', 'CAI', 'AMM', 'JED', 'DOH', 'MXP', 'BCN', 'BUD', 'WAW', 'PRG'],
  CDG: ['LHR', 'JFK', 'DXB', 'FRA', 'AMS', 'IST', 'MAD', 'FCO', 'LIS', 'BCN', 'ATH', 'MXP', 'GVA', 'ZRH'],
  LIS: ['LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'BCN', 'FCO', 'OPO', 'IST', 'DXB', 'JFK', 'GIG', 'GRU'],
  OPO: ['LIS', 'LHR', 'CDG', 'FRA', 'AMS', 'BCN', 'MAD', 'MXP', 'BRU', 'ZRH', 'GVA', 'DUB', 'LGW'],
  FRA: ['LHR', 'JFK', 'DXB', 'CDG', 'AMS', 'IST', 'MUC', 'VIE', 'ZRH', 'MAD', 'FCO', 'ATH', 'SIN', 'BKK'],
  AMS: ['LHR', 'CDG', 'FRA', 'DXB', 'JFK', 'IST', 'BCN', 'FCO', 'MAD', 'LIS', 'ATH', 'BUD', 'WAW'],
  SIN: ['HKG', 'BKK', 'KUL', 'DXB', 'LHR', 'SYD', 'NRT', 'ICN', 'DEL', 'PEK', 'CGK', 'MNL'],
};

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateDemoSchedule(airport, type, dateStr) {
  const dateToUse = dateStr || new Date().toISOString().split('T')[0];
  const seed = hashCode(airport + type + dateToUse);
  const rng = seededRandom(seed);

  // Get connected airports
  const connectedAirports = COMMON_ROUTES[airport] ||
    Object.keys(COMMON_ROUTES).filter(k => k !== airport).slice(0, 15);

  // Get airlines that might operate here
  const localAirlines = AIRLINE_DATABASE.filter(
    a => a.hubs.includes(airport)
  );
  const allAirlines = [...localAirlines, ...AIRLINE_DATABASE.filter(
    a => !a.hubs.includes(airport)
  )];

  // Generate 20-35 flights spread across the day
  const numFlights = 20 + Math.floor(rng() * 15);
  const flights = [];

  for (let i = 0; i < numFlights; i++) {
    const airline = allAirlines[Math.floor(rng() * Math.min(allAirlines.length, 20))];
    const otherAirport = connectedAirports[Math.floor(rng() * connectedAirports.length)] || 'LHR';
    const flightNum = `${airline.iata}${100 + Math.floor(rng() * 900)}`;

    // Spread flights across 5:00 to 23:59
    const hour = 5 + Math.floor(rng() * 19);
    const minute = Math.floor(rng() * 4) * 15; // 0, 15, 30, 45
    const scheduledTime = `${dateToUse}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

    // Determine status based on current time
    const now = new Date();
    const scheduledDate = new Date(scheduledTime);
    const hoursDiff = (now - scheduledDate) / 3600000;

    let status, actual, delayMinutes;
    const statusRoll = rng();

    if (hoursDiff > 3) {
      // Past flights
      if (statusRoll < 0.03) {
        status = 'Cancelled';
        actual = null;
        delayMinutes = 0;
      } else if (statusRoll < 0.70) {
        status = 'Landed';
        delayMinutes = 0;
        actual = scheduledTime;
      } else if (statusRoll < 0.85) {
        status = 'Landed';
        delayMinutes = 5 + Math.floor(rng() * 20);
        const actualDate = new Date(scheduledDate.getTime() + delayMinutes * 60000);
        actual = actualDate.toISOString().replace('.000Z', '');
      } else {
        status = 'Landed';
        delayMinutes = 25 + Math.floor(rng() * 60);
        const actualDate = new Date(scheduledDate.getTime() + delayMinutes * 60000);
        actual = actualDate.toISOString().replace('.000Z', '');
      }
    } else if (hoursDiff > 0 && hoursDiff <= 3) {
      // Recent flights
      if (statusRoll < 0.03) {
        status = 'Cancelled';
        actual = null;
        delayMinutes = 0;
      } else if (statusRoll < 0.4) {
        status = type === 'departures' ? 'Departed' : 'In Air';
        delayMinutes = 0;
        actual = scheduledTime;
      } else if (statusRoll < 0.65) {
        status = type === 'departures' ? 'Departed' : 'In Air';
        delayMinutes = 10 + Math.floor(rng() * 25);
        const actualDate = new Date(scheduledDate.getTime() + delayMinutes * 60000);
        actual = actualDate.toISOString().replace('.000Z', '');
      } else {
        status = 'Landed';
        delayMinutes = Math.floor(rng() * 10);
        actual = delayMinutes > 0
          ? new Date(scheduledDate.getTime() + delayMinutes * 60000).toISOString().replace('.000Z', '')
          : scheduledTime;
      }
    } else {
      // Future flights
      if (statusRoll < 0.02) {
        status = 'Cancelled';
        actual = null;
        delayMinutes = 0;
      } else if (statusRoll < 0.75) {
        status = 'Scheduled';
        actual = null;
        delayMinutes = 0;
      } else if (statusRoll < 0.90) {
        status = 'Scheduled';
        actual = null;
        delayMinutes = 10 + Math.floor(rng() * 30);
      } else {
        status = type === 'departures' ? 'Boarding' : 'Expected';
        actual = null;
        delayMinutes = 0;
      }
    }

    // Generate terminal and gate
    const terminals = ['1', '2', '3', 'A', 'B', 'C', 'D'];
    const terminal = terminals[Math.floor(rng() * terminals.length)];
    const gate = `${String.fromCharCode(65 + Math.floor(rng() * 6))}${1 + Math.floor(rng() * 45)}`;

    flights.push({
      flight_number: flightNum,
      airline: airline.name,
      airline_iata: airline.iata,
      origin: type === 'arrivals' ? otherAirport : airport,
      origin_name: type === 'arrivals' ? otherAirport : airport,
      destination: type === 'arrivals' ? airport : otherAirport,
      destination_name: type === 'arrivals' ? airport : otherAirport,
      scheduled: scheduledTime,
      actual: actual,
      estimated: delayMinutes > 0 && !actual
        ? new Date(scheduledDate.getTime() + delayMinutes * 60000).toISOString().replace('.000Z', '')
        : null,
      status,
      terminal,
      gate,
      delay_minutes: delayMinutes || 0,
    });
  }

  // Sort by scheduled time
  flights.sort((a, b) => a.scheduled.localeCompare(b.scheduled));

  return flights;
}
