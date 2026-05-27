'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { UIMessage, DefaultChatTransport } from 'ai';

interface InitialMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function toUIMessages(initial: InitialMessage[]): UIMessage[] {
  return initial.map((m) => ({
    id: m.id,
    role: m.role,
    parts: [{ type: 'text' as const, text: m.content }],
    metadata: undefined,
  }));
}

export default function ChatInterface({ initialMessages }: { initialMessages: InitialMessage[] }) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ai' }),
    messages: toUIMessages(initialMessages),
  });
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage({ text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl font-black text-green-700 tracking-widest mb-2">ФЛИН</p>
            <p className="text-slate-400 text-sm">Спроси меня что угодно о бюджете</p>
            <div className="mt-6 flex flex-col gap-2">
              {[
                'Сколько можно тратить в день?',
                'Можем ли купить кровать в этом месяце?',
                'Где мы тратим больше всего?',
              ].map((hint) => (
                <button
                  key={hint}
                  onClick={() => setInput(hint)}
                  className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2.5 text-left border border-green-100"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const textContent = m.parts
            .filter((p) => p.type === 'text')
            .map((p) => (p as { type: 'text'; text: string }).text)
            .join('');
          return (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-sm'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-bl-sm'
                }`}
              >
                {textContent}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 rounded-bl-sm">
              <Loader2 size={16} className="animate-spin text-slate-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex gap-2 px-4 py-3 border-t border-slate-100 bg-white"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Спроси ФЛИНА…"
          className="flex-1 resize-none rounded-xl border-slate-200 min-h-[44px] max-h-[120px] text-sm"
          rows={1}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-green-600 hover:bg-green-700 rounded-xl h-11 w-11 p-0 flex-shrink-0"
        >
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
