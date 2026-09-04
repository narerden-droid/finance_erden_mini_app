import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyTelegramInitData } from '@/lib/telegram-verify';

async function getUserId(supabase: ReturnType<typeof getSupabaseAdmin>, telegramId: number) {
  const { data } = await supabase
    .from('app_users')
    .select('id')
    .eq('telegram_id', telegramId)
    .maybeSingle();
  return data?.id as string | undefined;
}

// Список категорий пользователя (POST используется вместо GET, чтобы безопасно передать initData в теле запроса)
export async function POST(req: NextRequest) {
  const { initData } = await req.json();
  const { valid, user } = verifyTelegramInitData(initData || '');
  if (!valid || !user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  const userId = await getUserId(supabase, user.id);
  if (!userId) return NextResponse.json({ categories: [] });

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ categories: data });
}

// Создание кастомной категории
export async function PUT(req: NextRequest) {
  const { initData, name, icon } = await req.json();
  const { valid, user } = verifyTelegramInitData(initData || '');
  if (!valid || !user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!name || typeof name !== 'string') {
    return NextResponse.json({ error: 'Название категории обязательно' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const userId = await getUserId(supabase, user.id);
  if (!userId) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });

  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id: userId, name, icon: icon || '💰', is_custom: true })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ category: data });
}
