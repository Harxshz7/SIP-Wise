import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
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
    "description": "Use our free SIP calculator India to estimate your mutual fund returns. A fast and accurate monthly investment calculator for your financial goals.",
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
        <title>SIP Calculator India — Calculate Mutual Fund Returns | Sipwise</title>
        <meta name="description" content="Use our free SIP calculator India to estimate your mutual fund returns. A fast and accurate monthly investment calculator for your financial goals." />
        <link rel="canonical" href="https://sipwise.vercel.app/" />
        <meta property="og:title" content="SIP Calculator India — Calculate Mutual Fund Returns | Sipwise" />
        <meta property="og:description" content="Use our free SIP calculator India to estimate your mutual fund returns. A fast and accurate monthly investment calculator for your financial goals." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sipwise.vercel.app/" />
        <meta property="og:image" content="https://sipwise.vercel.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SIP Calculator India — Calculate Mutual Fund Returns | Sipwise" />
        <meta name="twitter:description" content="Use our free SIP calculator India to estimate your mutual fund returns. A fast and accurate monthly investment calculator for your financial goals." />
        <meta name="twitter:image" content="https://sipwise.vercel.app/og-image.png" />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>
      
      <h1 className="sr-only">SIP Calculator India</h1>

      {/* Introduction */}
      <div className="bevel-out bg-white p-3 lg:col-span-2 text-sm leading-relaxed border border-border-dark">
        A mutual fund SIP calculator helps you project the future value of your investments. By using this monthly investment calculator, you can visualize how compounding grows your wealth over time based on expected returns.{' '}
        <Link to="/about" className="text-accent hover:underline retro-focus font-bold">Learn what SIP is</Link> or{' '}
        <Link to="/compare" className="text-accent hover:underline retro-focus font-bold">see how SIP compares to FD and RD</Link>.
      </div>

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
