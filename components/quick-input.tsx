'use client';

import { useState, useTransition } from 'react';
import { parseAndConfirm, confirmExpenses } from '@/actions/ai-parse';
import type { ParsedExpense } from '@/lib/ai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Loader2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function QuickInput() {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedExpense[] | null>(null);
  const [isParsing, startParsing] = useTransition();
  const [isConfirming, startConfirming] = useTransition();

  function handleParse() {
    if (!text.trim()) return;
    startParsing(async () => {
      const result = await parseAndConfirm(text);
      setParsed(result);
    });
  }

  function handleConfirm() {
    if (!parsed) return;
    startConfirming(async () => {
      await confirmExpenses(parsed);
      setText('');
      setParsed(null);
    });
  }

  function handleReject() {
    setParsed(null);
  }

  if (parsed) {
    return (
      <div className="bg-white rounded-2xl border-2 border-green-100 p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">
          Добавить {parsed.length} {parsed.length === 1 ? 'расход' : 'расхода'}?
        </p>
        <div className="flex flex-col gap-2 mb-4">
          {parsed.map((exp, i) => (
            <div key={i} className="flex justify-between items-center py-1">
              <div>
                <span className="text-sm font-medium text-slate-800">{exp.description}</span>
                <span className="text-xs text-slate-400 ml-2">{exp.categoryName}</span>
              </div>
              <span className="text-sm font-bold text-red-500">−{exp.amount.toLocaleString('ru')} ₽</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl h-12"
          >
            {isConfirming ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            <span className="ml-1">Добавить</span>
          </Button>
          <Button
            onClick={handleReject}
            variant="outline"
            className="flex-1 rounded-xl h-12 border-slate-200"
          >
            <X size={16} />
            <span className="ml-1">Отмена</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 p-4">
      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">
        Быстрый ввод
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="300 кофе, 1200 такси, 2500 продукты…"
        className="resize-none border-0 p-0 text-sm text-slate-700 placeholder:text-slate-300 focus-visible:ring-0 min-h-[52px]"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleParse();
          }
        }}
      />
      <div className="flex gap-2 mt-3">
        <Button
          onClick={handleParse}
          disabled={isParsing || !text.trim()}
          className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl h-11"
        >
          {isParsing ? <Loader2 size={16} className="animate-spin mr-1" /> : null}
          Добавить
        </Button>
        <Link href="/chat" className="flex-1">
          <Button
            variant="outline"
            className="w-full rounded-xl h-11 border-green-100 text-green-700"
          >
            <MessageCircle size={15} className="mr-1" />
            Спросить
          </Button>
        </Link>
      </div>
    </div>
  );
}
