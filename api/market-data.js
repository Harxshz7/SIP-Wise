// Vercel Serverless Function — /api/market-data
// Proxies Yahoo Finance chart data for Nifty 50 (^NSEI) and Sensex (^BSESN)
// to avoid CORS issues in the browser.

// In-memory cache (persists across warm invocations on the same Vercel instance)
let cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch chart data for a single symbol from Yahoo Finance v8 API.
 * @param {string} symbol - e.g. "^NSEI" or "^BSESN"
 * @returns {Promise<object>} Parsed chart result
 */
async function fetchYahooChart(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5y&interval=1mo`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance returned ${res.status} for ${symbol}`);
  }

  const json = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) {
    throw new Error(`No chart data returned for ${symbol}`);
  }

  return result;
}

/**
 * Parse Yahoo chart result into structured index data.
 * Extracts current price, YTD %, and last 3 completed calendar years' returns.
 */
function parseChartData(result) {
  const meta = result.meta;
  const current = meta.regularMarketPrice;
  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];

  // Build month-by-month data points with dates
  const points = timestamps.map((ts, i) => ({
    date: new Date(ts * 1000),
    close: closes[i],
  })).filter((p) => p.close != null);

  if (points.length === 0) {
    throw new Error('No valid data points found');
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  // Find the closest data point to the end of a given year (last trading day of Dec)
  function findYearEndClose(year) {
    const yearPoints = points.filter((p) => p.date.getFullYear() === year);
    if (yearPoints.length === 0) return null;
    // Take the last available data point of that year
    return yearPoints[yearPoints.length - 1].close;
  }

  // Find the closest data point to the start of the current year (first trading day of Jan)
  function findYearStartClose(year) {
    // Use the last point of the previous year as the "start" baseline
    return findYearEndClose(year - 1);
  }

  // YTD: compare current price to the end of last year
  const lastYearEndClose = findYearEndClose(currentYear - 1);
  const ytdPercent = lastYearEndClose
    ? parseFloat((((current - lastYearEndClose) / lastYearEndClose) * 100).toFixed(2))
    : null;

  // Last 3 completed calendar years
  const yearly = [];
  for (let y = currentYear - 1; y >= currentYear - 3; y--) {
    const endClose = findYearEndClose(y);
    const startClose = findYearEndClose(y - 1);
    if (endClose != null && startClose != null) {
      const returnPercent = parseFloat((((endClose - startClose) / startClose) * 100).toFixed(2));
      yearly.push({ year: y, returnPercent });
    }
  }

  return {
    current: parseFloat(current.toFixed(2)),
    ytdPercent,
    yearly,
  };
}

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check cache
  const now = Date.now();
  if (cache.data && now - cache.timestamp < CACHE_TTL_MS) {
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cache.data);
  }

  try {
    // Fetch both indices in parallel
    const [niftyRaw, sensexRaw] = await Promise.all([
      fetchYahooChart('^NSEI'),
      fetchYahooChart('^BSESN'),
    ]);

    const data = {
      nifty: parseChartData(niftyRaw),
      sensex: parseChartData(sensexRaw),
      asOf: new Date().toISOString(),
    };

    // Update cache
    cache = { data, timestamp: now };

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(data);
  } catch (err) {
    console.error('Market data fetch error:', err.message);
    return res.status(502).json({
      error: 'Failed to fetch market data. Yahoo Finance may be temporarily unavailable.',
      detail: err.message,
    });
  }
}
