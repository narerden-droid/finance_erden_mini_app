import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyTelegramInitData } from '@/lib/telegram-verify';

// Данные для дашборда: баланс, доходы/расходы за день и месяц, дневной лимит
export async function POST(req: NextRequest) {
  const { initData } = await req.json();
  const { valid, user } = verifyTelegramInitData(initData || '');

  if (!valid || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: appUser } = await supabase
    .from('app_users')
    .select('*')
    .eq('telegram_id', user.id)
    .maybeSingle();

  if (!appUser) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: allTx } = await supabase
    .from('transactions')
    .select('amount, type, created_at')
    .eq('user_id', appUser.id);

  const tx = allTx || [];

  const balance = tx.reduce(
    (sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)),
    0
  );

  const sumFor = (from: Date, type: string) =>
    tx
      .filter((t) => new Date(t.created_at) >= from && t.type === type)
      .reduce((s, t) => s + Number(t.amount), 0);

  return NextResponse.json({
    balance,
    dailyLimit: Number(appUser.daily_limit) || 0,
    today: { income: sumFor(startOfDay, 'income'), expense: sumFor(startOfDay, 'expense') },
    month: { income: sumFor(startOfMonth, 'income'), expense: sumFor(startOfMonth, 'expense') },
  });
}
