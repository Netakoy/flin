'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { parseExpenses, type ParsedExpense } from '@/lib/ai';
import { getCurrentUserId } from '@/lib/user';

export async function parseAndConfirm(text: string): Promise<ParsedExpense[]> {
  const categories = await prisma.category.findMany({ where: { type: 'expense' } });
  const categoryNames = categories.map((c: { name: string }) => c.name);
  return parseExpenses(text, categoryNames);
}

export async function confirmExpenses(expenses: ParsedExpense[]): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Пользователь не авторизован');

  const categories = await prisma.category.findMany({ where: { type: 'expense' } });
  const categoryMap = new Map(categories.map((c: { name: string; id: string }) => [c.name, c.id]));

  await prisma.transaction.createMany({
    data: expenses.map((exp) => ({
      type: 'expense' as const,
      amount: exp.amount,
      description: exp.description,
      categoryId: categoryMap.get(exp.categoryName) ?? categoryMap.get('Другое') ?? categories[0].id,
      userId,
      source: 'ai' as const,
      confidence: exp.confidence,
      date: new Date(),
    })),
  });

  revalidatePath('/');
  revalidatePath('/transactions');
}
