// Vercel Serverless Function — proxies flight search to Kiwi Tequila API
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
      message: 'Add KIWI_API_KEY environment variable in Vercel dashboard',
    });
  }

  try {
    const {
      fly_from,
      fly_to,
      date_from,
      date_to,
      max_stopovers = '2',
      curr = 'USD',
      adults = '1',
      limit = '20',
      sort = 'quality',
    } = req.query;

    if (!fly_from || !fly_to || !date_from) {
      return res.status(400).json({ error: 'fly_from, fly_to, and date_from are required' });
    }

    const params = new URLSearchParams({
      fly_from,
      fly_to,
      date_from,
      date_to: date_to || date_from,
      max_stopovers,
      curr,
      adults,
      limit,
      sort,
      vehicle_type: 'aircraft',
      one_for_city: '0',
    });

    const response = await fetch(
      `https://api.tequila.kiwi.com/v2/search?${params.toString()}`,
      {
        headers: {
          apikey: apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Kiwi API error:', response.status, errText);
      return res.status(response.status).json({ error: `Kiwi API: ${errText}` });
    }

    const data = await response.json();

    // Set cache header — cache for 15 minutes
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Search proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
