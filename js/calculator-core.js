(function (global) {
  'use strict';

  /**
   * calculatePaycheck(params)
   * params: {
   *   frequency: 'weekly' | 'biweekly' | 'monthly' | 'semimonthly',
   *   wage: number,
   *   hours: number,
   *   otHours?: number,
   *   otRate?: number,
   *   taxes?: {
   *     federal?: number,
   *     state?: number,
   *     fica?: number,
   *     medicare?: number
   *   },
   *   deductions?: number
   * }
   * returns: {
   *   grossPay: number,
   *   netPay: number,
   *   annualGross: number,
   *   breakdown: {
   *     regularPay: number,
   *     overtimePay: number,
   *     taxAmount: number,
   *     taxRate: number,
   *     deductions: number
   *   }
   * }
   */
  function calculatePaycheck(params) {
    if (!params || typeof params !== 'object') throw new Error('params must be an object');

    const { frequency, wage, hours, otHours = 0, otRate = 1.5, taxes = {}, deductions = 0 } = params;

    if (!['weekly', 'biweekly', 'monthly', 'semimonthly'].includes(frequency)) {
      throw new Error('frequency must be weekly, biweekly, monthly, or semimonthly');
    }

    if (wage < 0 || hours < 0 || otHours < 0) throw new Error('wage, hours, and otHours must be non-negative');

    const regularPay = wage * hours;
    const overtimePay = wage * otHours * otRate;
    const grossPay = regularPay + overtimePay;

    const federal = taxes.federal || 0;
    const state = taxes.state || 0;
    const fica = taxes.fica || 0;
    const medicare = taxes.medicare || 0;

    const totalTaxRate = (federal + state + fica + medicare) / 100;
    const taxAmount = grossPay * totalTaxRate;

    const netPay = grossPay - taxAmount - deductions;

    const periodsMap = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };
    const annualGross = grossPay * periodsMap[frequency];

    return {
      grossPay,
      netPay,
      annualGross,
      breakdown: {
        regularPay,
        overtimePay,
        taxAmount,
        taxRate: totalTaxRate,
        deductions
      }
    };
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = calculatePaycheck;
  } else {
    global.calculatePaycheck = calculatePaycheck;
  }

})(typeof window !== 'undefined' ? window : this);
