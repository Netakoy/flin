import type { BudgetSummary } from '@/lib/budget';

interface Props {
  summary: BudgetSummary;
  userName: string;
}

export default function BalanceCard({ summary, userName }: Props) {
  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-black text-green-700 tracking-widest">ФЛИН</h1>
        <span className="text-xs bg-green-50 text-green-700 font-bold px-3 py-1.5 rounded-full">
          {userName}
        </span>
      </div>
      <div
        className="rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
      >
        <p className="text-xs text-green-200 uppercase tracking-wider mb-1">Текущий остаток</p>
        <p className="text-4xl font-black text-white leading-none mb-3">
          {fmt(summary.currentBalance)} ₽
        </p>
        <div
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 ${
            summary.isAtRisk ? 'bg-red-900/40' : 'bg-black/20'
          }`}
        >
          <div>
            <p className="text-[10px] text-green-200/80">С учётом трат</p>
            <p
              className={`text-base font-bold leading-none ${
                summary.isAtRisk ? 'text-red-300' : 'text-white'
              }`}
            >
              {summary.projectedBalance < 0 ? '−' : ''}
              {fmt(Math.abs(summary.projectedBalance))} ₽
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
