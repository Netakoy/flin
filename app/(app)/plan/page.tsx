import { prisma } from '@/lib/prisma';
import { toggleRecurring } from '@/actions/recurring';
import { updatePlannedStatus } from '@/actions/planned';
import AddRecurringSheet from '@/components/add-recurring-sheet';
import AddPlannedSheet from '@/components/add-planned-sheet';

export default async function PlanPage() {
  const [recurring, planned, categories] = await Promise.all([
    prisma.recurringPayment.findMany({ include: { category: true }, orderBy: { dayOfMonth: 'asc' } }),
    prisma.plannedExpense.findMany({
      where: { status: { in: ['planned', 'postponed'] } },
      include: { category: true },
      orderBy: { priority: 'desc' },
    }),
    prisma.category.findMany(),
  ]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);

  const totalRecurring = recurring.filter((r) => r.isActive).reduce((s, r) => s + r.amount, 0);
  const totalPlanned = planned.reduce((s, p) => s + p.estimatedAmount, 0);

  return (
    <div className="flex flex-col gap-4 p-4 pt-6">
      <h2 className="text-lg font-bold text-slate-800">План расходов</h2>

      {/* Регулярные платежи */}
      <div className="bg-white rounded-2xl border-2 border-slate-100 p-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Регулярные платежи
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-red-500">{fmt(totalRecurring)} ₽/мес</p>
            <AddRecurringSheet categories={categories} />
          </div>
        </div>
        <div className="flex flex-col gap-0">
          {recurring.map((r, i) => (
            <div
              key={r.id}
              className={`flex items-center gap-3 py-2.5 ${
                i < recurring.length - 1 ? 'border-b border-slate-50' : ''
              }`}
            >
              <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-sm">
                {r.category.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${r.isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                  {r.name}
                </p>
                <p className="text-xs text-slate-400">
                  {r.dayOfMonth ? `${r.dayOfMonth} числа · ` : ''}
                  {r.frequency === 'monthly' ? 'Ежемесячно' : r.frequency === 'weekly' ? 'Еженедельно' : 'Ежегодно'}
                </p>
              </div>
              <p className="text-sm font-bold text-slate-700">{fmt(r.amount)} ₽</p>
              <form action={toggleRecurring.bind(null, r.id, !r.isActive)}>
                <button
                  type="submit"
                  className={`w-10 h-6 rounded-full transition-colors ${
                    r.isActive ? 'bg-green-500' : 'bg-slate-200'
                  }`}
                >
                  <span className={`block w-4 h-4 bg-white rounded-full transition-transform mx-1 ${
                    r.isActive ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>

      {/* Запланированные расходы */}
      <div className="bg-white rounded-2xl border-2 border-slate-100 p-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            Запланировано
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-500">~{fmt(totalPlanned)} ₽</p>
            <AddPlannedSheet categories={categories} />
          </div>
        </div>
        {planned.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Нет запланированных трат</p>
        ) : (
          <div className="flex flex-col gap-0">
            {planned.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-3 py-2.5 ${
                  i < planned.length - 1 ? 'border-b border-slate-50' : ''
                }`}
              >
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-sm">
                  {p.category.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-400">
                    {p.priority === 'high' ? '🔴 Высокий' : p.priority === 'medium' ? '🟡 Средний' : '🟢 Низкий'} приоритет
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-700">~{fmt(p.estimatedAmount)} ₽</p>
                <form action={updatePlannedStatus.bind(null, p.id, 'purchased')}>
                  <button type="submit" className="text-xs text-green-600 font-semibold py-1 px-2 rounded-lg bg-green-50">
                    ✓
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
