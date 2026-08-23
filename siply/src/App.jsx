import { useState, useMemo, useCallback } from 'react';
import Marquee from 'react-fast-marquee';
import { calculateSIP, calculateStepUpSIP, getYearlyBreakdown } from './utils/sipCalculator';
import { formatCurrency } from './utils/formatCurrency';
import InputPanel from './components/InputPanel';
import ResultCards from './components/ResultCards';
import GrowthChart from './components/GrowthChart';
import YearWiseTable from './components/YearWiseTable';

// ESM Interop helper for react-fast-marquee
const MarqueeComponent = Marquee && (Marquee.default || Marquee);

const DEFAULTS = {
  monthlyAmount: 5000,
  annualRate: 12,
  years: 10,
  stepUpPercent: 0,
};

function App() {
  const [inputs, setInputs] = useState(DEFAULTS);

  const handleChange = useCallback((field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Derive SIP results — recompute only when inputs change
  const results = useMemo(() => {
    const { monthlyAmount, annualRate, years, stepUpPercent } = inputs;
    if (monthlyAmount <= 0 || annualRate <= 0 || years <= 0) {
      return { invested: 0, returns: 0, maturity: 0 };
    }
    return stepUpPercent > 0
      ? calculateStepUpSIP(monthlyAmount, annualRate, years, stepUpPercent)
      : calculateSIP(monthlyAmount, annualRate, years);
  }, [inputs]);

  // Derive yearly breakdown for chart + table
  const yearlyData = useMemo(() => {
    const { monthlyAmount, annualRate, years, stepUpPercent } = inputs;
    if (monthlyAmount <= 0 || annualRate <= 0 || years <= 0) return [];
    return getYearlyBreakdown(monthlyAmount, annualRate, years, stepUpPercent);
  }, [inputs]);

  return (
    <div className="min-h-screen bg-90s-tile text-black font-sans p-2 sm:p-6 flex flex-col justify-between">
      {/* Main retro window */}
      <div className="mx-auto w-full max-w-5xl bevel-out bg-background p-1 select-none">
        
        {/* Title bar */}
        <div className="title-bar-gradient flex items-center justify-between px-2 py-1 select-none">
          <div className="flex items-center gap-2">
            <span className="text-white font-heading text-sm md:text-base tracking-wide text-rainbow">
              SIPLY.EXE
            </span>
            <span className="text-white font-sans text-xs md:text-sm font-bold">
              — SIP CALCULATOR v1.00
            </span>
          </div>
          {/* Win95 window controls */}
          <div className="flex items-center gap-1">
            <button className="w-5 h-5 bevel-out bg-background font-bold text-xs flex items-center justify-center retro-focus cursor-pointer" aria-label="Minimize">
              _
            </button>
            <button className="w-5 h-5 bevel-out bg-background font-bold text-xs flex items-center justify-center retro-focus cursor-pointer" aria-label="Maximize">
              🗖
            </button>
            <button className="w-5 h-5 bevel-out bg-background font-bold text-xs flex items-center justify-center retro-focus text-red-700 cursor-pointer" aria-label="Close">
              X
            </button>
          </div>
        </div>

        {/* Menu bar */}
        <div className="flex items-center gap-4 px-2 py-1 text-xs border-b border-border-dark">
          <span className="cursor-pointer hover:underline">File</span>
          <span className="cursor-pointer hover:underline">Edit</span>
          <span className="cursor-pointer hover:underline">Run</span>
          <span className="cursor-pointer hover:underline">Help</span>
        </div>

        {/* Marquee strip */}
        <div className="border-b border-border-dark bg-white text-xs py-1 select-none">
          <MarqueeComponent speed={40} gradient={false} play={true}>
            <span className="px-4 font-mono font-bold tracking-wider" aria-live="polite">
              WELCOME TO SIPLY • CALCULATE YOUR SIP RETURNS • COMPOUND INTEREST IS YOUR FRIEND • MAKE YOUR WEALTH GROW FAST! •
            </span>
          </MarqueeComponent>
          {/* sr-only fallback */}
          <span className="sr-only">
            Welcome to Siply. Calculate your SIP returns. Compound interest is your friend.
          </span>
        </div>

        {/* Content Area */}
        <div className="p-3 bg-background grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
          {/* Sidebar Panel (Inputs) */}
          <aside className="bevel-in bg-panelYellow p-4 flex flex-col justify-between">
            <div>
              <div className="bg-title-bar text-white px-2 py-0.5 text-xs font-bold font-heading tracking-wide mb-4">
                CONFIG.SYS
              </div>
              <InputPanel values={inputs} onChange={handleChange} />
            </div>

            {/* Hit Counter / Wealth Gained result */}
            <div className="mt-6">
              <div className="text-[10px] uppercase font-bold text-muted mb-1">
                Accumulated Statistics
              </div>
              <div className="bg-black border-2 border-border-dark p-2 text-center text-success font-mono text-sm tracking-widest select-all">
                WEALTH GAINED: {formatCurrency(results.returns)}
              </div>
            </div>
          </aside>

          {/* Main Display Area (Results, Chart, Table) */}
          <main className="space-y-4">
            {/* Headline cards */}
            <ResultCards
              invested={results.invested}
              returns={results.returns}
              maturity={results.maturity}
            />

            {/* Chart Area */}
            <GrowthChart data={yearlyData} />

            {/* Table Area */}
            <YearWiseTable data={yearlyData} />
          </main>
        </div>
      </div>

      {/* Footer / Disclaimer with construction stripes */}
      <footer className="mx-auto w-full max-w-5xl mt-6">
        <div className="bg-construction text-black text-center py-2 bevel-out font-bold text-xs select-none border border-black">
          <span className="bg-white px-2 py-0.5 border border-black inline-block font-mono tracking-tighter">
            CAUTION: ESTIMATES ONLY. NOT INVESTMENT ADVICE. DO YOUR OWN RESEARCH.
          </span>
        </div>
        <div className="text-center text-[10px] text-muted mt-2 font-mono uppercase">
          POWERED BY SIPLY ENGINE 95 • SYSTEM PORT OK • LOCAL TIME: {new Date().toLocaleTimeString()}
        </div>
      </footer>
    </div>
  );
}

export default App;
