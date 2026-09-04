'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type TelegramUser = { id: number; first_name?: string; username?: string };

type TelegramContextValue = {
  initData: string;
  user: TelegramUser | null;
  ready: boolean;
};

const TelegramContext = createContext<TelegramContextValue>({
  initData: '',
  user: null,
  ready: false,
});

export function useTelegram() {
  return useContext(TelegramContext);
}

export default function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [initData, setInitData] = useState('');
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mod = await import('@twa-dev/sdk');
        const WebApp = mod.default;

        WebApp.ready();
        WebApp.expand();

        if (cancelled) return;

        setInitData(WebApp.initData || '');
        setUser((WebApp.initDataUnsafe?.user as TelegramUser) || null);

        const applyTheme = () => {
          const p = WebApp.themeParams || {};
          const root = document.documentElement;
          if (p.bg_color) root.style.setProperty('--tg-bg', p.bg_color);
          if (p.text_color) root.style.setProperty('--tg-text', p.text_color);
          if (p.hint_color) root.style.setProperty('--tg-hint', p.hint_color);
          if (p.link_color) root.style.setProperty('--tg-link', p.link_color);
          if (p.button_color) root.style.setProperty('--tg-button', p.button_color);
          if (p.button_text_color) root.style.setProperty('--tg-button-text', p.button_text_color);
          if (p.secondary_bg_color) root.style.setProperty('--tg-secondary-bg', p.secondary_bg_color);
        };

        applyTheme();
        WebApp.onEvent('themeChanged', applyTheme);
      } catch (e) {
        // Работает и вне Telegram (например, в обычном браузере при разработке)
        console.warn('Telegram WebApp SDK недоступен:', e);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <TelegramContext.Provider value={{ initData, user, ready }}>
      {children}
    </TelegramContext.Provider>
  );
}
