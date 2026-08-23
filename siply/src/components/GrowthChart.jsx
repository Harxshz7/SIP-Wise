// GrowthChart — Recharts AreaChart showing Invested vs Portfolio Value over years
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatCompact } from '../utils/formatCurrency';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/95 backdrop-blur-sm px-4 py-3 shadow-xl">
      <p className="text-xs font-medium text-slate-400 mb-2">Year {label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="font-semibold text-white">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function GrowthChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm p-4 sm:p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-4">
        Growth Projection
      </h3>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 6"
            stroke="rgba(148,163,184,0.08)"
            vertical={false}
          />

          <XAxis
            dataKey="year"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
            tickLine={false}
            tickFormatter={(v) => `Y${v}`}
          />

          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatCompact}
            width={65}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 12, fontSize: 13 }}
            formatter={(value) => (
              <span className="text-slate-300">{value}</span>
            )}
          />

          <Area
            type="monotone"
            dataKey="invested"
            name="Invested"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="url(#gradInvested)"
            dot={false}
            activeDot={{ r: 4, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
          />

          <Area
            type="monotone"
            dataKey="value"
            name="Portfolio Value"
            stroke="#818cf8"
            strokeWidth={2}
            fill="url(#gradValue)"
            dot={false}
            activeDot={{ r: 4, fill: '#818cf8', stroke: '#0f172a', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
