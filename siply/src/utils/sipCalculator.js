// sipCalculator — Core SIP calculation logic (future value, year-wise breakdown)

/**
 * Standard SIP future value with monthly compounding.
 * Contribution at the start of each month (annuity-due).
 *
 * @param {number} monthlyAmount - Monthly SIP contribution in ₹
 * @param {number} annualRate    - Expected annual return rate (e.g. 12 for 12%)
 * @param {number} years         - Investment duration in years
 * @returns {{ invested: number, returns: number, maturity: number }}
 */
export function calculateSIP(monthlyAmount, annualRate, years) {
  const r = annualRate / 12 / 100;
  const months = years * 12;

  const maturity =
    monthlyAmount * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  const invested = monthlyAmount * months;
  const returns = maturity - invested;

  return {
    invested: Math.round(invested),
    returns: Math.round(returns),
    maturity: Math.round(maturity),
  };
}

/**
 * Internal helper that runs the year-by-year step-up SIP loop.
 * Both calculateStepUpSIP and getYearlyBreakdown delegate to this so
 * the compounding logic lives in exactly one place.
 *
 * @param {number} monthlyAmount - Starting monthly contribution
 * @param {number} annualRate    - Annual return rate (%)
 * @param {number} years         - Investment duration in years
 * @param {number} stepUpPercent - Annual increase in contribution (%)
 * @returns {{ invested: number, maturity: number, breakdown: Array<{ year: number, invested: number, value: number }> }}
 */
function _stepUpLoop(monthlyAmount, annualRate, years, stepUpPercent) {
  const r = annualRate / 12 / 100;

  let maturity = 0;
  let totalInvested = 0;
  let currentMonthly = monthlyAmount;
  const breakdown = [];

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      // Contribution at start of month: add contribution first, then grow
      maturity = (maturity + currentMonthly) * (1 + r);
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
 * Step-up SIP: the monthly contribution increases by stepUpPercent each year.
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
    const r = annualRate / 12 / 100;
    const breakdown = [];

    for (let y = 1; y <= years; y++) {
      const months = y * 12;
      const value =
        monthlyAmount * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
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
