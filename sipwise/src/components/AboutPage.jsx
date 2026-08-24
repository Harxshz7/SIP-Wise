import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is SIP?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A Systematic Investment Plan (SIP) is a method of investing a fixed amount of money at regular intervals — typically monthly — into a mutual fund scheme."
        }
      },
      {
        "@type": "Question",
        "name": "What is Step-Up SIP?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Annual Step-Up feature lets you increase your monthly contribution by a fixed percentage at the start of each year."
        }
      }
    ]
  };

  return (
    <div className="p-3 bg-background">
      <Helmet>
        <title>What is SIP? Systematic Investment Plan Explained | Sipwise</title>
        <meta name="description" content="Wondering what is SIP? Get the systematic investment plan explained simply, understand SIP compound interest, and learn how our SIP calculator works." />
        <link rel="canonical" href="https://sipwise.vercel.app/about" />
        <meta property="og:title" content="What is SIP? Systematic Investment Plan Explained | Sipwise" />
        <meta property="og:description" content="Wondering what is SIP? Get the systematic investment plan explained simply, understand SIP compound interest, and learn how our SIP calculator works." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sipwise.vercel.app/about" />
        <meta property="og:image" content="https://sipwise.vercel.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="What is SIP? Systematic Investment Plan Explained | Sipwise" />
        <meta name="twitter:description" content="Wondering what is SIP? Get the systematic investment plan explained simply, understand SIP compound interest, and learn how our SIP calculator works." />
        <meta name="twitter:image" content="https://sipwise.vercel.app/og-image.png" />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      {/* About window */}
      <div className="bevel-out bg-background p-1">

        {/* Title bar */}
        <div className="title-bar-gradient flex items-center px-2 py-1 select-none">
          <span className="text-white font-heading text-sm tracking-wide">
            SIPWISE.EXE
          </span>
          <span className="text-white font-sans text-xs font-bold ml-2">
            — ABOUT
          </span>
        </div>

        {/* Content area */}
        <div className="bevel-in bg-white p-4 sm:p-6 space-y-6">

          {/* ── WHAT IS SIP? ─────────────────────────────── */}
          <section>
            <h1 className="bg-title-bar text-white px-2 py-1 text-xs font-bold font-heading tracking-wide mb-3">
              WHAT IS SIP?
            </h1>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                A <strong>Systematic Investment Plan (SIP)</strong> is a method of investing a fixed
                amount of money at regular intervals — typically monthly — into a mutual fund scheme.
                Instead of investing a large lump sum at once, SIP lets you invest small amounts
                consistently over time, making it accessible for everyone.
              </p>
              <p>
                SIP harnesses the power of <strong>rupee-cost averaging</strong>: when the market is
                down, your fixed amount buys more units; when the market is up, it buys fewer. Over
                time this averages out the cost per unit and reduces the impact of market volatility
                on your portfolio.
              </p>
              <p>
                The real magic of SIP lies in <strong>compounding</strong>. Your returns generate their
                own returns, and over long periods this snowball effect can turn modest monthly
                contributions into substantial wealth. Understanding SIP compound interest is key to long-term wealth creation. The earlier you start, the more time compounding
                has to work in your favour.
              </p>
            </div>
          </section>

          <hr className="hr-groove" />

          {/* ── HOW THIS CALCULATOR WORKS ────────────────── */}
          <section>
            <h2 className="bg-title-bar text-white px-2 py-1 text-xs font-bold font-heading tracking-wide mb-3">
              HOW THIS CALCULATOR WORKS
            </h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                This calculator uses the <strong>effective geometric monthly rate</strong> for
                compounding, which matches how calculators like Groww compute SIP returns. Rather
                than simply dividing the annual rate by 12 (nominal), we convert it to the true
                monthly compounding rate:
              </p>

              {/* Formula block — monthly rate */}
              <div className="bevel-in bg-panel-yellow p-3 font-mono text-xs sm:text-sm tracking-wide overflow-x-auto">
                <div className="text-muted text-[10px] uppercase font-bold font-sans mb-1">
                  Effective Monthly Rate
                </div>
                <code className="text-black font-bold">
                  i = (1 + annualRate / 100)<sup>1/12</sup> - 1
                </code>
              </div>

              <p>
                The maturity value for a standard SIP (annuity-due — contribution at the
                <strong> start</strong> of each month) is calculated as:
              </p>

              {/* Formula block — maturity */}
              <div className="bevel-in bg-panel-yellow p-3 font-mono text-xs sm:text-sm tracking-wide overflow-x-auto">
                <div className="text-muted text-[10px] uppercase font-bold font-sans mb-1">
                  Maturity Formula
                </div>
                <code className="text-black font-bold">
                  M = P x [((1 + i)<sup>n</sup> - 1) / i] x (1 + i)
                </code>
              </div>

              {/* Variable definitions */}
              <div className="bevel-in bg-background p-3">
                <div className="text-[10px] uppercase font-bold text-muted mb-2 font-sans">
                  Variables
                </div>
                <table className="w-full text-xs font-mono">
                  <tbody>
                    <tr className="border-b border-border-dark">
                      <td className="py-1 pr-4 font-bold text-accent">P</td>
                      <td className="py-1">Monthly investment amount</td>
                    </tr>
                    <tr className="border-b border-border-dark">
                      <td className="py-1 pr-4 font-bold text-accent">n</td>
                      <td className="py-1">Total number of months (years x 12)</td>
                    </tr>
                    <tr className="border-b border-border-dark">
                      <td className="py-1 pr-4 font-bold text-accent">i</td>
                      <td className="py-1">Effective monthly rate (see formula above)</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4 font-bold text-accent">M</td>
                      <td className="py-1">Maturity value (total corpus at the end)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <hr className="hr-groove" />

              <div>
                <h3 className="font-heading text-xs tracking-wide mb-2 uppercase">
                  Step-Up SIP
                </h3>
                <p>
                  The <strong>Annual Step-Up</strong> feature lets you increase your monthly
                  contribution by a fixed percentage at the start of each year. For example, with a
                  10% step-up, a starting SIP of Rs.5,000 becomes Rs.5,500 in year 2, Rs.6,050 in year 3,
                  and so on. The calculator runs a year-by-year loop, compounding monthly within each
                  year, then stepping up the contribution for the next — rather than applying a single
                  flat multiplier.
                </p>
              </div>
            </div>
          </section>

          <hr className="hr-groove" />

          {/* ── MARKET GUIDANCE & DISCLAIMER ─────────────── */}
          <section>
            <h2 className="bg-title-bar text-white px-2 py-1 text-xs font-bold font-heading tracking-wide mb-3">
              MARKET GUIDANCE &amp; DISCLAIMER
            </h2>
            <div className="bg-construction bevel-out border border-black p-3">
              <div className="bg-white border border-black p-3 sm:p-4 text-xs leading-relaxed space-y-2">
                <p>
                  <strong>ESTIMATES ONLY.</strong> All calculations are based on a constant assumed
                  rate of return. Actual mutual fund returns fluctuate with market performance and
                  are never guaranteed.
                </p>
                <p>
                  <strong>NOT INVESTMENT ADVICE.</strong> The information provided by this calculator
                  is for educational and illustrative purposes only. It does not constitute financial,
                  investment, or tax advice of any kind.
                </p>
                <p>
                  <strong>CONSULT A PROFESSIONAL.</strong> Before making any investment decisions,
                  consult a licensed financial advisor who can evaluate your individual circumstances,
                  risk tolerance, and financial goals.
                </p>
                <p>
                  <strong>PAST PERFORMANCE IS NOT INDICATIVE OF FUTURE RESULTS.</strong> Projected
                  returns shown by this calculator should not be interpreted as a promise or guarantee
                  of actual returns. Markets are subject to risks, and capital loss is possible.
                </p>
              </div>
            </div>
          </section>

          <hr className="hr-groove" />

          {/* ── Bottom: Back button + hit counter ────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              to="/"
              className="bevel-out bg-background px-4 py-1.5 text-xs font-heading font-bold tracking-wide
                         cursor-pointer retro-focus select-none inline-block text-center
                         hover:bg-[#d0d0d0] active:bevel-in no-underline text-black"
            >
              &laquo; TRY THE SIP CALCULATOR
            </Link>

            {/* Hit-counter strip */}
            <div className="bevel-in bg-black px-4 py-1.5 text-success font-mono text-[10px] tracking-widest select-none">
              LAST UPDATED: 2026 • SIPWISE ENGINE 95
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
