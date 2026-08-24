import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Local dev proxy for the /api/market-data serverless function.
    // In production (Vercel), the real serverless function in /api/ handles this.
    {
      name: 'market-data-dev-proxy',
      configureServer(server) {
        server.middlewares.use('/api/market-data', async (req, res) => {
          try {
            const symbols = ['^NSEI', '^BSESN'];
            const results = await Promise.all(
              symbols.map(async (symbol) => {
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=16y&interval=1mo`;
                const r = await fetch(url, {
                  headers: {
                    'User-Agent':
                      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  },
                });
                if (!r.ok) throw new Error(`Yahoo returned ${r.status} for ${symbol}`);
                const json = await r.json();
                const result = json?.chart?.result?.[0];
                if (!result) throw new Error(`No data for ${symbol}`);
                return result;
              })
            );

            function parseChartData(result) {
              const meta = result.meta;
              const current = meta.regularMarketPrice;
              const timestamps = result.timestamp || [];
              const closes = result.indicators?.quote?.[0]?.close || [];
              const points = timestamps
                .map((ts, i) => ({ date: new Date(ts * 1000), close: closes[i] }))
                .filter((p) => p.close != null);
              if (points.length === 0) throw new Error('No valid data points');

              const now = new Date();
              const currentYear = now.getFullYear();
              function findYearEndClose(year) {
                const yp = points.filter((p) => p.date.getFullYear() === year);
                return yp.length ? yp[yp.length - 1].close : null;
              }

              const lastYearEnd = findYearEndClose(currentYear - 1);
              const ytdPercent = lastYearEnd
                ? parseFloat((((current - lastYearEnd) / lastYearEnd) * 100).toFixed(2))
                : null;

              const yearly = [];
              for (let y = currentYear - 1; y >= currentYear - 15; y--) {
                const end = findYearEndClose(y);
                const start = findYearEndClose(y - 1);
                if (end != null && start != null) {
                  yearly.push({
                    year: y,
                    returnPercent: parseFloat((((end - start) / start) * 100).toFixed(2)),
                  });
                }
              }
              return { current: parseFloat(current.toFixed(2)), ytdPercent, yearly };
            }

            const data = {
              nifty: parseChartData(results[0]),
              sensex: parseChartData(results[1]),
              asOf: new Date().toISOString(),
            };

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (err) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      },
    },
  ],
})
