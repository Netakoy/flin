import { prisma } from '@/lib/prisma';

export default async function UpcomingPayments() {
  const recurring = await prisma.recurringPayment.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { dayOfMonth: 'asc' },
    take: 3,
  });

  if (recurring.length === 0) return null;

  const today = new Date();
  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 p-4">
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-3">
        Ближайшие платежи
      </p>
      <div className="flex flex-col gap-0">
        {recurring.map((r, i) => {
          const day = r.dayOfMonth;
          const date = day
            ? `${day} ${today.toLocaleString('ru', { month: 'long' })}`
            : 'Регулярно';
          return (
            <div
              key={r.id}
              className={`flex justify-between items-center py-2.5 ${
                i < recurring.length - 1 ? 'border-b border-slate-50' : ''
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-400">{date}</p>
              </div>
              <p className="text-sm font-bold text-red-500">−{fmt(r.amount)} ₽</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
