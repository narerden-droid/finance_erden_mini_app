import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyTelegramInitData } from '@/lib/telegram-verify';

const DEFAULT_CATEGORIES = [
  { name: 'Еда', icon: '🍔' },
  { name: 'Транспорт', icon: '🚌' },
  { name: 'Развлечения', icon: '🎮' },
  { name: 'Спорт', icon: '🏋️' },
  { name: 'Здоровье', icon: '💊' },
  { name: 'Покупки', icon: '🛍️' },
  { name: 'Прочее', icon: '💰' },
];

// Создаёт пользователя при первом входе (+ категории по умолчанию) или возвращает существующего
export async function POST(req: NextRequest) {
  const { initData } = await req.json();
  const { valid, user } = verifyTelegramInitData(initData || '');

  if (!valid || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  let { data: existing } = await supabase
    .from('app_users')
    .select('*')
    .eq('telegram_id', user.id)
    .maybeSingle();

  if (!existing) {
    const { data: created, error } = await supabase
      .from('app_users')
      .insert({ telegram_id: user.id, chat_id: user.id, daily_limit: 0 })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    existing = created;

    const categoriesToInsert = DEFAULT_CATEGORIES.map((c) => ({
      user_id: existing!.id,
      name: c.name,
      icon: c.icon,
      is_custom: false,
    }));
    await supabase.from('categories').insert(categoriesToInsert);
  }

  return NextResponse.json({ user: existing });
}

// Обновляет ежедневный лимит трат
export async function PATCH(req: NextRequest) {
  const { initData, daily_limit } = await req.json();
  const { valid, user } = verifyTelegramInitData(initData || '');

  if (!valid || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('app_users')
    .update({ daily_limit })
    .eq('telegram_id', user.id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
