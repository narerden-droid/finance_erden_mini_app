'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTelegram } from '@/components/TelegramProvider';

type Category = { id: string; name: string; icon: string };

export default function AddPage() {
  const { initData, ready } = useTelegram();
  const router = useRouter();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ready) return;
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, [ready, initData]);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0 || saving) return;
    setSaving(true);
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData,
          amount: Number(amount),
          type,
          category_id: type === 'expense' ? categoryId : null,
          note: note || null,
        }),
      });
      router.push('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 pt-6 space-y-6">
      <h1 className="text-2xl font-bold">Новая операция</h1>

      <div className="flex bg-tg-secondary-bg rounded-2xl p-1">
        <button
          onClick={() => setType('expense')}
          className={`flex-1 py-3 rounded-xl font-semibold transition ${
            type === 'expense' ? 'bg-rose-500 text-white' : 'text-tg-hint'
          }`}
        >
          Расход
        </button>
        <button
          onClick={() => setType('income')}
          className={`flex-1 py-3 rounded-xl font-semibold transition ${
            type === 'income' ? 'bg-emerald-500 text-white' : 'text-tg-hint'
          }`}
        >
          Доход
        </button>
      </div>

      <div>
        <label className="text-sm text-tg-hint mb-1 block">Сумма</label>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full bg-tg-secondary-bg rounded-2xl px-4 py-4 text-3xl font-bold outline-none"
        />
      </div>

      {type === 'expense' && (
        <div>
          <label className="text-sm text-tg-hint mb-2 block">Категория</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition ${
                  categoryId === c.id
                    ? 'border-tg-button bg-tg-button/10'
                    : 'border-transparent bg-tg-secondary-bg'
                }`}
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs font-medium truncate w-full text-center px-1">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm text-tg-hint mb-1 block">Заметка (необязательно)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Например: обед с коллегами"
          className="w-full bg-tg-secondary-bg rounded-2xl px-4 py-3 outline-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving || !amount}
        className="w-full bg-tg-button text-tg-button-text font-semibold text-lg py-4 rounded-2xl active:scale-95 transition disabled:opacity-50"
      >
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  );
}
