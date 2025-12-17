/**
 * salary-conversion.js (Enhanced & Feedback-Ready)
 * -----------------------------------------------
 * Salary and Hourly Wage Conversion
 *
 * Converts between hourly wage, weekly, monthly, and yearly salary.
 * Supports optional gross-to-net calculation with taxes.
 *
 * Author: PaycheckTools
 * Last Updated: 2025
 */

/**
 * Feedback hook
 * Safe for browser & Node.js
 */
function notifyResultReady() {
  if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
    document.dispatchEvent(new Event('calculator:result-ready'));
  }
}

/**
 * Convert salary from one unit to another
 * @param {Object} options
 * @param {number} options.amount - input amount
 * @param {string} options.from - 'hourly' | 'weekly' | 'monthly' | 'yearly'
 * @param {string} options.to - 'hourly' | 'weekly' | 'monthly' | 'yearly'
 * @param {number} [options.hoursPerWeek=40] - weekly hours
 * @param {Object} [options.taxes] - optional { federal, state } percentages for net calculation
 * @returns {Object} { gross, net, from, to }
 */
function convertSalary({ amount, from, to, hoursPerWeek = 40, taxes }) {
  if (typeof amount !== 'number' || amount < 0) {
    throw new Error('Invalid amount');
  }

  const units = ['hourly', 'weekly', 'monthly', 'yearly'];
  if (!units.includes(from) || !units.includes(to)) {
    throw new Error('Invalid from/to unit');
  }

  // --- Normalize to yearly ---
  let yearly;
  switch (from) {
    case 'hourly': yearly = amount * hoursPerWeek * 52; break;
    case 'weekly': yearly = amount * 52; break;
    case 'monthly': yearly = amount * 12; break;
    case 'yearly': yearly = amount; break;
  }

  // --- Convert yearly to target unit ---
  let gross;
  switch (to) {
    case 'hourly': gross = yearly / (hoursPerWeek * 52); break;
    case 'weekly': gross = yearly / 52; break;
    case 'monthly': gross = yearly / 12; break;
    case 'yearly': gross = yearly; break;
  }

  // --- Optional net calculation ---
  let net = gross;
  if (taxes) {
    const rate = ((taxes.federal || 0) + (taxes.state || 0)) / 100;
    net = gross * (1 - rate);
  }

  const result = {
    from,
    to,
    gross,
    net
  };

  // ✅ Notify feedback system only after successful calculation
  notifyResultReady();

  return result;
}

/**
 * Node.js module export
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { convertSalary };
}
