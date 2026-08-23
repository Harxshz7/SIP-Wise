import { useState, useMemo, useCallback } from 'react';
import { Calculator } from 'lucide-react';
import { calculateSIP, calculateStepUpSIP, getYearlyBreakdown } from './utils/sipCalculator';
import InputPanel from './components/InputPanel';
import ResultCards from './components/ResultCards';
import GrowthChart from './components/GrowthChart';
import YearWiseTable from './components/YearWiseTable';

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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-sky-600/8 blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/30">
              <Calculator size={20} className="text-indigo-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Siply
            </h1>
          </div>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Plan your SIP investments with precision. See how your money grows over time with step-up contributions.
          </p>
        </header>

        {/* Main layout: sidebar inputs + right content */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 lg:gap-8">
          {/* Input Panel */}
          <aside className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-5 sm:p-6 h-fit lg:sticky lg:top-8">
            <h2 className="text-base font-semibold text-slate-200 mb-5">
              Configure your SIP
            </h2>
            <InputPanel values={inputs} onChange={handleChange} />
          </aside>

          {/* Results area */}
          <main className="space-y-6">
            <ResultCards
              invested={results.invested}
              returns={results.returns}
              maturity={results.maturity}
            />
            <GrowthChart data={yearlyData} />
            <YearWiseTable data={yearlyData} />
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-600">
          Calculations are indicative. Actual returns depend on market conditions.
        </footer>
      </div>
    </div>
  );
}

export default App;
