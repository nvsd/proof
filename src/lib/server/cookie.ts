import { setCookie as tanstackSetCookie, getCookie as tanstackGetCookie } from '@tanstack/react-start/server';

export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  maxAge?: number;
  expires?: Date;
  domain?: string;
};

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  tanstackSetCookie(name, value, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    ...options,
  });
}

export function getCookie(name: string): string | undefined {
  return tanstackGetCookie(name) ?? undefined;
}
