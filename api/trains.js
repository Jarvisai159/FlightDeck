// Vercel Serverless Function — proxies journey search to v6.db.transport.rest
// Free DB transport API, no auth, covers European rail (ICE, TGV, Eurostar, etc.)

const DB_API = 'https://v6.db.transport.rest';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const {
    from,
    to,
    departure,      // ISO datetime e.g. 2026-03-10T08:00:00
    results = '10',
  } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'from and to station IDs are required' });
  }

  try {
    const params = new URLSearchParams({
      from,
      to,
      results,
      stopovers: 'false',
      transferTime: '0',
      language: 'en',
      nationalExpress: 'true',
      national: 'true',
      regionalExpress: 'true',
      regional: 'true',
      suburban: 'false',
      bus: 'false',
      ferry: 'false',
      subway: 'false',
      tram: 'false',
      taxi: 'false',
    });

    if (departure) {
      params.set('departure', departure);
    }

    const response = await fetch(`${DB_API}/journeys?${params.toString()}`);

    if (!response.ok) {
      const errText = await response.text();
      console.error('DB API journey search error:', response.status, errText);
      return res.status(response.status).json({ error: `DB API: ${errText}` });
    }

    const data = await response.json();

    // Cache for 5 minutes (journey data changes frequently)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Journey search error:', error);
    return res.status(500).json({ error: error.message });
  }
}
