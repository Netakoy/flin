'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { addPlanned } from '@/actions/planned';
import type { Category } from '@prisma/client';

export default function AddPlannedSheet({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !amount || !categoryId) return;
    setLoading(true);
    try {
      await addPlanned({ name, estimatedAmount: parseFloat(amount), categoryId, priority, necessity: 'optional' });
      setOpen(false);
      setName(''); setAmount(''); setCategoryId('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl px-3 py-1.5 hover:bg-slate-50 transition-colors">
        <Plus size={14} /> Добавить
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader><SheetTitle className="text-left">Запланированная трата</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
          <Input placeholder="Название (Кровать, Отпуск…)" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl border-slate-200" required />
          <Input type="number" placeholder="Примерная сумма" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11 rounded-xl border-slate-200" required />
          <Select value={categoryId} onValueChange={(value) => setCategoryId(value || '')}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200"><SelectValue placeholder="Категория" /></SelectTrigger>
            <SelectContent>{expenseCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="high">🔴 Высокий приоритет</SelectItem>
              <SelectItem value="medium">🟡 Средний приоритет</SelectItem>
              <SelectItem value="low">🟢 Низкий приоритет</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={loading} className="h-11 bg-green-600 hover:bg-green-700 rounded-xl">
            {loading ? 'Добавляю…' : 'Добавить'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
