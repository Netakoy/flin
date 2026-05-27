'use client';

import { useState } from 'react';
import { addTransaction } from '@/actions/transactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Category } from '@prisma/client';

interface Props {
  categories: Category[];
  onClose: () => void;
}

export default function AddTransactionForm({ categories, onClose }: Props) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !description || !categoryId) return;
    setLoading(true);
    try {
      await addTransaction({ type, amount: parseFloat(amount), description, categoryId, date });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            type === 'expense'
              ? 'bg-red-100 text-red-600 border-2 border-red-200'
              : 'bg-slate-50 text-slate-400 border-2 border-transparent'
          }`}
        >
          Расход
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            type === 'income'
              ? 'bg-green-100 text-green-600 border-2 border-green-200'
              : 'bg-slate-50 text-slate-400 border-2 border-transparent'
          }`}
        >
          Доход
        </button>
      </div>

      <div>
        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1.5 block">Сумма</label>
        <Input
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-12 text-lg font-bold rounded-xl border-slate-200"
          required
        />
      </div>

      <div>
        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1.5 block">Описание</label>
        <Input
          placeholder="Например: продукты"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-12 rounded-xl border-slate-200"
          required
        />
      </div>

      <div>
        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1.5 block">Категория</label>
        <Select value={categoryId} onValueChange={(value) => setCategoryId(value || '')}>
          <SelectTrigger className="h-12 rounded-xl border-slate-200">
            <SelectValue placeholder="Выбери категорию" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1.5 block">Дата</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-12 rounded-xl border-slate-200"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-12 bg-green-600 hover:bg-green-700 rounded-xl font-semibold mt-2"
      >
        {loading ? 'Добавляю…' : 'Добавить'}
      </Button>
    </form>
  );
}
