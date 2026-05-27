import { generateTipCached } from '@/lib/ai';

interface Props {
  budgetContext: string;
}

export default async function FlinTip({ budgetContext }: Props) {
  let tip = 'Считаю данные…';
  try {
    tip = await generateTipCached(budgetContext);
  } catch {
    tip = 'Бюджет загружен. Введи расходы, чтобы я смог дать совет.';
  }

  return (
    <div className="bg-yellow-50 border-2 border-yellow-100 rounded-2xl p-4">
      <p className="text-[10px] text-yellow-700 uppercase tracking-wider font-bold mb-1.5">
        💡 ФЛИН говорит
      </p>
      <p className="text-sm text-yellow-900 leading-relaxed">{tip}</p>
    </div>
  );
}
