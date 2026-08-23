// GrowthChart — Win95 graph-paper style Recharts chart with flat colors, solid grid, and beveled tooltip
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
    <div className="bevel-out bg-white p-2 font-mono text-[11px] text-black">
      <div className="border-b border-border-dark pb-1 mb-1 font-bold">
        YEAR {label}
      </div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block w-2.5 h-2.5 border border-black"
            style={{ backgroundColor: entry.stroke }}
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

export default function GrowthChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bevel-out bg-background p-1 select-none">
      {/* Title strip */}
      <div className="bg-title-bar text-white px-2 py-0.5 text-[10px] font-heading tracking-wider uppercase">
        PROJECTION.GRA
      </div>

      {/* Chart container sunken panel */}
      <div className="bg-white bevel-in m-1 p-2 sm:p-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#808080"
              strokeDasharray="none" // Solid grid lines for graph-paper look
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

            <Tooltip content={<CustomTooltip />} />

            <Legend
              iconType="square"
              iconSize={8}
              wrapperStyle={{ paddingTop: 12, fontSize: 11, fontFamily: 'Courier New, monospace' }}
              formatter={(value) => (
                <span className="text-black font-bold font-mono">{value.toUpperCase()}</span>
              )}
            />

            {/* Flat fill grey Area for Invested */}
            <Area
              type="linear"
              dataKey="invested"
              name="Invested"
              stroke="#808080"
              strokeWidth={3}
              fill="#808080"
              fillOpacity={0.15}
              activeDot={{ r: 4, stroke: '#000000', strokeWidth: 2, fill: '#808080' }}
            />

            {/* Flat fill successDark Area for Portfolio Value */}
            <Area
              type="linear"
              dataKey="value"
              name="Portfolio Value"
              stroke="#00AA00"
              strokeWidth={3}
              fill="#00AA00"
              fillOpacity={0.15}
              activeDot={{ r: 4, stroke: '#000000', strokeWidth: 2, fill: '#00AA00' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
