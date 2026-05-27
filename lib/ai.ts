import OpenAI from 'openai';
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ParsedExpense {
  amount: number;
  description: string;
  categoryName: string;
  confidence: number;
}

export async function parseExpenses(
  text: string,
  categoryNames: string[]
): Promise<ParsedExpense[]> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Ты парсер расходов. Из текста извлеки расходы в JSON.
Доступные категории: ${categoryNames.join(', ')}.
Отвечай ТОЛЬКО JSON: {"expenses": [{"amount": number, "description": "string", "categoryName": "string", "confidence": number}]}
Правила: amount — число в рублях, description — что купили, categoryName — точное название из списка (Другое если не подходит), confidence — 0.0–1.0.`,
      },
      { role: 'user', content: text },
    ],
  });

  const content = response.choices[0].message.content ?? '{"expenses":[]}';
  try {
    const parsed = JSON.parse(content) as { expenses: ParsedExpense[] };
    return parsed.expenses ?? [];
  } catch {
    return [];
  }
}

export async function generateTip(budgetContext: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 150,
    messages: [
      {
        role: 'system',
        content: `Ты ФЛИН — семейный финансовый помощник. Давай короткие (1-2 предложения) практические советы по бюджету. Говори конкретно с цифрами. Без морализаторства. Без общих слов вроде "старайтесь тратить меньше". Отвечай только текстом совета, без вступлений.`,
      },
      { role: 'user', content: `Данные бюджета:\n${budgetContext}` },
    ],
  });
  return response.choices[0].message.content ?? 'Бюджет в норме. Продолжай в том же духе.';
}

export async function buildChatContext(userId: string): Promise<string> {
  const [period, transactions, recurring, planned] = await Promise.all([
    prisma.budgetPeriod.findFirst({ orderBy: { createdAt: 'desc' } }),
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 30,
    }),
    prisma.recurringPayment.findMany({
      where: { isActive: true },
      include: { category: true },
    }),
    prisma.plannedExpense.findMany({
      where: { status: 'planned' },
      include: { category: true },
    }),
  ]);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = (period?.startingBalance ?? 0) + totalIncome - totalExpenses;
  const futureRecurring = recurring.reduce((sum, r) => sum + r.amount, 0);
  const futurePlanned = planned.reduce((sum, p) => sum + p.estimatedAmount, 0);
  const projectedBalance = currentBalance - futureRecurring - futurePlanned;

  const recentList = transactions
    .slice(0, 10)
    .map((t) => `${t.type === 'expense' ? '-' : '+'}${t.amount}₽ ${t.description} (${t.category.name})`)
    .join('\n');

  const recurringList = recurring
    .map((r) => `${r.name}: ${r.amount}₽ (${r.dayOfMonth ? `${r.dayOfMonth} числа` : 'регулярно'})`)
    .join('\n');

  const plannedList = planned
    .map((p) => `${p.name}: ~${p.estimatedAmount}₽`)
    .join('\n');

  return `Бюджет: ${period?.plannedBudget ?? 0}₽ (${period?.startDate.toLocaleDateString('ru') ?? '?'} — ${period?.endDate.toLocaleDateString('ru') ?? '?'})
Текущий остаток: ${currentBalance.toLocaleString('ru')}₽
Прогнозный остаток: ${projectedBalance.toLocaleString('ru')}₽

Последние операции:
${recentList || 'нет'}

Регулярные платежи:
${recurringList || 'нет'}

Запланированные расходы:
${plannedList || 'нет'}`;
}

export const generateTipCached = unstable_cache(
  generateTip,
  ['flin-tip'],
  { revalidate: 3600 }
);
