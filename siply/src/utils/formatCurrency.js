// formatCurrency — Utility to format numbers as Indian/international currency strings

/**
 * Format a number as Indian Rupees with no decimals.
 * Uses toLocaleString for correct 2-then-3 digit grouping (e.g. ₹12,50,000).
 *
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
}

/**
 * Compact label for chart axes — converts to L (lakh) / Cr (crore) suffix.
 * e.g. 1250000 → "12.5L", 15000000 → "1.5Cr", 50000 → "50K"
 *
 * @param {number} amount
 * @returns {string}
 */
export function formatCompact(amount) {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_00_00_000) {
    // Crores (1 crore = 10,000,000)
    const val = (abs / 1_00_00_000).toFixed(1);
    return `${sign}₹${val.replace(/\.0$/, '')}Cr`;
  }

  if (abs >= 1_00_000) {
    // Lakhs (1 lakh = 100,000)
    const val = (abs / 1_00_000).toFixed(1);
    return `${sign}₹${val.replace(/\.0$/, '')}L`;
  }

  if (abs >= 1_000) {
    // Thousands
    const val = (abs / 1_000).toFixed(1);
    return `${sign}₹${val.replace(/\.0$/, '')}K`;
  }

  return `${sign}₹${abs}`;
}
