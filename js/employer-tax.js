/**
 * employer-tax.js (Enhanced & Feedback-Ready)
 * ------------------------------------------
 * Payroll, Self-Employment Tax, Employer Cost, and Deductions Calculator
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
  if (typeof grossPay !== 'number' || grossPay < 0) {
    throw new Error('Invalid grossPay');
  }

  // --- Payroll taxes ---
  const payrollTaxAmount = Object.keys(payrollTaxRates).reduce((sum, key) => {
    const rate = payrollTaxRates[key] || 0;
    return sum + grossPay * (rate / 100);
  }, 0);

  // --- Self-employment tax ---
  const seTaxAmount = grossPay * (selfEmploymentTaxRate / 100);

  // --- Total employer cost ---
  const totalEmployerCost = grossPay + payrollTaxAmount + otherDeductions;

  // --- Net pay to employee ---
  const netPay = grossPay - otherDeductions;

  const result = {
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

  // ✅ Notify feedback system only after successful calculation
  notifyResultReady();

  return result;
}

/**
 * Node.js module export
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateEmployerCosts };
}
