'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const USER_COOKIE = 'flin_user_id';

export async function selectUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 год
    path: '/',
  });
  redirect('/');
}

export async function switchUser() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE);
  redirect('/select-user');
}
