import crypto from 'crypto';

// Проверяет подлинность initData, которую присылает Telegram Mini App.
// Это защищает API от подделанных запросов (кто-то не может притвориться другим пользователем).
export function verifyTelegramInitData(initData: string): {
  valid: boolean;
  user?: { id: number; first_name?: string; username?: string };
} {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !initData) return { valid: false };

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return { valid: false };
    params.delete('hash');

    const pairs: string[] = [];
    const keys = Array.from(params.keys()).sort();
    for (const key of keys) {
      pairs.push(`${key}=${params.get(key)}`);
    }
    const dataCheckString = pairs.join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const valid = computedHash === hash;
    let user;
    try {
      user = JSON.parse(params.get('user') || '{}');
    } catch {
      user = undefined;
    }

    return { valid, user };
  } catch (e) {
    return { valid: false };
  }
}
