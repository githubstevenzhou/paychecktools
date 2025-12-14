/**
 * employer-tax.js (Enhanced Version)
 * -----------------------------------
 * Payroll, Self-Employment Tax, Employer Cost, and Deductions Calculator
 *
 * Supports:
 * 1. Payroll Tax Calculation
 * 2. Self-Employment Tax Calculation
 * 3. Employer Total Cost
 * 4. Optional Deductions
 *
 * Author: PaycheckTools
 * Last Updated: 2025
 *
 * Usage Example:
 * const result = calculateEmployerCosts({
 *   grossPay: 1000,
 *   payrollTaxRates: { socialSecurity: 6.2, medicare: 1.45 },
 *   selfEmploymentTaxRate: 15.3,
 *   otherDeductions: 50
 * });
 * console.log(result);
 */

/**
 * Calculate payroll taxes and employer costs
 * @param {Object} options
 * @param {number} options.grossPay - gross employee pay
 * @param {Object} [options.payrollTaxRates={}] - payroll tax percentages (employer side)
 * @param {number} [options.selfEmploymentTaxRate=0] - self-employment tax %
 * @param {number} [options.otherDeductions=0] - additional deductions
 * @returns {Object} result with detailed breakdown
 */
function calculateEmployerCosts({
  grossPay,
  payrollTaxRates = { socialSecurity: 0, medicare: 0 },
  selfEmploymentTaxRate = 0,
  otherDeductions = 0
}) {
  if (typeof grossPay !== 'number' || grossPay < 0) throw new Error('Invalid grossPay');

  // --- Payroll taxes ---
  const payrollTaxAmount = Object.keys(payrollTaxRates).reduce((sum, key) => {
    const rate = payrollTaxRates[key] || 0;
    return sum + grossPay * (rate / 100);
  }, 0);

  // --- Self-employment tax ---
  const seTaxAmount = grossPay * (selfEmploymentTaxRate / 100);

  // --- Total employer cost ---
  const totalEmployerCost = grossPay + payrollTaxAmount + otherDeductions;

  // --- Net pay to employee (after deductions) ---
  const netPay = grossPay - otherDeductions;

  return {
    grossPay,
    netPay,
    payrollTaxAmount,
    seTaxAmount,
    totalEmployerCost,
    breakdown: {
      payrollTaxes: payrollTaxRates,
      otherDeductions
    }
  };
}

/**
 * Optional Node.js module export
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateEmployerCosts };
}

/**
 * --- Example Usage ---
 * Uncomment to test
 */
// const example = calculateEmployerCosts({
//   grossPay: 1000,
//   payrollTaxRates: { socialSecurity: 6.2, medicare: 1.45 },
//   selfEmploymentTaxRate: 15.3,
//   otherDeductions: 50
// });
// console.log(example);
