'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/user';

export async function addTransaction(data: {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  categoryId: string;
  date: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Не авторизован');

  await prisma.transaction.create({
    data: {
      type: data.type,
      amount: data.amount,
      description: data.description,
      categoryId: data.categoryId,
      userId,
      date: new Date(data.date),
      source: 'manual',
    },
  });

  revalidatePath('/');
  revalidatePath('/transactions');
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/transactions');
}

export async function getTransactions(filter?: {
  type?: 'income' | 'expense';
  categoryId?: string;
  userId?: string;
}) {
  return prisma.transaction.findMany({
    where: {
      ...(filter?.type && { type: filter.type }),
      ...(filter?.categoryId && { categoryId: filter.categoryId }),
      ...(filter?.userId && { userId: filter.userId }),
    },
    include: { category: true, user: true },
    orderBy: { date: 'desc' },
  });
}
