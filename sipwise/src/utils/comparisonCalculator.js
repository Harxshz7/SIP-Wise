// comparisonCalculator — FD, RD, and SIP vs FD vs RD comparison logic
// Reuses calculateSIP from sipCalculator.js directly to avoid any drift between
// the main calculator and the comparison page.

import { calculateSIP, getYearlyBreakdown } from './sipCalculator';

/**
 * Calculate Fixed Deposit maturity using standard compound interest.
 * Formula: A = P × (1 + r/n)^(n×t)
 * where r = annualRate/100, n = compoundingFrequency (quarterly by default,
 * matching Indian bank convention), t = years.
 *
 * FD is a lumpsum product — the `principal` is the total amount deposited on day one.
 *
 * @param {number} principal - Lumpsum amount deposited
 * @param {number} annualRate - Annual interest rate, e.g. 7 for 7%
 * @param {number} years - Deposit tenure in years
 * @param {number} [compoundingFrequency=4] - Compounding times per year (4 = quarterly)
 * @returns {{ invested: number, returns: number, maturity: number }}
 */
export function calculateFD(principal, annualRate, years, compoundingFrequency = 4) {
  const r = annualRate / 100;
  const n = compoundingFrequency;
  const t = years;

  const maturity = principal * Math.pow(1 + r / n, n * t);
  const returns = maturity - principal;

  return {
    invested: Math.round(principal),
    returns: Math.round(returns),
    maturity: Math.round(maturity),
  };
}

/**
 * Calculate Recurring Deposit maturity.
 *
 * SIMPLIFICATION NOTE: Full RD quarterly-compounding precision would require
 * compounding each monthly deposit for its remaining tenure using the quarterly
 * rate (since Indian banks compound RD interest quarterly). For v1 of this app
 * we use the same effective monthly rate approach as calculateSIP:
 *   i = (1 + annualRate/100)^(1/12) - 1
 * then apply the same annuity-due formula. This slightly overstates RD returns
 * compared to a true quarterly-compounding RD, but keeps the comparison fair
 * since both SIP and RD use identical math — the only difference is the rate.
 * Full quarterly-compounding RD precision is a stretch goal for a future version.
 *
 * @param {number} monthlyAmount - Monthly deposit amount
 * @param {number} annualRate - Annual interest rate, e.g. 6.5 for 6.5%
 * @param {number} years - Deposit tenure in years
 * @returns {{ invested: number, returns: number, maturity: number }}
 */
export function calculateRD(monthlyAmount, annualRate, years) {
  // Reuse the same effective monthly rate approach as sipCalculator.js
  const i = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  const months = years * 12;

  // Annuity-due (contribution at start of each month), same formula as calculateSIP
  const maturity =
    monthlyAmount * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  const invested = monthlyAmount * months;
  const returns = maturity - invested;

  return {
    invested: Math.round(invested),
    returns: Math.round(returns),
    maturity: Math.round(maturity),
  };
}

/**
 * Build a year-by-year comparison breakdown for charting.
 *
 * Returns an array of objects aligned by year with values for all three instruments
 * plus the shared invested baseline.
 *
 * MODELING CHOICE FOR FD: To make a fair apples-to-apples comparison against the
 * same total committed capital, the FD "principal" is treated as
 * monthlyAmount × 12 × years deposited as a lumpsum on day one. This means the
 * FD investor is assumed to have the entire sum available upfront, which is a
 * significant advantage in practice. This is one valid comparison approach but not
 * the only one — an alternative would be to use a monthly FD ladder. We use the
 * lumpsum approach because it reflects how FDs are actually used (single deposit)
 * and clearly shows the compounding difference.
 *
 * @param {number} monthlyAmount - Monthly SIP/RD contribution
 * @param {number} sipRate - Expected annual SIP return rate (%)
 * @param {number} fdRate - Annual FD interest rate (%)
 * @param {number} rdRate - Annual RD interest rate (%)
 * @param {number} years - Investment tenure in years
 * @returns {Array<{ year: number, sipValue: number, fdValue: number, rdValue: number, invested: number }>}
 */
export function getComparisonBreakdown(monthlyAmount, sipRate, fdRate, rdRate, years) {
  // Reuse getYearlyBreakdown from sipCalculator.js for SIP data (no stepup)
  const sipBreakdown = getYearlyBreakdown(monthlyAmount, sipRate, years, 0);

  // FD: lumpsum = total amount the investor would commit over the full tenure
  const fdPrincipal = monthlyAmount * 12 * years;

  // RD: effective monthly rate (same approach as SIP)
  const rdMonthlyRate = Math.pow(1 + rdRate / 100, 1 / 12) - 1;

  const breakdown = [];

  for (let y = 1; y <= years; y++) {
    // SIP value — reuse from sipCalculator's breakdown (exact same numbers as main calc)
    const sipRow = sipBreakdown[y - 1];

    // FD value at year y — full lumpsum compounding from day one
    const fdValue = fdPrincipal * Math.pow(1 + fdRate / 100 / 4, 4 * y);

    // RD value at year y — annuity-due formula with y*12 months
    const rdMonths = y * 12;
    const rdValue =
      monthlyAmount * ((Math.pow(1 + rdMonthlyRate, rdMonths) - 1) / rdMonthlyRate) * (1 + rdMonthlyRate);

    // Invested at year y — for SIP/RD this is monthlyAmount * y * 12
    // For FD the full lumpsum is invested from day one, but we show SIP/RD invested
    // as the "invested" baseline since it's the periodic commitment amount
    const invested = monthlyAmount * y * 12;

    breakdown.push({
      year: y,
      sipValue: Math.round(sipRow.value),
      fdValue: Math.round(fdValue),
      rdValue: Math.round(rdValue),
      invested: Math.round(invested),
    });
  }

  return breakdown;
}
