export interface BudgetSummaryInput {
  startingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  futureRecurringTotal: number;
  plannedExpensesTotal: number;
  periodEndDate: Date;
}

export interface BudgetSummary {
  currentBalance: number;
  projectedBalance: number;
  dailyLimit: number;
  daysRemaining: number;
  isAtRisk: boolean;
  riskAmount: number;
}

export function calculateCurrentBalance(
  startingBalance: number,
  totalIncome: number,
  totalExpenses: number
): number {
  return startingBalance + totalIncome - totalExpenses;
}

export function calculateProjectedBalance(
  currentBalance: number,
  futureRecurringTotal: number,
  plannedExpensesTotal: number
): number {
  return currentBalance - futureRecurringTotal - plannedExpensesTotal;
}

export function calculateDailyLimit(projectedBalance: number, endDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.max(1, Math.round((end.getTime() - today.getTime()) / msPerDay));
  return projectedBalance / daysRemaining;
}

export function buildBudgetSummary(input: BudgetSummaryInput): BudgetSummary {
  const {
    startingBalance,
    totalIncome,
    totalExpenses,
    futureRecurringTotal,
    plannedExpensesTotal,
    periodEndDate,
  } = input;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(periodEndDate);
  end.setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.max(1, Math.round((end.getTime() - today.getTime()) / msPerDay));

  const currentBalance = calculateCurrentBalance(startingBalance, totalIncome, totalExpenses);
  const projectedBalance = calculateProjectedBalance(
    currentBalance,
    futureRecurringTotal,
    plannedExpensesTotal
  );
  const dailyLimit = projectedBalance / daysRemaining;
  const isAtRisk = projectedBalance < 0;

  return {
    currentBalance,
    projectedBalance,
    dailyLimit,
    daysRemaining,
    isAtRisk,
    riskAmount: isAtRisk ? Math.abs(projectedBalance) : 0,
  };
}
