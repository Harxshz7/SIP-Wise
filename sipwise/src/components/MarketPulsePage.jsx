// MarketPulsePage — Win95-style market data page with Real-History SIP Simulation
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { calculateSIP, getYearlyBreakdown } from '../utils/sipCalculator';
import { simulateHistoricalSIP } from '../utils/historicalSimulator';
import { formatCurrency, formatCompact } from '../utils/formatCurrency';

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

/* ── Simulation input fields ────────────────────────────────────── */
const SIM_FIELDS = [
  {
    key: 'monthlyAmount',
    label: 'MONTHLY INVESTMENT',
    min: 500,
    max: 200000,
    step: 500,
    prefix: '₹',
    suffix: '',
  },
  {
    key: 'assumedRate',
    label: 'FLAT-RATE ASSUMED RETURN',
    min: 1,
    max: 30,
    step: 0.5,
    prefix: '',
    suffix: '%',
  },
  {
    key: 'years',
    label: 'TIME PERIOD',
    min: 1,
    max: 15,
    step: 1,
    prefix: '',
    suffix: ' YRS',
  },
];

/* ── Beveled input row (same pattern as InputPanel) ──────────────── */
function SimInput({ field, value, onChange }) {
  return (
    <div className="bevel-out bg-background p-2.5 transition-none">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={`sim-input-${field.key}`}
          className="text-[11px] font-heading tracking-wider text-black select-none"
        >
          {field.label}
        </label>
        <div className="flex items-center bg-white bevel-in px-1 py-0.5 w-24">
          {field.prefix && (
            <span className="text-xs text-muted font-mono select-none mr-1">{field.prefix}</span>
          )}
          <input
            id={`sim-input-${field.key}`}
            type="number"
            min={field.min}
            max={field.max}
            step={field.step}
            value={value}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              if (!Number.isNaN(parsed) && parsed >= 0) onChange(field.key, parsed);
            }}
            onBlur={(e) => {
              const parsed = Number(e.target.value);
              if (Number.isNaN(parsed) || parsed < 0) {
                onChange(field.key, field.min);
                return;
              }
              const clamped = Math.min(Math.max(parsed, field.min), field.max);
              if (clamped !== parsed) onChange(field.key, clamped);
            }}
            className="w-full bg-transparent text-right text-xs font-mono font-bold text-black
                       outline-none appearance-none border-none p-0 retro-focus"
          />
          {field.suffix && (
            <span className="text-xs text-muted font-mono select-none ml-1">{field.suffix}</span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(e) => onChange(field.key, Number(e.target.value))}
        aria-label={field.label}
        className="retro-slider w-full mt-2 transition-none"
      />
      <div className="flex justify-between mt-1 text-[9px] font-mono text-muted select-none">
        <span>{field.prefix}{field.min.toLocaleString('en-IN')}{field.suffix}</span>
        <span>{field.prefix}{field.max.toLocaleString('en-IN')}{field.suffix}</span>
      </div>
    </div>
  );
}

/* ── Chart tooltip ──────────────────────────────────────────────── */
function SimTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bevel-out bg-white p-2 font-mono text-[11px] text-black">
      <div className="border-b border-border-dark pb-1 mb-1 font-bold">
        YEAR {label}
      </div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block w-2.5 h-2.5 border border-black"
            style={{ backgroundColor: entry.stroke || entry.color }}
          />
          <span>{entry.name}:</span>
          <span className="font-bold">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── SIP Simulation section ──────────────────────────────────────── */
function SimulationSection({ marketData }) {
  const [simInputs, setSimInputs] = useState({
    monthlyAmount: 5000,
    assumedRate: 12,
    years: 5,
  });
  const [selectedIndex, setSelectedIndex] = useState('nifty');

  const handleSimChange = useCallback((field, value) => {
    setSimInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Get the yearly returns for the selected index
  const yearlyReturns = marketData[selectedIndex]?.yearly || [];
  const indexLabel = selectedIndex === 'nifty' ? 'Nifty 50' : 'Sensex';

  // ── Flat-rate estimate (uses calculateSIP directly — zero drift) ──
  const flatResult = useMemo(() => {
    const { monthlyAmount, assumedRate, years } = simInputs;
    if (monthlyAmount <= 0 || assumedRate <= 0 || years <= 0) {
      return { invested: 0, returns: 0, maturity: 0 };
    }
    return calculateSIP(monthlyAmount, assumedRate, years);
  }, [simInputs]);

  // ── Historical simulation ─────────────────────────────────────
  const histResult = useMemo(() => {
    const { monthlyAmount, years } = simInputs;
    if (monthlyAmount <= 0 || years <= 0 || yearlyReturns.length === 0) {
      return null;
    }
    return simulateHistoricalSIP(monthlyAmount, years, yearlyReturns, indexLabel);
  }, [simInputs, yearlyReturns, indexLabel]);

  // ── Chart data: overlay flat-rate vs real-history ──────────────
  const chartData = useMemo(() => {
    const { monthlyAmount, assumedRate, years } = simInputs;
    if (monthlyAmount <= 0 || years <= 0) return [];

    // Use the number of years actually simulated
    const simYears = histResult ? histResult.yearsSimulated : years;
    const flatBreakdown = getYearlyBreakdown(monthlyAmount, assumedRate, simYears, 0);
    const histBreakdown = histResult?.yearlyBreakdown || [];

    const data = [];
    for (let i = 0; i < simYears; i++) {
      const flatRow = flatBreakdown[i];
      const histRow = histBreakdown[i];
      data.push({
        year: histRow ? histRow.year : flatRow.year,
        invested: flatRow.invested,
        flatValue: flatRow.value,
        histValue: histRow ? histRow.value : null,
      });
    }
    return data;
  }, [simInputs, histResult]);

  return (
    <section id="simulation">
      <h2 className="bg-title-bar text-white px-2 py-1 text-xs font-bold font-heading tracking-wide mb-3">
        SIMULATE.EXE — REAL-HISTORY SIP SIMULATION
      </h2>

      <div className="space-y-4">
        {/* Index selector */}
        <div className="bevel-out bg-background p-2.5">
          <div className="text-[11px] font-heading tracking-wider text-black select-none mb-2">
            SELECT INDEX
          </div>
          <div className="flex gap-2">
            {[
              { key: 'nifty', label: 'NIFTY 50' },
              { key: 'sensex', label: 'SENSEX' },
            ].map((idx) => (
              <button
                key={idx.key}
                onClick={() => setSelectedIndex(idx.key)}
                className={`px-3 py-1 text-xs font-heading font-bold tracking-wide cursor-pointer
                  retro-focus select-none ${
                    selectedIndex === idx.key
                      ? 'bevel-in bg-white text-accent'
                      : 'bevel-out bg-background text-black hover:bg-[#d0d0d0]'
                  }`}
              >
                {idx.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SIM_FIELDS.map((f) => (
            <SimInput
              key={f.key}
              field={f}
              value={simInputs[f.key]}
              onChange={handleSimChange}
            />
          ))}
        </div>

        {/* Data limited warning */}
        {histResult?.dataLimited && (
          <div className="bevel-out bg-panel-yellow p-2 text-xs font-mono text-black" role="alert" aria-live="polite">
            <span className="font-bold">⚠ NOTE:</span> ONLY {histResult.yearsSimulated} YEAR{histResult.yearsSimulated !== 1 ? 'S' : ''} OF
            HISTORICAL DATA AVAILABLE FOR {indexLabel.toUpperCase()} — SIMULATION SHORTENED FROM {simInputs.years} YEAR{simInputs.years !== 1 ? 'S' : ''}
          </div>
        )}

        {/* Side-by-side result cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Flat-rate estimate card */}
          <div className="bevel-out bg-background p-1 select-none border-l-4 border-l-accent">
            <div className="bg-accent px-2 py-0.5 text-[10px] font-heading text-white tracking-wider">
              FLAT-RATE ESTIMATE ({simInputs.assumedRate}% P.A.)
            </div>
            <div className="bg-white bevel-in m-1 p-3 space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted uppercase">Invested</span>
                <span className="font-bold text-black">{formatCurrency(flatResult.invested)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted uppercase">Returns</span>
                <span className="font-bold text-success-dark">{formatCurrency(flatResult.returns)}</span>
              </div>
              <hr className="hr-groove" />
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted uppercase font-bold">Maturity</span>
                <span className="font-bold text-black text-sm">{formatCurrency(flatResult.maturity)}</span>
              </div>
            </div>
          </div>

          {/* Real-history simulation card */}
          <div className="bevel-out bg-background p-1 select-none border-l-4 border-l-success-dark">
            <div className="bg-success-dark px-2 py-0.5 text-[10px] font-heading text-white tracking-wider">
              REAL-HISTORY ({indexLabel.toUpperCase()}, {histResult ? histResult.yearsSimulated : 0}YR)
            </div>
            <div className="bg-white bevel-in m-1 p-3 space-y-1">
              {histResult ? (
                <>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted uppercase">Invested</span>
                    <span className="font-bold text-black">{formatCurrency(histResult.invested)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-muted uppercase">Returns</span>
                    <span className={`font-bold ${histResult.returns >= 0 ? 'text-success-dark' : 'text-secondary'}`}>
                      {formatCurrency(histResult.returns)}
                    </span>
                  </div>
                  <hr className="hr-groove" />
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted uppercase font-bold">Maturity</span>
                    <span className="font-bold text-black text-sm">{formatCurrency(histResult.maturity)}</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted text-xs font-mono py-2">
                  NO HISTORICAL DATA
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overlay chart */}
        {chartData.length > 0 && (
          <div className="bevel-out bg-background p-1 select-none">
            <div className="bg-title-bar text-white px-2 py-0.5 text-[10px] font-heading tracking-wider uppercase">
              SIMULATE.GRA — FLAT-RATE vs REAL-HISTORY
            </div>
            <div className="bg-white bevel-in m-1 p-2 sm:p-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="#808080" strokeDasharray="none" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#000000', fontSize: 11, fontFamily: 'Courier New, monospace' }}
                    axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                    tickLine={{ stroke: '#000000' }}
                  />
                  <YAxis
                    tick={{ fill: '#000000', fontSize: 11, fontFamily: 'Courier New, monospace' }}
                    axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                    tickLine={{ stroke: '#000000' }}
                    tickFormatter={formatCompact}
                    width={65}
                  />
                  <Tooltip content={<SimTooltip />} />
                  <Legend
                    iconType="square"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: 12, fontSize: 11, fontFamily: 'Courier New, monospace' }}
                    formatter={(value) => (
                      <span className="text-black font-bold font-mono">{value.toUpperCase()}</span>
                    )}
                  />

                  {/* Invested baseline (muted gray dashed) */}
                  <Line
                    type="linear"
                    dataKey="invested"
                    name="Invested"
                    stroke="#808080"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={false}
                    activeDot={{ r: 3, stroke: '#000000', strokeWidth: 2, fill: '#808080' }}
                  />

                  {/* Flat-rate estimate — accent blue */}
                  <Line
                    type="linear"
                    dataKey="flatValue"
                    name="Flat-Rate Estimate"
                    stroke="#0000FF"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, stroke: '#000000', strokeWidth: 2, fill: '#0000FF' }}
                  />

                  {/* Real-history — success green */}
                  <Line
                    type="linear"
                    dataKey="histValue"
                    name={`Real History (${indexLabel})`}
                    stroke="#00AA00"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4, stroke: '#000000', strokeWidth: 2, fill: '#00AA00' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Accessible breakdown table */}
        {histResult && histResult.yearlyBreakdown.length > 0 && (
          <div className="bevel-out bg-background p-1">
            <div className="bg-title-bar text-white px-2 py-0.5 text-[10px] font-heading tracking-wider uppercase">
              SIMULATE.TXT — YEAR-WISE BREAKDOWN
            </div>
            <div className="bg-white bevel-in m-1 overflow-x-auto">
              <table className="w-full min-w-[520px] text-xs border-collapse">
                <thead>
                  <tr className="bg-title-bar text-white">
                    <th className="px-3 py-2 text-left font-heading uppercase tracking-wider border-r border-b border-border-dark">
                      Year
                    </th>
                    <th className="px-3 py-2 text-right font-heading uppercase tracking-wider border-r border-b border-border-dark">
                      Index Return
                    </th>
                    <th className="px-3 py-2 text-right font-heading uppercase tracking-wider border-r border-b border-border-dark">
                      Invested
                    </th>
                    <th className="px-3 py-2 text-right font-heading uppercase tracking-wider border-b border-border-dark">
                      Portfolio Value
                    </th>
                  </tr>
                </thead>
                <tbody className="text-black">
                  {histResult.yearlyBreakdown.map((row, index) => {
                    const isEven = index % 2 === 0;
                    const isPositive = row.indexReturnThatYear >= 0;
                    return (
                      <tr key={row.year} className={isEven ? 'bg-white' : 'bg-[#E8E8E8]'}>
                        <td className="px-3 py-1.5 font-bold border-r border-b border-border-dark">
                          {row.year}
                        </td>
                        <td className={`px-3 py-1.5 text-right font-mono font-bold border-r border-b border-border-dark ${
                          isPositive ? 'text-success-dark' : 'text-secondary'
                        }`}>
                          {isPositive ? '+' : ''}{row.indexReturnThatYear}%
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono border-r border-b border-border-dark">
                          {formatCurrency(row.invested)}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold border-b border-border-dark">
                          {formatCurrency(row.value)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Simulation disclaimer */}
        <div className="bg-construction bevel-out border border-black p-3">
          <div className="bg-white border border-black p-3 sm:p-4 text-xs leading-relaxed space-y-2">
            <p>
              <strong>HISTORICAL SIMULATION.</strong> This simulation uses actual past index returns
              and does not predict future performance. Past performance is not indicative of future results.
            </p>
            <p>
              <strong>SIMPLIFIED MODEL.</strong> Real SIP returns depend on the specific mutual fund,
              NAV at each purchase date, and market timing within each month — not just annual index returns.
              This is an illustrative approximation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════ */
/*  Main MarketPulsePage component                                  */
/* ═════════════════════════════════════════════════════════════════ */

export default function MarketPulsePage() {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const location = useLocation();

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

  // Scroll to #simulation anchor when data loads and hash is present
  useEffect(() => {
    if (location.hash === '#simulation' && !state.loading) {
      const el = document.getElementById('simulation');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.hash, state.loading]);

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

              <hr className="hr-groove" />

              {/* ── SIP Simulation Section ──────────────────── */}
              <SimulationSection marketData={state.data} />
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
              MARKET PULSE v2.00 • SIPWISE ENGINE 95
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
