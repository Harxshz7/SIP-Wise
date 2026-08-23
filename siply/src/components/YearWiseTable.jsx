// YearWiseTable — Tabular breakdown of yearly SIP growth
import { formatCurrency } from '../utils/formatCurrency';

export default function YearWiseTable({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-700/30 bg-slate-800/30 backdrop-blur-sm overflow-hidden">
      <h3 className="text-sm font-medium text-slate-400 px-4 sm:px-6 pt-5 pb-3">
        Year-wise Breakdown
      </h3>

      {/* Horizontal scroll wrapper for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-slate-700/40">
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Year
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Invested
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Value
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Gain
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/20">
            {data.map((row) => {
              const gain = row.value - row.invested;
              return (
                <tr
                  key={row.year}
                  className="transition-colors duration-150 hover:bg-slate-700/15"
                >
                  <td className="px-4 sm:px-6 py-3 text-slate-300 font-medium">
                    {row.year}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right text-sky-400 tabular-nums">
                    {formatCurrency(row.invested)}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-right text-indigo-400 tabular-nums">
                    {formatCurrency(row.value)}
                  </td>
                  <td
                    className={`px-4 sm:px-6 py-3 text-right tabular-nums ${
                      gain >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatCurrency(gain)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
