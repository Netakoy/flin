import {
  calculateCurrentBalance,
  calculateProjectedBalance,
  calculateDailyLimit,
  buildBudgetSummary,
} from '@/lib/budget';

describe('calculateCurrentBalance', () => {
  it('returns startingBalance when no transactions', () => {
    expect(calculateCurrentBalance(100000, 0, 0)).toBe(100000);
  });

  it('adds income and subtracts expenses', () => {
    expect(calculateCurrentBalance(100000, 5000, 4540)).toBe(100460);
  });

  it('can go negative', () => {
    expect(calculateCurrentBalance(1000, 0, 5000)).toBe(-4000);
  });
});

describe('calculateProjectedBalance', () => {
  it('subtracts future recurring and planned', () => {
    expect(calculateProjectedBalance(95460, 60900, 65000)).toBe(-30440);
  });

  it('returns current balance if no future expenses', () => {
    expect(calculateProjectedBalance(50000, 0, 0)).toBe(50000);
  });
});

describe('calculateDailyLimit', () => {
  it('divides projected balance by days remaining', () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);
    const limit = calculateDailyLimit(10000, endDate);
    expect(limit).toBeCloseTo(1000, 0);
  });

  it('returns at least 0 days (1 day minimum) to avoid division by zero', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const limit = calculateDailyLimit(1000, yesterday);
    expect(isFinite(limit)).toBe(true);
  });
});

describe('buildBudgetSummary', () => {
  it('marks isAtRisk true when projected balance is negative', () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);
    const summary = buildBudgetSummary({
      startingBalance: 10000,
      totalIncome: 0,
      totalExpenses: 5000,
      futureRecurringTotal: 8000,
      plannedExpensesTotal: 0,
      periodEndDate: endDate,
    });
    expect(summary.isAtRisk).toBe(true);
    expect(summary.projectedBalance).toBe(-3000);
    expect(summary.riskAmount).toBe(3000);
  });

  it('marks isAtRisk false when projected balance is positive', () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);
    const summary = buildBudgetSummary({
      startingBalance: 100000,
      totalIncome: 0,
      totalExpenses: 5000,
      futureRecurringTotal: 10000,
      plannedExpensesTotal: 5000,
      periodEndDate: endDate,
    });
    expect(summary.isAtRisk).toBe(false);
    expect(summary.projectedBalance).toBe(80000);
  });
});
