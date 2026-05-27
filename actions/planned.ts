'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function addPlanned(data: {
  name: string;
  estimatedAmount: number;
  categoryId: string;
  plannedDate?: string;
  priority: 'low' | 'medium' | 'high';
  necessity: 'required' | 'optional';
}) {
  await prisma.plannedExpense.create({
    data: {
      ...data,
      status: 'planned',
      plannedDate: data.plannedDate ? new Date(data.plannedDate) : undefined,
    },
  });
  revalidatePath('/');
  revalidatePath('/plan');
}

export async function updatePlannedStatus(id: string, status: 'planned' | 'postponed' | 'purchased') {
  await prisma.plannedExpense.update({ where: { id }, data: { status } });
  revalidatePath('/');
  revalidatePath('/plan');
}

export async function deletePlanned(id: string) {
  await prisma.plannedExpense.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/plan');
}
