'use client';

import { useState } from 'react';
import { deleteTransaction } from '@/actions/transactions';
import type { Transaction, Category, User } from '@prisma/client';
import { Trash2 } from 'lucide-react';

type TxWithRelations = Transaction & { category: Category; user: User };

interface Props {
  transactions: TxWithRelations[];
}

export default function TransactionList({ transactions }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const fmt = (n: number) =>
    new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);

  if (transactions.length === 0) {
    return <p className="text-center text-slate-400 py-10 text-sm">Операций пока нет</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      {transactions.map((t) => (
        <div
          key={t.id}
          className="bg-white rounded-xl border border-slate-100 flex items-center gap-3 p-3"
        >
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center text-base flex-shrink-0">
            {t.category.emoji ?? '📦'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{t.description}</p>
            <p className="text-xs text-slate-400">
              {t.category.name} · {t.user.name} ·{' '}
              {new Date(t.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <p
            className={`text-sm font-bold flex-shrink-0 ${
              t.type === 'expense' ? 'text-red-500' : 'text-green-600'
            }`}
          >
            {t.type === 'expense' ? '−' : '+'}
            {fmt(t.amount)} ₽
          </p>
          <button
            onClick={async () => {
              setDeleting(t.id);
              await deleteTransaction(t.id);
              setDeleting(null);
            }}
            disabled={deleting === t.id}
            className="p-1.5 text-slate-300 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
