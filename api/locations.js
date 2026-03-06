// Vercel Serverless Function — proxies location/airport search to Kiwi Tequila API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.KIWI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'KIWI_API_KEY not configured',
      demo: true,
    });
  }

  try {
    const {
      term = '',
      locale = 'en-US',
      location_types = 'airport',
      limit = '10',
      active_only = 'true',
    } = req.query;

    if (!term || term.length < 2) {
      return res.status(400).json({ error: 'term must be at least 2 characters' });
    }

    const params = new URLSearchParams({
      term,
      locale,
      location_types,
      limit,
      active_only,
    });

    const response = await fetch(
      `https://api.tequila.kiwi.com/locations/query?${params.toString()}`,
      {
        headers: {
          apikey: apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();

    // Cache location results for 24 hours
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=172800');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Location proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
