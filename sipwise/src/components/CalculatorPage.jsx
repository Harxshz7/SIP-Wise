import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { calculateSIP, calculateStepUpSIP, getYearlyBreakdown } from '../utils/sipCalculator';
import { formatCurrency } from '../utils/formatCurrency';
import InputPanel from './InputPanel';
import ResultCards from './ResultCards';
import GrowthChart from './GrowthChart';
import YearWiseTable from './YearWiseTable';

const DEFAULTS = {
  monthlyAmount: 5000,
  annualRate: 12,
  years: 10,
  stepUpPercent: 0,
};

export default function CalculatorPage() {
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

  const schemaData = {
    "@context": "https://schema.org",
    "@type": ["WebApplication", "FinancialProduct"],
    "name": "Sipwise SIP Calculator",
    "description": "Calculate your Systematic Investment Plan returns with Sipwise.",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="p-3 bg-background grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
      <Helmet>
        <title>Sipwise — Free SIP Calculator (India)</title>
        <meta name="description" content="Calculate your Systematic Investment Plan returns with Sipwise. Easy, fast, and comprehensive tools for mutual fund investments." />
        <link rel="canonical" href="https://sipwise.vercel.app/" />
        <meta property="og:title" content="Sipwise — Free SIP Calculator (India)" />
        <meta property="og:description" content="Calculate your Systematic Investment Plan returns with Sipwise. Easy, fast, and comprehensive tools for mutual fund investments." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sipwise.vercel.app/" />
        <meta property="og:image" content="https://sipwise.vercel.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sipwise — Free SIP Calculator (India)" />
        <meta name="twitter:description" content="Calculate your Systematic Investment Plan returns with Sipwise." />
        <meta name="twitter:image" content="https://sipwise.vercel.app/og-image.png" />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      
      <h1 className="sr-only">Free SIP Calculator (India)</h1>

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
  );
}
