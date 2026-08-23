// ResultCards — Win95-style headline result cards with styled title bars and mono values
import { formatCurrency } from '../utils/formatCurrency';

const CARDS = [
  {
    key: 'invested',
    label: 'TOTAL INVESTED',
    color: 'text-black',
    titleBg: 'bg-accent', // Accent blue #0000FF
    border: 'bevel-out',
    glow: false,
  },
  {
    key: 'returns',
    label: 'EST. RETURNS',
    color: 'text-success-dark', // #00AA00
    titleBg: 'bg-success-dark', // #00AA00
    border: 'bevel-out',
    glow: false,
  },
  {
    key: 'maturity',
    label: 'TOTAL VALUE',
    color: 'text-blue-900',
    titleBg: 'title-bar-gradient', // Navy-gradient
    border: 'bevel-out animate-pulse-glow',
    glow: true,
  },
];

export default function ResultCards({ invested, returns, maturity }) {
  const vals = { invested, returns, maturity };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {CARDS.map((c) => {
        return (
          <div
            key={c.key}
            className={`bg-background p-1 select-none flex flex-col ${c.border}`}
          >
            {/* Card title bar strip */}
            <div className={`${c.titleBg} px-2 py-0.5 text-[10px] font-heading text-white tracking-wider flex items-center justify-between`}>
              <span>{c.label}</span>
              {c.glow && (
                <span className="w-1.5 h-1.5 bg-yellow-400 border border-black inline-block animate-ping rounded-full" />
              )}
            </div>

            {/* Content area */}
            <div className="bg-white bevel-in m-1 p-3 flex-1 flex items-center justify-center min-h-[50px]">
              <p
                className={`font-mono font-bold tracking-tighter text-center ${c.color} ${
                  c.glow ? 'text-lg sm:text-2xl' : 'text-base sm:text-xl'
                }`}
              >
                {formatCurrency(vals[c.key])}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
