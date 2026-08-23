import { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Marquee from 'react-fast-marquee';
import CalculatorPage from './components/CalculatorPage';
import AboutPage from './components/AboutPage';
import MarketPulsePage from './components/MarketPulsePage';

// ESM Interop helper for react-fast-marquee
const MarqueeComponent = Marquee && (Marquee.default || Marquee);

function App() {
  const location = useLocation();

  // Update document title on route change
  useEffect(() => {
    const titles = {
      '/about': 'Sipwise — About',
      '/market-pulse': 'Sipwise — Market Pulse',
    };
    document.title = titles[location.pathname] || 'Sipwise — SIP Calculator';
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-90s-tile text-black font-sans p-2 sm:p-6 flex flex-col justify-between">
      {/* Main retro window */}
      <div className="w-full bevel-out bg-background p-1 select-none">
        
        {/* Title bar */}
        <div className="title-bar-gradient flex items-center justify-between px-2 py-1 select-none">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-white font-heading text-sm md:text-base tracking-wide text-rainbow no-underline">
              SIPWISE.EXE
            </Link>
            <span className="text-white font-sans text-xs md:text-sm font-bold">
              {location.pathname === '/about'
                ? '— ABOUT'
                : location.pathname === '/market-pulse'
                  ? '— MARKET PULSE'
                  : '— SIP CALCULATOR v1.00'}
            </span>
          </div>
        </div>

        {/* Menu bar */}
        <div className="flex items-center gap-4 px-2 py-1 text-xs border-b border-border-dark">
          <Link
            to="/market-pulse"
            className="cursor-pointer hover:underline no-underline text-black retro-focus"
          >
            Market Pulse
          </Link>
          <span className="cursor-pointer hover:underline">Edit</span>
          <span className="cursor-pointer hover:underline">Run</span>
          <Link
            to="/about"
            className="cursor-pointer hover:underline no-underline text-black retro-focus"
          >
            About
          </Link>
        </div>

        {/* Marquee strip */}
        <div className="border-b border-border-dark bg-white text-xs py-1 select-none">
          <MarqueeComponent speed={40} gradient={false} play={true}>
            <span className="px-4 font-mono font-bold tracking-wider" aria-live="polite">
              WELCOME TO SIPWISE • CALCULATE YOUR SIP RETURNS • COMPOUND INTEREST IS YOUR FRIEND • MAKE YOUR WEALTH GROW FAST! •
            </span>
          </MarqueeComponent>
          {/* sr-only fallback */}
          <span className="sr-only">
            Welcome to Sipwise. Calculate your SIP returns. Compound interest is your friend.
          </span>
        </div>

        {/* Route content area */}
        <Routes>
          <Route path="/" element={<CalculatorPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/market-pulse" element={<MarketPulsePage />} />
        </Routes>
      </div>

      {/* Footer / Disclaimer with construction stripes */}
      <footer className="w-full mt-6">
        <div className="bg-construction text-black text-center py-2 bevel-out font-bold text-xs select-none border border-black">
          <span className="bg-white px-2 py-0.5 border border-black inline-block font-mono tracking-tighter">
            CAUTION: ESTIMATES ONLY. NOT INVESTMENT ADVICE. DO YOUR OWN RESEARCH.
          </span>
        </div>
        <div className="text-center text-[10px] text-muted mt-2 font-mono uppercase">
          POWERED BY SIPWISE ENGINE 95 • SYSTEM PORT OK • LOCAL TIME: {new Date().toLocaleTimeString()}
        </div>
      </footer>
    </div>
  );
}

export default App;
