'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function addRecurring(data: {
  name: string;
  amount: number;
  categoryId: string;
  dayOfMonth?: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
}) {
  await prisma.recurringPayment.create({ data });
  revalidatePath('/');
  revalidatePath('/plan');
}

export async function toggleRecurring(id: string, isActive: boolean) {
  await prisma.recurringPayment.update({ where: { id }, data: { isActive } });
  revalidatePath('/');
  revalidatePath('/plan');
}

export async function deleteRecurring(id: string) {
  await prisma.recurringPayment.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/plan');
}
