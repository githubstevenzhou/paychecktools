// ------------------------------
// calculator-core.js (Enhanced & Feedback-Ready)
// ------------------------------

/**
 * Feedback hook
 * Safe for browser & Node.js
 */
function notifyResultReady() {
    if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
        document.dispatchEvent(new Event('calculator:result-ready'));
    }
}

// ------------------------------
// Paycheck Calculator
// ------------------------------
function calculatePaycheck({ wage, hours, otHours = 0, frequency = 'weekly', taxes = { federal: 0, state: 0 } }) {
    if (typeof wage !== 'number' || wage < 0) throw new Error('Invalid wage');
    if (typeof hours !== 'number' || hours < 0) throw new Error('Invalid hours');
    if (typeof otHours !== 'number' || otHours < 0) throw new Error('Invalid overtime hours');
    if (!['weekly','biweekly','monthly','semimonthly'].includes(frequency)) {
        throw new Error('Invalid frequency');
    }

    let multiplier;
    switch (frequency) {
        case 'weekly': multiplier = 1; break;
        case 'biweekly': multiplier = 2; break;
        case 'monthly': multiplier = 4.3333; break;
        case 'semimonthly': multiplier = 2.1667; break;
    }

    const basePay = wage * hours * multiplier;
    const otPay = wage * 1.5 * otHours * multiplier;
    const grossPay = basePay + otPay;

    const federalRate = taxes.federal || 0;
    const stateRate = taxes.state || 0;
    const taxAmount = grossPay * (federalRate + stateRate) / 100;
    const netPay = grossPay - taxAmount;

    const result = {
        grossPay,
        netPay,
        breakdown: {
            basePay,
            otPay,
            taxAmount
        }
    };

    notifyResultReady();
    return result;
}

// ------------------------------
// Commission Calculator
// ------------------------------
function calculateCommission(sales, rate) {
    if (sales < 0 || rate < 0) throw new Error('Invalid input');
    const result = sales * rate / 100;
    notifyResultReady();
    return result;
}

// ------------------------------
// Part-Time Salary Calculator
// ------------------------------
function calculatePartTimeSalary(hourly, hours) {
    if (hourly < 0 || hours < 0) throw new Error('Invalid input');
    const result = hourly * hours;
    notifyResultReady();
    return result;
}

// ------------------------------
// Overtime Pay Calculator
// ------------------------------
function calculateOvertimePay(hourly, regularHours, overtimeHours, multiplier) {
    if (hourly < 0 || regularHours < 0 || overtimeHours < 0 || multiplier <= 0) {
        throw new Error('Invalid input');
    }
    const result = hourly * regularHours + hourly * overtimeHours * multiplier;
    notifyResultReady();
    return result;
}

// ------------------------------
// Employer / Tax Calculators
// ------------------------------
function calculateSelfEmploymentTax(netProfit, taxRate) {
    if (netProfit < 0 || taxRate < 0) throw new Error('Invalid input');
    const result = netProfit * taxRate / 100;
    notifyResultReady();
    return result;
}

function calculateEmployerCost(salary, taxRate) {
    if (salary < 0 || taxRate < 0) throw new Error('Invalid input');
    const result = salary * (1 + taxRate / 100);
    notifyResultReady();
    return result;
}

function calculatePayrollDeduction(grossPay, deductionRate) {
    if (grossPay < 0 || deductionRate < 0) throw new Error('Invalid input');
    const result = grossPay * deductionRate / 100;
    notifyResultReady();
    return result;
}

// ------------------------------
// Node.js export compatibility
// ------------------------------
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculatePaycheck,
        calculateCommission,
        calculatePartTimeSalary,
        calculateOvertimePay,
        calculateSelfEmploymentTax,
        calculateEmployerCost,
        calculatePayrollDeduction
    };
}
