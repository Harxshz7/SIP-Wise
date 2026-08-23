// ResultCards — Headline result display with invested / returns / maturity
import { Wallet, TrendingUp, Trophy } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const CARDS = [
  {
    key: 'invested',
    label: 'Total Invested',
    icon: Wallet,
    accent: false,
    color: 'text-sky-400',
    border: 'border-sky-500/20',
    bg: 'bg-sky-500/5',
    iconBg: 'bg-sky-500/10',
  },
  {
    key: 'returns',
    label: 'Est. Returns',
    icon: TrendingUp,
    accent: false,
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    iconBg: 'bg-emerald-500/10',
  },
  {
    key: 'maturity',
    label: 'Total Value',
    icon: Trophy,
    accent: true,
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    iconBg: 'bg-amber-500/10',
  },
];

export default function ResultCards({ invested, returns, maturity }) {
  const vals = { invested, returns, maturity };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {CARDS.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.key}
            className={`
              relative overflow-hidden rounded-2xl border p-5
              ${c.border} ${c.bg}
              backdrop-blur-sm
              transition-all duration-300
              hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/5
              ${c.accent ? 'sm:ring-1 sm:ring-amber-500/20' : ''}
            `}
          >
            {/* Subtle gradient glow for the accent card */}
            {c.accent && (
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
            )}

            <div className="relative flex items-center gap-3 mb-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${c.iconBg}`}>
                <Icon size={16} className={c.color} />
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {c.label}
              </span>
            </div>

            <p
              className={`
                relative font-bold tracking-tight
                ${c.color}
                ${c.accent ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}
              `}
            >
              {formatCurrency(vals[c.key])}
            </p>
          </div>
        );
      })}
    </div>
  );
}
