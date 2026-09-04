'use client';

import { useEffect, useState } from 'react';
import { useTelegram } from '@/components/TelegramProvider';

type Category = { id: string; name: string; icon: string; is_custom: boolean };

export default function SettingsPage() {
  const { initData, ready } = useTelegram();
  const [limit, setLimit] = useState('');
  const [saved, setSaved] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newIcon, setNewIcon] = useState('🏷️');

  const loadCategories = () => {
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  };

  useEffect(() => {
    if (!ready) return;
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, initData]);

  const saveLimit = async () => {
    await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, daily_limit: Number(limit) || 0 }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, name: newCategory.trim(), icon: newIcon }),
    });
    setNewCategory('');
    loadCategories();
  };

  return (
    <div className="px-5 pt-6 space-y-8">
      <h1 className="text-2xl font-bold">Настройки</h1>

      <div className="space-y-2">
        <label className="text-sm text-tg-hint">Ежедневный лимит трат</label>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="Например: 5000"
            className="flex-1 bg-tg-secondary-bg rounded-2xl px-4 py-3 text-lg outline-none"
          />
          <button
            onClick={saveLimit}
            className="bg-tg-button text-tg-button-text font-semibold px-5 rounded-2xl active:scale-95 transition"
          >
            {saved ? '✓' : 'Сохранить'}
          </button>
        </div>
        <p className="text-xs text-tg-hint">
          Если вы потратите больше этой суммы за день, бот пришлёт уведомление в чат.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-tg-hint">Категории</label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-tg-secondary-bg"
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="text-xs font-medium truncate w-full text-center px-1">{c.name}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            className="w-14 bg-tg-secondary-bg rounded-2xl px-2 py-3 text-center text-xl outline-none"
            maxLength={4}
          />
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Новая категория"
            className="flex-1 bg-tg-secondary-bg rounded-2xl px-4 py-3 outline-none"
          />
          <button
            onClick={addCategory}
            className="bg-tg-button text-tg-button-text font-semibold px-4 rounded-2xl active:scale-95 transition"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
