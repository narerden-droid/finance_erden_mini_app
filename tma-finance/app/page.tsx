'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useTelegram } from '@/components/TelegramProvider';

type Summary = {
  balance: number;
  dailyLimit: number;
  today: { income: number; expense: number };
  month: { income: number; expense: number };
};

export default function DashboardPage() {
  const { initData, ready } = useTelegram();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;

    (async () => {
      // Регистрируем / получаем пользователя (создаёт запись + категории по умолчанию при первом входе)
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });

      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      });
      const data = await res.json();
      setSummary(data);
      setLoading(false);
    })();
  }, [ready, initData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-tg-hint">Загрузка...</p>
      </div>
    );
  }

  const spentToday = summary?.today.expense || 0;
  const limit = summary?.dailyLimit || 0;
  const progress = limit > 0 ? Math.min(100, (spentToday / limit) * 100) : 0;
  const overLimit = limit > 0 && spentToday > limit;

  return (
    <div className="px-5 pt-6 space-y-6">
      <div>
        <p className="text-tg-hint text-sm">Ваш баланс</p>
        <h1 className="text-4xl font-bold mt-1">
          {(summary?.balance ?? 0).toLocaleString('ru-RU')} ₸
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-tg-secondary-bg rounded-2xl p-4">
          <p className="text-tg-hint text-xs mb-1">Доход (месяц)</p>
          <p className="text-lg font-semibold text-emerald-500">
            +{(summary?.month.income ?? 0).toLocaleString('ru-RU')}
          </p>
        </div>
        <div className="bg-tg-secondary-bg rounded-2xl p-4">
          <p className="text-tg-hint text-xs mb-1">Расход (месяц)</p>
          <p className="text-lg font-semibold text-rose-500">
            -{(summary?.month.expense ?? 0).toLocaleString('ru-RU')}
          </p>
        </div>
      </div>

      {limit > 0 && (
        <div className="bg-tg-secondary-bg rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">Дневной лимит</p>
            <p className={`text-sm font-semibold ${overLimit ? 'text-rose-500' : 'text-tg-hint'}`}>
              {spentToday.toLocaleString('ru-RU')} / {limit.toLocaleString('ru-RU')}
            </p>
          </div>
          <div className="w-full h-3 bg-black/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${overLimit ? 'bg-rose-500' : 'bg-tg-button'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {overLimit && (
            <p className="text-xs text-rose-500 mt-2">Лимит на сегодня превышен ⚠️</p>
          )}
        </div>
      )}

      {limit === 0 && (
        <div className="bg-tg-secondary-bg rounded-2xl p-4">
          <p className="text-sm text-tg-hint">
            Вы ещё не установили дневной лимит трат. Сделайте это в разделе «Настройки», чтобы
            получать уведомления при перерасходе.
          </p>
        </div>
      )}

      <Link
        href="/add"
        className="flex items-center justify-center gap-2 w-full bg-tg-button text-tg-button-text font-semibold text-lg py-4 rounded-2xl active:scale-95 transition"
      >
        <PlusCircle size={24} />
        Добавить операцию
      </Link>
    </div>
  );
}
