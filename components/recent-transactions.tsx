import { prisma } from '@/lib/prisma';

export default async function RecentTransactions() {
  const transactions = await prisma.transaction.findMany({
    include: { category: true, user: true },
    orderBy: { date: 'desc' },
    take: 5,
  });

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-slate-100 p-4">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
          Операции
        </p>
        <p className="text-sm text-slate-400 text-center py-4">Пока нет операций</p>
      </div>
    );
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 p-4">
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3">
        Последние операции
      </p>
      <div className="flex flex-col">
        {transactions.map((t, i) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 py-2.5 ${
              i < transactions.length - 1 ? 'border-b border-slate-50' : ''
            }`}
          >
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">
              {t.category.emoji ?? '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{t.description}</p>
              <p className="text-xs text-slate-400">
                {t.category.name} · {t.user.name}
              </p>
            </div>
            <p
              className={`text-sm font-bold flex-shrink-0 ${
                t.type === 'expense' ? 'text-red-500' : 'text-green-600'
              }`}
            >
              {t.type === 'expense' ? '−' : '+'}
              {fmt(t.amount)} ₽
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
