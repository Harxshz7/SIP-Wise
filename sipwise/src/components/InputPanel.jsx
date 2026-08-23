// InputPanel — SIP input controls styled in 90s Win95/98 aesthetic
import { useCallback } from 'react';

const FIELDS = [
  {
    key: 'monthlyAmount',
    label: 'MONTHLY INVESTMENT',
    min: 500,
    max: 200000,
    step: 500,
    prefix: '₹',
    suffix: '',
  },
  {
    key: 'annualRate',
    label: 'EXPECTED RETURN',
    min: 1,
    max: 30,
    step: 0.5,
    prefix: '',
    suffix: '%',
  },
  {
    key: 'years',
    label: 'TIME PERIOD',
    min: 1,
    max: 40,
    step: 1,
    prefix: '',
    suffix: ' YRS',
  },
  {
    key: 'stepUpPercent',
    label: 'ANNUAL STEP-UP',
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
    <div className="space-y-4">
      {FIELDS.map((f) => {
        const val = values[f.key];

        return (
          <div key={f.key} className="bevel-out bg-background p-2.5 transition-none">
            {/* Label row */}
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor={`input-${f.key}`}
                className="text-[11px] font-heading tracking-wider text-black select-none"
              >
                {f.label}
              </label>

              {/* Sunken number input */}
              <div className="flex items-center bg-white bevel-in px-1 py-0.5 w-24">
                {f.prefix && (
                  <span className="text-xs text-muted font-mono select-none mr-1">{f.prefix}</span>
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
                  className="w-full bg-transparent text-right text-xs font-mono font-bold text-black
                             outline-none appearance-none border-none p-0 retro-focus"
                />
                {f.suffix && (
                  <span className="text-xs text-muted font-mono select-none ml-1">{f.suffix}</span>
                )}
              </div>
            </div>

            {/* Retro range slider */}
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={val}
              onChange={(e) => onChange(f.key, Number(e.target.value))}
              aria-label={f.label}
              className="retro-slider w-full mt-2 transition-none"
            />

            {/* Min / Max hint */}
            <div className="flex justify-between mt-1 text-[9px] font-mono text-muted select-none">
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
