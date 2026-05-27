'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import AddTransactionForm from '@/components/add-transaction-form';
import type { Category } from '@prisma/client';

export default function AddTransactionSheet({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 px-4 text-sm font-medium transition-colors">
        <Plus size={16} className="mr-1" /> Добавить
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle className="text-left">Новая операция</SheetTitle>
        </SheetHeader>
        <AddTransactionForm categories={categories} onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
