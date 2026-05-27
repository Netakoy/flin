'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function updateBudgetPeriod(data: {
  id: string;
  startDate: string;
  endDate: string;
  plannedBudget: number;
  startingBalance: number;
  includeRecurringInBudget: boolean;
}) {
  await prisma.budgetPeriod.update({
    where: { id: data.id },
    data: {
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      plannedBudget: data.plannedBudget,
      startingBalance: data.startingBalance,
      includeRecurringInBudget: data.includeRecurringInBudget,
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}
