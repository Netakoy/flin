'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Calendar, MessageCircle, Settings } from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: 'Главная' },
  { href: '/transactions', icon: List, label: 'Операции' },
  { href: '/plan', icon: Calendar, label: 'План' },
  { href: '/chat', icon: MessageCircle, label: 'ФЛИН' },
  { href: '/admin', icon: Settings, label: 'Настройки' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 safe-area-pb z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 flex-1 py-2 min-h-[44px] justify-center"
            >
              <Icon
                size={22}
                className={active ? 'text-green-600' : 'text-slate-400'}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-medium ${active ? 'text-green-600' : 'text-slate-400'}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
