// Vercel Serverless Function — proxies station search to v6.db.transport.rest
// Free, no auth required, covers all European rail stations

const DB_API = 'https://v6.db.transport.rest';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query: term, limit = '8' } = req.query;

  if (!term || term.length < 2) {
    return res.status(400).json({ error: 'query parameter required (min 2 chars)' });
  }

  try {
    const params = new URLSearchParams({
      query: term,
      results: limit,
      fuzzy: 'true',
      stops: 'true',
      addresses: 'false',
      poi: 'false',
      linesOfStops: 'false',
      language: 'en',
    });

    const response = await fetch(`${DB_API}/locations?${params.toString()}`);

    if (!response.ok) {
      const errText = await response.text();
      console.error('DB API station search error:', response.status, errText);
      return res.status(response.status).json({ error: `DB API: ${errText}` });
    }

    const locations = await response.json();

    // Filter to only stations/stops (not addresses/POIs) and normalize
    const stations = locations
      .filter((loc) => loc.type === 'station' || loc.type === 'stop')
      .map((loc) => ({
        id: loc.id,
        name: loc.name || '',
        type: loc.type,
        location: loc.location || null,
        products: loc.products || {},
      }));

    // Cache for 24 hours (station data doesn't change)
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=172800');
    return res.status(200).json({ stations });
  } catch (error) {
    console.error('Station search error:', error);
    return res.status(500).json({ error: error.message });
  }
}
