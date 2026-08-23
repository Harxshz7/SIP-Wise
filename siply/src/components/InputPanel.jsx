// InputPanel — SIP input controls with synced number inputs + range sliders
import { useCallback } from 'react';
import { IndianRupee, Percent, Calendar, TrendingUp } from 'lucide-react';

const FIELDS = [
  {
    key: 'monthlyAmount',
    label: 'Monthly Investment',
    icon: IndianRupee,
    min: 500,
    max: 200000,
    step: 500,
    prefix: '₹',
    suffix: '',
  },
  {
    key: 'annualRate',
    label: 'Expected Return',
    icon: Percent,
    min: 1,
    max: 30,
    step: 0.5,
    prefix: '',
    suffix: '%',
  },
  {
    key: 'years',
    label: 'Time Period',
    icon: Calendar,
    min: 1,
    max: 40,
    step: 1,
    prefix: '',
    suffix: ' yrs',
  },
  {
    key: 'stepUpPercent',
    label: 'Annual Step-up',
    icon: TrendingUp,
    min: 0,
    max: 50,
    step: 1,
    prefix: '',
    suffix: '%',
  },
];

export default function InputPanel({ values, onChange }) {
  const handleNumberChange = useCallback(
    (field, raw, fieldDef) => {
      const parsed = Number(raw);
      if (Number.isNaN(parsed) || parsed < 0) return; // reject invalid
      onChange(field, parsed);
    },
    [onChange],
  );

  const handleBlur = useCallback(
    (field, raw, fieldDef) => {
      const parsed = Number(raw);
      if (Number.isNaN(parsed) || parsed < 0) {
        // Revert to the clamped min
        onChange(field, fieldDef.min);
        return;
      }
      // Clamp to bounds
      const clamped = Math.min(Math.max(parsed, fieldDef.min), fieldDef.max);
      if (clamped !== parsed) {
        onChange(field, clamped);
      }
    },
    [onChange],
  );

  return (
    <div className="space-y-5">
      {FIELDS.map((f) => {
        const Icon = f.icon;
        const val = values[f.key];

        return (
          <div key={f.key} className="group">
            {/* Label row */}
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor={`input-${f.key}`}
                className="flex items-center gap-2 text-sm font-medium text-slate-300"
              >
                <Icon size={16} className="text-indigo-400" />
                {f.label}
              </label>

              {/* Inline number input with suffix */}
              <div className="flex items-center gap-1 rounded-lg bg-slate-800/60 border border-slate-700/50 px-3 py-1.5">
                {f.prefix && (
                  <span className="text-sm text-slate-400">{f.prefix}</span>
                )}
                <input
                  id={`input-${f.key}`}
                  type="number"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={val}
                  onChange={(e) =>
                    handleNumberChange(f.key, e.target.value, f)
                  }
                  onBlur={(e) => handleBlur(f.key, e.target.value, f)}
                  className="w-20 bg-transparent text-right text-sm font-semibold text-white
                             outline-none appearance-none
                             [&::-webkit-inner-spin-button]:appearance-none
                             [&::-webkit-outer-spin-button]:appearance-none
                             [-moz-appearance:textfield]"
                />
                {f.suffix && (
                  <span className="text-sm text-slate-400">{f.suffix}</span>
                )}
              </div>
            </div>

            {/* Range slider */}
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={val}
              onChange={(e) => onChange(f.key, Number(e.target.value))}
              aria-label={f.label}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                         bg-slate-700
                         accent-indigo-500
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-indigo-500
                         [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(99,102,241,0.5)]
                         [&::-webkit-slider-thumb]:transition-transform
                         [&::-webkit-slider-thumb]:duration-150
                         [&::-webkit-slider-thumb]:hover:scale-125
                         [&::-moz-range-thumb]:w-4
                         [&::-moz-range-thumb]:h-4
                         [&::-moz-range-thumb]:rounded-full
                         [&::-moz-range-thumb]:bg-indigo-500
                         [&::-moz-range-thumb]:border-none
                         [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(99,102,241,0.5)]
                         [&::-webkit-slider-runnable-track]:rounded-full
                         [&::-moz-range-track]:rounded-full"
            />

            {/* Min / Max hint */}
            <div className="flex justify-between mt-1 text-[11px] text-slate-500">
              <span>
                {f.prefix}{f.min.toLocaleString('en-IN')}{f.suffix}
              </span>
              <span>
                {f.prefix}{f.max.toLocaleString('en-IN')}{f.suffix}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
