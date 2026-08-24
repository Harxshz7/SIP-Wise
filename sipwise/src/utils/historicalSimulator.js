// historicalSimulator — Simulate SIP returns using real year-by-year index performance
// This is a SEPARATE calculation from calculateSIP — flat-rate and historical are
// two distinct computations shown side-by-side. calculateSIP is NOT modified or duplicated.

/**
 * Simulate what a SIP would've actually returned using real historical
 * year-by-year index returns (e.g. from Nifty 50 or Sensex data).
 *
 * For each year in the simulation, the actual annual return for that year
 * is converted to an effective monthly rate using the same geometric
 * conversion as sipCalculator.js:
 *   i_year = (1 + yearReturnPercent / 100)^(1/12) - 1
 *
 * Within each year, 12 monthly contributions are added at the start of each
 * month (annuity-due convention, matching calculateSIP) and compounded at
 * that year's effective monthly rate.
 *
 * @param {number} monthlyAmount - Monthly SIP contribution in ₹
 * @param {number} years - Desired simulation tenure in years
 * @param {Array<{year: number, returnPercent: number}>} yearlyReturns -
 *   Array of real year-by-year index returns from the market-data API,
 *   expected in descending year order (most recent first).
 *   Only the most recent `years` entries are used.
 * @param {string} indexName - Name of the index (for labeling, e.g. "Nifty 50")
 * @returns {{
 *   invested: number,
 *   maturity: number,
 *   returns: number,
 *   yearsSimulated: number,
 *   indexName: string,
 *   dataLimited: boolean,
 *   yearlyBreakdown: Array<{year: number, invested: number, value: number, indexReturnThatYear: number}>
 * }}
 */
export function simulateHistoricalSIP(monthlyAmount, years, yearlyReturns, indexName) {
  // yearlyReturns comes in descending order (most recent first) — reverse to
  // chronological order, then take the most recent `years` entries.
  const chronological = [...yearlyReturns].reverse();
  const available = chronological.length;
  const yearsToSimulate = Math.min(years, available);
  const dataLimited = yearsToSimulate < years;

  // Use the LAST `yearsToSimulate` entries (most recent years)
  const selectedYears = chronological.slice(available - yearsToSimulate);

  let maturity = 0;
  let totalInvested = 0;
  const yearlyBreakdown = [];

  for (let i = 0; i < yearsToSimulate; i++) {
    const yearData = selectedYears[i];
    const yearReturn = yearData.returnPercent;

    // Convert that year's annual return to effective monthly rate
    // Same geometric conversion as sipCalculator.js: i = (1 + r/100)^(1/12) - 1
    const monthlyRate = Math.pow(1 + yearReturn / 100, 1 / 12) - 1;

    // Compound 12 monthly contributions at this year's rate
    for (let m = 0; m < 12; m++) {
      // Annuity-due: contribution at start of month, then grow
      maturity = (maturity + monthlyAmount) * (1 + monthlyRate);
    }

    totalInvested += monthlyAmount * 12;

    yearlyBreakdown.push({
      year: yearData.year,
      invested: Math.round(totalInvested),
      value: Math.round(maturity),
      indexReturnThatYear: yearReturn,
    });
  }

  return {
    invested: Math.round(totalInvested),
    maturity: Math.round(maturity),
    returns: Math.round(maturity - totalInvested),
    yearsSimulated: yearsToSimulate,
    indexName,
    dataLimited,
    yearlyBreakdown,
  };
}
