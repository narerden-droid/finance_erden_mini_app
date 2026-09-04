import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyTelegramInitData } from '@/lib/telegram-verify';
import { sendTelegramMessage } from '@/lib/telegram-server';

// Добавление операции (доход/расход) + проверка дневного лимита + Telegram-алерт
export async function POST(req: NextRequest) {
  const { initData, amount, type, category_id, note } = await req.json();
  const { valid, user } = verifyTelegramInitData(initData || '');

  if (!valid || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!amount || Number(amount) <= 0 || !['income', 'expense'].includes(type)) {
    return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 });
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

  const { data: tx, error } = await supabase
    .from('transactions')
    .insert({
      user_id: appUser.id,
      category_id: category_id || null,
      amount: Number(amount),
      type,
      note: note || null,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Проверка дневного лимита — только для расходов и только если лимит задан (> 0)
  if (type === 'expense' && Number(appUser.daily_limit) > 0) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: todayExpenses } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', appUser.id)
      .eq('type', 'expense')
      .gte('created_at', startOfDay.toISOString());

    const totalToday = (todayExpenses || []).reduce((sum, t) => sum + Number(t.amount), 0);

    if (totalToday > Number(appUser.daily_limit)) {
      await sendTelegramMessage(
        appUser.chat_id,
        `⚠️ <b>Внимание!</b> Вы превысили свой ежедневный лимит расходов.\n\n` +
          `Лимит: ${appUser.daily_limit}\n` +
          `Потрачено сегодня: ${totalToday.toFixed(2)}`
      );
    }
  }

  return NextResponse.json({ transaction: tx });
}
