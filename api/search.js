// Vercel Serverless Function — proxies flight search to Amadeus Self-Service API
// Amadeus free tier: 2000 calls/month with real flight data
// Sign up: https://developers.amadeus.com

let cachedToken = null;
let tokenExpiry = 0;

async function getAmadeusToken(apiKey, apiSecret, baseUrl) {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }

  const res = await fetch(`${baseUrl}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Amadeus auth failed: ${err}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = process.env.AMADEUS_API_KEY;
  const apiSecret = process.env.AMADEUS_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(503).json({
      error: 'AMADEUS_API_KEY and AMADEUS_API_SECRET not configured',
      demo: true,
      message: 'Add Amadeus API credentials in Vercel environment variables. Sign up free at https://developers.amadeus.com',
    });
  }

  // Use test environment by default, production if specified
  const env = process.env.AMADEUS_ENV || 'test';
  const baseUrl = env === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';

  try {
    const {
      fly_from,
      fly_to,
      date_from,       // YYYY-MM-DD
      date_to,         // YYYY-MM-DD (optional, for return)
      max_stopovers = '2',
      curr = 'USD',
      adults = '1',
      limit = '15',
      cabin = 'ECONOMY',  // ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
    } = req.query;

    if (!fly_from || !fly_to || !date_from) {
      return res.status(400).json({ error: 'fly_from, fly_to, and date_from are required' });
    }

    // Get OAuth token
    const token = await getAmadeusToken(apiKey, apiSecret, baseUrl);

    // Build Amadeus search params
    const params = new URLSearchParams({
      originLocationCode: fly_from,
      destinationLocationCode: fly_to,
      departureDate: date_from,
      adults: adults,
      max: limit,
      currencyCode: curr,
      travelClass: cabin,
      nonStop: 'false',
    });

    if (date_to) {
      params.set('returnDate', date_to);
    }

    const searchRes = await fetch(
      `${baseUrl}/v2/shopping/flight-offers?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!searchRes.ok) {
      const errBody = await searchRes.text();
      console.error('Amadeus search error:', searchRes.status, errBody);

      // If auth expired, clear cache and retry once
      if (searchRes.status === 401) {
        cachedToken = null;
        tokenExpiry = 0;
        const newToken = await getAmadeusToken(apiKey, apiSecret, baseUrl);
        const retryRes = await fetch(
          `${baseUrl}/v2/shopping/flight-offers?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (retryRes.ok) {
          const retryData = await retryRes.json();
          res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
          return res.status(200).json(retryData);
        }
      }

      return res.status(searchRes.status).json({ error: `Amadeus API: ${errBody}` });
    }

    const data = await searchRes.json();

    // Cache for 15 minutes
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Search proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
