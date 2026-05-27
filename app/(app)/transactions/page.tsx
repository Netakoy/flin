import { prisma } from '@/lib/prisma';
import TransactionList from '@/components/transaction-list';
import AddTransactionSheet from '@/components/add-transaction-sheet';

export default async function TransactionsPage() {
  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      include: { category: true, user: true },
      orderBy: { date: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="flex flex-col gap-4 p-4 pt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Операции</h2>
        <AddTransactionSheet categories={categories} />
      </div>
      <TransactionList transactions={transactions} />
    </div>
  );
}
