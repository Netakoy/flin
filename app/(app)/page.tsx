import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { buildBudgetSummary } from '@/lib/budget';
import { buildChatContext } from '@/lib/ai';
import BalanceCard from '@/components/balance-card';
import QuickInput from '@/components/quick-input';
import FlinTip from '@/components/flin-tip';
import UpcomingPayments from '@/components/upcoming-payments';
import RecentTransactions from '@/components/recent-transactions';

async function getBudgetSummary() {
  const period = await prisma.budgetPeriod.findFirst({ orderBy: { createdAt: 'desc' } });
  if (!period) return null;

  const [transactions, recurring, planned] = await Promise.all([
    prisma.transaction.findMany({ where: { date: { gte: period.startDate, lte: period.endDate } } }),
    prisma.recurringPayment.findMany({ where: { isActive: true } }),
    prisma.plannedExpense.findMany({ where: { status: 'planned' } }),
  ]);

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const today = new Date();
  const futureRecurring = recurring
    .filter((r) => !r.dayOfMonth || r.dayOfMonth >= today.getDate())
    .reduce((s, r) => s + r.amount, 0);
  const plannedTotal = planned.reduce((s, p) => s + p.estimatedAmount, 0);

  return buildBudgetSummary({
    startingBalance: period.startingBalance,
    totalIncome,
    totalExpenses,
    futureRecurringTotal: futureRecurring,
    plannedExpensesTotal: plannedTotal,
    periodEndDate: period.endDate,
  });
}

export default async function HomePage() {
  const [user, summary] = await Promise.all([getCurrentUser(), getBudgetSummary()]);
  if (!user) return null;

  const budgetContext = await buildChatContext(user.id);

  const defaultSummary = summary ?? {
    currentBalance: 0, projectedBalance: 0, dailyLimit: 0,
    daysRemaining: 0, isAtRisk: false, riskAmount: 0,
  };

  return (
    <div className="flex flex-col gap-4 p-4 pt-6">
      <BalanceCard summary={defaultSummary} userName={user.name} />
      <QuickInput />
      <Suspense fallback={
        <div className="bg-yellow-50 border-2 border-yellow-100 rounded-2xl p-4 h-16 animate-pulse" />
      }>
        <FlinTip budgetContext={budgetContext} />
      </Suspense>
      <UpcomingPayments />
      <RecentTransactions />
    </div>
  );
}
