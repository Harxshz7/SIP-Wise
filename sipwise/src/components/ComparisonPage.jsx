import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
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
import { calculateSIP } from '../utils/sipCalculator';
import {
  calculateFD,
  calculateRD,
  getComparisonBreakdown,
} from '../utils/comparisonCalculator';
import { formatCurrency, formatCompact } from '../utils/formatCurrency';

/* ── Defaults ───────────────────────────────────────────────────── */
const DEFAULTS = {
  monthlyAmount: 5000,
  years: 10,
  sipRate: 12,
  fdRate: 7,
  rdRate: 6.5,
};

/* ── Input field definitions ────────────────────────────────────── */
const SHARED_FIELDS = [
  {
    key: 'monthlyAmount',
    label: 'MONTHLY AMOUNT',
    min: 500,
    max: 200000,
    step: 500,
    prefix: '₹',
    suffix: '',
  },
  {
    key: 'years',
    label: 'TIME PERIOD',
    min: 1,
    max: 40,
    step: 1,
    prefix: '',
    suffix: ' YRS',
  },
];

const RATE_FIELDS = [
  {
    key: 'sipRate',
    label: 'SIP EXPECTED RETURN',
    min: 1,
    max: 30,
    step: 0.5,
    color: '#00AA00', // success-dark
    borderClass: 'border-l-4 border-l-success-dark',
  },
  {
    key: 'fdRate',
    label: 'FD INTEREST RATE',
    min: 1,
    max: 15,
    step: 0.1,
    color: '#0000FF', // accent blue
    borderClass: 'border-l-4 border-l-accent',
  },
  {
    key: 'rdRate',
    label: 'RD INTEREST RATE',
    min: 1,
    max: 15,
    step: 0.1,
    color: '#CCAA00', // tertiary gold (darker for visibility)
    borderClass: 'border-l-4 border-l-tertiary',
  },
];

/* ── Beveled input row (reuses InputPanel's pattern) ────────────── */
function BeveledInput({ field, value, onChange, onBlur, colorBorder }) {
  return (
    <div className={`bevel-out bg-background p-2.5 transition-none ${colorBorder || ''}`}>
      {/* Label row */}
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={`compare-input-${field.key}`}
          className="text-[11px] font-heading tracking-wider text-black select-none"
        >
          {field.label}
        </label>

        {/* Sunken number input */}
        <div className="flex items-center bg-white bevel-in px-1 py-0.5 w-24">
          {field.prefix && (
            <span className="text-xs text-muted font-mono select-none mr-1">{field.prefix}</span>
          )}
          <input
            id={`compare-input-${field.key}`}
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
          <span className="text-xs text-muted font-mono select-none ml-1">
            {field.suffix || '%'}
          </span>
        </div>
      </div>

      {/* Retro range slider */}
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

      {/* Min / Max hint */}
      <div className="flex justify-between mt-1 text-[9px] font-mono text-muted select-none">
        <span>
          {field.prefix}{field.min.toLocaleString('en-IN')}{field.suffix || '%'}
        </span>
        <span>
          {field.prefix}{field.max.toLocaleString('en-IN')}{field.suffix || '%'}
        </span>
      </div>
    </div>
  );
}

/* ── Custom tooltip for the comparison chart ────────────────────── */
function ComparisonTooltip({ active, payload, label }) {
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
          <span className="font-bold">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Result mini-card ───────────────────────────────────────────── */
function ComparisonResultCard({ label, invested, returns, maturity, titleBg, borderAccent }) {
  return (
    <div className={`bevel-out bg-background p-1 select-none ${borderAccent || ''}`}>
      {/* Card title bar */}
      <div className={`${titleBg} px-2 py-0.5 text-[10px] font-heading text-white tracking-wider`}>
        {label}
      </div>

      {/* Content area */}
      <div className="bg-white bevel-in m-1 p-3 space-y-1">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-muted uppercase">Invested</span>
          <span className="font-bold text-black">{formatCurrency(invested)}</span>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-muted uppercase">Returns</span>
          <span className="font-bold text-success-dark">{formatCurrency(returns)}</span>
        </div>
        <hr className="hr-groove" />
        <div className="flex justify-between text-xs font-mono">
          <span className="text-muted uppercase font-bold">Maturity</span>
          <span className="font-bold text-black text-sm">{formatCurrency(maturity)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main page component ────────────────────────────────────────── */
export default function ComparisonPage() {
  const [inputs, setInputs] = useState(DEFAULTS);

  const handleChange = useCallback((field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Compute results ──────────────────────────────────────────
  const sipResult = useMemo(() => {
    const { monthlyAmount, sipRate, years } = inputs;
    if (monthlyAmount <= 0 || sipRate <= 0 || years <= 0) {
      return { invested: 0, returns: 0, maturity: 0 };
    }
    // Reuse calculateSIP directly — guaranteed identical numbers to main calculator
    return calculateSIP(monthlyAmount, sipRate, years);
  }, [inputs]);

  const fdResult = useMemo(() => {
    const { monthlyAmount, fdRate, years } = inputs;
    if (monthlyAmount <= 0 || fdRate <= 0 || years <= 0) {
      return { invested: 0, returns: 0, maturity: 0 };
    }
    // FD principal = total committed capital (monthlyAmount × 12 × years) as a lumpsum
    const fdPrincipal = monthlyAmount * 12 * years;
    return calculateFD(fdPrincipal, fdRate, years);
  }, [inputs]);

  const rdResult = useMemo(() => {
    const { monthlyAmount, rdRate, years } = inputs;
    if (monthlyAmount <= 0 || rdRate <= 0 || years <= 0) {
      return { invested: 0, returns: 0, maturity: 0 };
    }
    return calculateRD(monthlyAmount, rdRate, years);
  }, [inputs]);

  // ── Chart data ───────────────────────────────────────────────
  const chartData = useMemo(() => {
    const { monthlyAmount, sipRate, fdRate, rdRate, years } = inputs;
    if (monthlyAmount <= 0 || years <= 0) return [];
    return getComparisonBreakdown(monthlyAmount, sipRate, fdRate, rdRate, years);
  }, [inputs]);

  // ── Winner callout ───────────────────────────────────────────
  const callout = useMemo(() => {
    const results = [
      { name: 'SIP', maturity: sipResult.maturity },
      { name: 'FD', maturity: fdResult.maturity },
      { name: 'RD', maturity: rdResult.maturity },
    ];
    results.sort((a, b) => b.maturity - a.maturity);

    const winner = results[0];
    const others = results.slice(1);

    if (winner.maturity === 0) return null;

    const parts = others
      .map((o) => `${o.name} BY ${formatCurrency(winner.maturity - o.maturity)}`)
      .join(' AND ');

    return `${winner.name} OUTPERFORMS ${parts} AT THESE SETTINGS`;
  }, [sipResult, fdResult, rdResult]);

  return (
    <div className="p-3 bg-background">
      <Helmet>
        <title>SIP vs FD Calculator — SIP vs FD vs RD Comparison | Sipwise</title>
        <meta name="description" content="Use our SIP vs FD calculator for a detailed SIP vs FD vs RD comparison. See how market-linked growth stacks up against fixed deposit returns." />
        <link rel="canonical" href="https://sipwise.vercel.app/compare" />
        <meta property="og:title" content="SIP vs FD Calculator — SIP vs FD vs RD Comparison | Sipwise" />
        <meta property="og:description" content="Use our SIP vs FD calculator for a detailed SIP vs FD vs RD comparison. See how market-linked growth stacks up against fixed deposit returns." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sipwise.vercel.app/compare" />
        <meta property="og:image" content="https://sipwise.vercel.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SIP vs FD Calculator — SIP vs FD vs RD Comparison | Sipwise" />
        <meta name="twitter:description" content="Use our SIP vs FD calculator for a detailed SIP vs FD vs RD comparison. See how market-linked growth stacks up against fixed deposit returns." />
        <meta name="twitter:image" content="https://sipwise.vercel.app/og-image.png" />
      </Helmet>

      {/* Comparison window */}
      <div className="bevel-out bg-background p-1">

        {/* Title bar */}
        <div className="title-bar-gradient flex items-center px-2 py-1 select-none">
          <span className="text-white font-heading text-sm tracking-wide">
            SIPWISE.EXE
          </span>
          <span className="text-white font-sans text-xs font-bold ml-2">
            — SIP vs FD vs RD
          </span>
        </div>

        {/* Content area */}
        <div className="bevel-in bg-white p-4 sm:p-6 space-y-6">

          <h1 className="sr-only">SIP vs FD vs RD Comparison</h1>

          <div className="text-sm leading-relaxed mb-4 text-black px-1 border-b border-border-dark pb-4">
            This SIP vs FD calculator provides a clear SIP vs FD vs RD comparison. It helps you evaluate if taking market risks could potentially yield better results than standard fixed deposit returns.
          </div>

          {/* ── Input controls ─────────────────────────────── */}
          <section>
            <h2 className="bg-title-bar text-white px-2 py-1 text-xs font-bold font-heading tracking-wide mb-3">
              COMPARE.CFG — INPUT PARAMETERS
            </h2>

            {/* Shared inputs: Monthly Amount + Tenure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {SHARED_FIELDS.map((f) => (
                <BeveledInput
                  key={f.key}
                  field={f}
                  value={inputs[f.key]}
                  onChange={handleChange}
                />
              ))}
            </div>

            {/* Three independent rate inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RATE_FIELDS.map((f) => (
                <BeveledInput
                  key={f.key}
                  field={f}
                  value={inputs[f.key]}
                  onChange={handleChange}
                  colorBorder={f.borderClass}
                />
              ))}
            </div>
          </section>

          <hr className="hr-groove" />

          {/* ── Result cards ─────────────────────────────────── */}
          <section>
            <h2 className="bg-title-bar text-white px-2 py-1 text-xs font-bold font-heading tracking-wide mb-3">
              RESULTS.DAT — MATURITY COMPARISON
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ComparisonResultCard
                label="SIP (MUTUAL FUND)"
                invested={sipResult.invested}
                returns={sipResult.returns}
                maturity={sipResult.maturity}
                titleBg="bg-success-dark"
                borderAccent="border-l-4 border-l-success-dark"
              />
              <ComparisonResultCard
                label="FIXED DEPOSIT"
                invested={fdResult.invested}
                returns={fdResult.returns}
                maturity={fdResult.maturity}
                titleBg="bg-accent"
                borderAccent="border-l-4 border-l-accent"
              />
              <ComparisonResultCard
                label="RECURRING DEPOSIT"
                invested={rdResult.invested}
                returns={rdResult.returns}
                maturity={rdResult.maturity}
                titleBg="bg-[#CCAA00]"
                borderAccent="border-l-4 border-l-[#CCAA00]"
              />
            </div>
          </section>

          <hr className="hr-groove" />

          {/* ── Chart ─────────────────────────────────────────── */}
          <section>
            <h2 className="sr-only">Growth Comparison Chart</h2>

            <div className="bevel-out bg-background p-1 select-none">
              {/* Title strip */}
              <div className="bg-title-bar text-white px-2 py-0.5 text-[10px] font-heading tracking-wider uppercase">
                COMPARE.GRA — GROWTH OVERLAY
              </div>

              {/* Chart container sunken panel */}
              <div className="bg-white bevel-in m-1 p-2 sm:p-4">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        stroke="#808080"
                        strokeDasharray="none"
                      />

                      <XAxis
                        dataKey="year"
                        tick={{ fill: '#000000', fontSize: 11, fontFamily: 'Courier New, monospace' }}
                        axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                        tickLine={{ stroke: '#000000' }}
                        tickFormatter={(v) => `Y${v}`}
                      />

                      <YAxis
                        tick={{ fill: '#000000', fontSize: 11, fontFamily: 'Courier New, monospace' }}
                        axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                        tickLine={{ stroke: '#000000' }}
                        tickFormatter={formatCompact}
                        width={65}
                      />

                      <Tooltip content={<ComparisonTooltip />} />

                      <Legend
                        iconType="square"
                        iconSize={8}
                        wrapperStyle={{ paddingTop: 12, fontSize: 11, fontFamily: 'Courier New, monospace' }}
                        formatter={(value) => (
                          <span className="text-black font-bold font-mono">{value.toUpperCase()}</span>
                        )}
                      />

                      {/* Invested baseline (muted gray) */}
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

                      {/* SIP — success green */}
                      <Line
                        type="linear"
                        dataKey="sipValue"
                        name="SIP"
                        stroke="#00AA00"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 4, stroke: '#000000', strokeWidth: 2, fill: '#00AA00' }}
                      />

                      {/* FD — accent blue */}
                      <Line
                        type="linear"
                        dataKey="fdValue"
                        name="FD"
                        stroke="#0000FF"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 4, stroke: '#000000', strokeWidth: 2, fill: '#0000FF' }}
                      />

                      {/* RD — tertiary gold */}
                      <Line
                        type="linear"
                        dataKey="rdValue"
                        name="RD"
                        stroke="#CCAA00"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 4, stroke: '#000000', strokeWidth: 2, fill: '#CCAA00' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-muted text-xs font-mono py-8">
                    NO DATA — SET VALID INPUTS ABOVE
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Winner callout ─────────────────────────────────── */}
          {callout && (
            <div className="bevel-out bg-panel-yellow p-1">
              <div className="bg-title-bar text-white px-2 py-0.5 text-[10px] font-heading tracking-wider uppercase">
                VERDICT.TXT
              </div>
              <div className="bevel-in bg-white m-1 p-3 sm:p-4 text-center">
                <p className="font-mono text-xs sm:text-sm font-bold tracking-wide text-black uppercase">
                  {callout}
                </p>
              </div>
            </div>
          )}

          <hr className="hr-groove" />

          {/* ── Accessible data table (screen reader fallback) ──── */}
          <section>
            <h2 className="bg-title-bar text-white px-2 py-1 text-xs font-bold font-heading tracking-wide mb-3">
              COMPARE.TXT — YEAR-WISE BREAKDOWN
            </h2>

            <div className="bevel-out bg-background p-1">
              <div className="bg-white bevel-in m-1 overflow-x-auto">
                <table className="w-full min-w-[600px] text-xs border-collapse">
                  <thead>
                    <tr className="bg-title-bar text-white">
                      <th className="px-3 py-2 text-left font-heading uppercase tracking-wider border-r border-b border-border-dark">
                        Year
                      </th>
                      <th className="px-3 py-2 text-right font-heading uppercase tracking-wider border-r border-b border-border-dark">
                        Invested
                      </th>
                      <th className="px-3 py-2 text-right font-heading uppercase tracking-wider border-r border-b border-border-dark" style={{ color: '#90EE90' }}>
                        SIP Value
                      </th>
                      <th className="px-3 py-2 text-right font-heading uppercase tracking-wider border-r border-b border-border-dark" style={{ color: '#87CEEB' }}>
                        FD Value
                      </th>
                      <th className="px-3 py-2 text-right font-heading uppercase tracking-wider border-b border-border-dark" style={{ color: '#FFD700' }}>
                        RD Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-black">
                    {chartData.map((row, index) => {
                      const isEven = index % 2 === 0;
                      return (
                        <tr
                          key={row.year}
                          className={isEven ? 'bg-white' : 'bg-[#E8E8E8]'}
                        >
                          <td className="px-3 py-1.5 font-bold border-r border-b border-border-dark">
                            {row.year}
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono border-r border-b border-border-dark">
                            {formatCurrency(row.invested)}
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono font-bold border-r border-b border-border-dark text-success-dark">
                            {formatCurrency(row.sipValue)}
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono font-bold border-r border-b border-border-dark text-accent">
                            {formatCurrency(row.fdValue)}
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono font-bold border-b border-border-dark text-[#CCAA00]">
                            {formatCurrency(row.rdValue)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <hr className="hr-groove" />

          {/* ── Disclaimer (construction stripe) ─────────────── */}
          <div className="bg-construction bevel-out border border-black p-3">
            <div className="bg-white border border-black p-3 sm:p-4 text-xs leading-relaxed space-y-2">
              <p>
                <strong>FD/RD RATES VARY BY BANK.</strong> The FD and RD interest rates used here are
                illustrative. Actual rates depend on the bank, tenure, and deposit amount. Check with
                your bank for current rates.
              </p>
              <p>
                <strong>SIP RETURNS ARE MARKET-LINKED.</strong> SIP returns are based on assumed market
                performance and are not guaranteed. Actual returns will vary based on market conditions
                and fund performance.
              </p>
              <p>
                <strong>ILLUSTRATIVE ESTIMATE ONLY.</strong> This comparison is for educational purposes
                only and does not constitute investment, financial, or tax advice. Consult a licensed
                financial advisor before making investment decisions.
              </p>
            </div>
          </div>

          <hr className="hr-groove" />

          {/* ── Bottom: Back button + hit counter ────────────── */}
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
              COMPARE v1.00 • SIPWISE ENGINE 95
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
