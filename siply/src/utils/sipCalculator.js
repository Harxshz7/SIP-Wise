// sipCalculator — Core SIP calculation logic (future value, year-wise breakdown)
// Uses effective (geometric) monthly rate: i = (1 + annualRate/100)^(1/12) - 1
// This matches Groww and most Indian SIP calculators.

/**
 * Convert an annual return rate to the effective monthly compounding rate.
 * This is the geometric conversion, NOT the simple nominal division (rate/12).
 *
 * @param {number} annualRate - Annual return rate, e.g. 12 for 12%
 * @returns {number} Effective monthly rate as a decimal
 */
function computeMonthlyRate(annualRate) {
  return Math.pow(1 + annualRate / 100, 1 / 12) - 1;
}

/**
 * Internal helper that runs the year-by-year step-up SIP loop.
 * Both calculateStepUpSIP and getYearlyBreakdown delegate to this so
 * the rate conversion and step-up compounding logic each live in exactly one place.
 *
 * Contribution is added at the start of each month (annuity-due convention).
 *
 * @param {number} monthlyAmount - Starting monthly contribution
 * @param {number} annualRate    - Annual return rate (%)
 * @param {number} years         - Investment duration in years
 * @param {number} stepUpPercent - Annual increase in contribution (%)
 * @returns {{ invested: number, maturity: number, breakdown: Array<{ year: number, invested: number, value: number }> }}
 */
function _stepUpLoop(monthlyAmount, annualRate, years, stepUpPercent) {
  const i = computeMonthlyRate(annualRate);

  let maturity = 0;
  let totalInvested = 0;
  let currentMonthly = monthlyAmount;
  const breakdown = [];

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      // Contribution at start of month: add contribution first, then grow
      maturity = (maturity + currentMonthly) * (1 + i);
    }

    totalInvested += currentMonthly * 12;
    breakdown.push({
      year: y,
      invested: Math.round(totalInvested),
      value: Math.round(maturity),
    });

    // Step up for the next year
    currentMonthly = currentMonthly * (1 + stepUpPercent / 100);
  }

  return { invested: totalInvested, maturity, breakdown };
}

/**
 * Standard SIP future value with monthly compounding.
 * Contribution at the start of each month (annuity-due).
 * Uses the effective geometric monthly rate.
 *
 * @param {number} monthlyAmount - Monthly SIP contribution in ₹
 * @param {number} annualRate    - Expected annual return rate (e.g. 12 for 12%)
 * @param {number} years         - Investment duration in years
 * @returns {{ invested: number, returns: number, maturity: number }}
 */
export function calculateSIP(monthlyAmount, annualRate, years) {
  const i = computeMonthlyRate(annualRate);
  const months = years * 12;

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
 * Step-up SIP: the monthly contribution increases by stepUpPercent each year.
 * Uses the shared _stepUpLoop with effective geometric monthly rate.
 *
 * @param {number} monthlyAmount - Starting monthly contribution in ₹
 * @param {number} annualRate    - Expected annual return rate (%)
 * @param {number} years         - Investment duration in years
 * @param {number} stepUpPercent - Annual step-up percentage (e.g. 10 for 10%)
 * @returns {{ invested: number, returns: number, maturity: number }}
 */
export function calculateStepUpSIP(monthlyAmount, annualRate, years, stepUpPercent) {
  const { invested, maturity } = _stepUpLoop(
    monthlyAmount,
    annualRate,
    years,
    stepUpPercent,
  );

  return {
    invested: Math.round(invested),
    returns: Math.round(maturity - invested),
    maturity: Math.round(maturity),
  };
}

/**
 * Year-by-year breakdown for charting.
 * Uses the effective geometric monthly rate.
 *
 * @param {number} monthlyAmount - Monthly SIP contribution in ₹
 * @param {number} annualRate    - Expected annual return rate (%)
 * @param {number} years         - Investment duration in years
 * @param {number} [stepUpPercent=0] - Annual step-up percentage
 * @returns {Array<{ year: number, invested: number, value: number }>}
 */
export function getYearlyBreakdown(monthlyAmount, annualRate, years, stepUpPercent = 0) {
  if (stepUpPercent === 0) {
    // Flat SIP — use the closed-form formula per year for consistency
    const i = computeMonthlyRate(annualRate);
    const breakdown = [];

    for (let y = 1; y <= years; y++) {
      const months = y * 12;
      const value =
        monthlyAmount * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
      const invested = monthlyAmount * months;

      breakdown.push({
        year: y,
        invested: Math.round(invested),
        value: Math.round(value),
      });
    }

    return breakdown;
  }

  // Step-up SIP — reuse the shared loop
  const { breakdown } = _stepUpLoop(monthlyAmount, annualRate, years, stepUpPercent);
  return breakdown;
}
