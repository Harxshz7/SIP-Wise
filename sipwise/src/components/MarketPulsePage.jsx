import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Blinking animation for loading text (CSS-in-JS to avoid adding to retro.css)
const blinkStyle = `
@keyframes retro-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .retro-blink { animation: none !important; opacity: 1 !important; }
}
`;

function LoadingState() {
  return (
    <div className="bevel-in bg-black p-6 text-center" role="status" aria-live="polite">
      <style>{blinkStyle}</style>
      <span
        className="font-mono text-success text-sm tracking-widest retro-blink"
        style={{ animation: 'retro-blink 1s step-end infinite' }}
      >
        LOADING MARKET DATA...
      </span>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="bevel-out bg-background p-4 text-center" role="alert" aria-live="polite">
      <div className="bevel-in bg-white p-4">
        <p className="font-heading text-xs tracking-wide text-secondary uppercase font-bold">
          MARKET DATA UNAVAILABLE
        </p>
        <p className="font-mono text-[10px] text-muted mt-2 uppercase">
          {message || 'TRY AGAIN LATER'}
        </p>
      </div>
    </div>
  );
}

function IndexPanel({ title, data }) {
  const isYtdPositive = data.ytdPercent >= 0;

  return (
    <div className="bevel-out bg-background p-1">
      {/* Panel title bar */}
      <div className="title-bar-gradient px-2 py-1 select-none">
        <span className="text-white font-heading text-xs tracking-wide">{title}</span>
      </div>

      <div className="bevel-in bg-white p-3 sm:p-4 space-y-4">
        {/* Current value + YTD */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase font-bold text-muted mb-1">Current Value</div>
            <div className="font-mono text-lg font-bold text-black tracking-wide">
              {data.current.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bevel-in bg-black px-3 py-1.5">
            <div className="text-[10px] uppercase font-bold text-muted mb-0.5 text-center">YTD</div>
            <div
              className={`font-mono text-sm font-bold tracking-wider text-center ${
                isYtdPositive ? 'text-success' : 'text-secondary'
              }`}
            >
              {isYtdPositive ? '+' : ''}{data.ytdPercent != null ? `${data.ytdPercent}%` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Yearly performance table */}
        {data.yearly && data.yearly.length > 0 && (
          <div>
            <div className="text-[10px] uppercase font-bold text-muted mb-2">
              Annual Performance
            </div>
            <div className="bevel-in overflow-hidden">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="bg-title-bar text-white">
                    <th className="text-left px-2 py-1 font-heading tracking-wide">YEAR</th>
                    <th className="text-right px-2 py-1 font-heading tracking-wide">RETURN</th>
                  </tr>
                </thead>
                <tbody>
                  {data.yearly.map((row, idx) => {
                    const isPositive = row.returnPercent >= 0;
                    return (
                      <tr
                        key={row.year}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-panel-yellow'}
                      >
                        <td className="px-2 py-1.5 font-bold">{row.year}</td>
                        <td
                          className={`px-2 py-1.5 text-right font-bold ${
                            isPositive ? 'text-success-dark' : 'text-secondary'
                          }`}
                        >
                          {isPositive ? '+' : ''}{row.returnPercent}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarketPulsePage() {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch('/api/market-data');
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || json.error) {
          setState({
            loading: false,
            error: json.error || `Server returned ${res.status}`,
            data: null,
          });
          return;
        }

        setState({ loading: false, error: null, data: json });
      } catch (err) {
        if (cancelled) return;
        setState({
          loading: false,
          error: 'Network error — could not reach the server.',
          data: null,
        });
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-3 bg-background">
      {/* Market Pulse window */}
      <div className="bevel-out bg-background p-1">

        {/* Title bar */}
        <div className="title-bar-gradient flex items-center px-2 py-1 select-none">
          <span className="text-white font-heading text-sm tracking-wide">
            SIPWISE.EXE
          </span>
          <span className="text-white font-sans text-xs font-bold ml-2">
            — MARKET PULSE
          </span>
        </div>

        {/* Content area */}
        <div className="bevel-in bg-white p-4 sm:p-6 space-y-6">

          <h1 className="sr-only">Market Pulse</h1>

          {/* Loading state */}
          {state.loading && <LoadingState />}

          {/* Error state */}
          {state.error && <ErrorState message={state.error} />}

          {/* Success state */}
          {state.data && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section>
                  <h2 className="sr-only">Nifty 50</h2>
                  <IndexPanel title="NIFTY 50 (^NSEI)" data={state.data.nifty} />
                </section>
                <section>
                  <h2 className="sr-only">Sensex</h2>
                  <IndexPanel title="SENSEX (^BSESN)" data={state.data.sensex} />
                </section>
              </div>

              {/* Data timestamp */}
              <div className="text-center text-[10px] text-muted font-mono uppercase">
                DATA AS OF: {new Date(state.data.asOf).toLocaleString('en-IN')}
              </div>
            </>
          )}

          <hr className="hr-groove" />

          {/* Disclaimer */}
          <div className="bg-construction bevel-out border border-black p-3">
            <div className="bg-white border border-black p-3 sm:p-4 text-xs leading-relaxed space-y-2">
              <p>
                <strong>HISTORICAL DATA ONLY.</strong> Historical index performance does not
                guarantee future returns. Past performance is not indicative of future results.
              </p>
              <p>
                <strong>DATA SOURCE.</strong> Market data is sourced from public market feeds
                and may be delayed by up to one hour. Figures shown are approximate and should
                not be used for trading decisions.
              </p>
              <p>
                <strong>NOT INVESTMENT ADVICE.</strong> This information is for educational purposes
                only. Consult a licensed financial advisor before making investment decisions.
              </p>
            </div>
          </div>

          <hr className="hr-groove" />

          {/* Bottom: Back button + hit counter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/"
              className="bevel-out bg-background px-4 py-1.5 text-xs font-heading font-bold tracking-wide
                         cursor-pointer retro-focus select-none inline-block text-center
                         hover:bg-[#d0d0d0] no-underline text-black"
            >
              &laquo; BACK TO CALCULATOR
            </Link>

            {/* Hit-counter strip */}
            <div className="bevel-in bg-black px-4 py-1.5 text-success font-mono text-[10px] tracking-widest select-none">
              MARKET PULSE v1.00 • SIPWISE ENGINE 95
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
