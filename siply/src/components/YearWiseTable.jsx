// YearWiseTable — Win95 table style for yearly breakdown with navy header and alternating rows
import { formatCurrency } from '../utils/formatCurrency';

export default function YearWiseTable({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bevel-out bg-background p-1 select-none">
      {/* Title strip */}
      <div className="bg-title-bar text-white px-2 py-0.5 text-[10px] font-heading tracking-wider uppercase">
        BREAKDOWN.TXT
      </div>

      {/* Table container */}
      <div className="bg-white bevel-in m-1 overflow-x-auto">
        <table className="w-full min-w-[480px] text-xs border-collapse">
          <thead>
            <tr className="bg-title-bar text-white">
              <th className="px-4 py-2 text-left font-heading uppercase tracking-wider border-r border-b border-border-dark">
                Year
              </th>
              <th className="px-4 py-2 text-right font-heading uppercase tracking-wider border-r border-b border-border-dark">
                Invested
              </th>
              <th className="px-4 py-2 text-right font-heading uppercase tracking-wider border-r border-b border-border-dark">
                Value
              </th>
              <th className="px-4 py-2 text-right font-heading uppercase tracking-wider border-b border-border-dark">
                Gain
              </th>
            </tr>
          </thead>
          <tbody className="text-black">
            {data.map((row, index) => {
              const gain = row.value - row.invested;
              const isEven = index % 2 === 0;
              return (
                <tr
                  key={row.year}
                  className={isEven ? 'bg-white' : 'bg-[#E8E8E8]'}
                >
                  <td className="px-4 py-1.5 font-bold border-r border-b border-border-dark">
                    {row.year}
                  </td>
                  <td className="px-4 py-1.5 text-right font-mono border-r border-b border-border-dark">
                    {formatCurrency(row.invested)}
                  </td>
                  <td className="px-4 py-1.5 text-right font-mono border-r border-b border-border-dark">
                    {formatCurrency(row.value)}
                  </td>
                  <td className={`px-4 py-1.5 text-right font-mono border-b border-border-dark font-bold ${
                    gain >= 0 ? 'text-success-dark' : 'text-secondary'
                  }`}>
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
