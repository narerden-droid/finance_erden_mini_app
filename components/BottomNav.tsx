'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, Settings } from 'lucide-react';

const items = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/add', label: 'Добавить', icon: PlusCircle },
  { href: '/settings', label: 'Настройки', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-tg-secondary-bg border-t border-black/5">
      <div className="max-w-md mx-auto flex justify-around items-center py-2 px-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-5 py-1.5 rounded-2xl transition ${
                active ? 'text-tg-button' : 'text-tg-hint'
              }`}
            >
              <Icon size={26} strokeWidth={active ? 2.5 : 2} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
