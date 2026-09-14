import type { Session } from '@ezyify/core';
import { me } from './mock';

/** Local stand-in for POST /auth/login until apps/api ships; resolves a session shaped like the real one. */
export async function mockLogin(identifier: string): Promise<Session> {
  await new Promise(r => setTimeout(r, 600));
  return { accessToken: 'mock.' + Date.now(), expiresIn: 900, user: { ...me, username: identifier.split('@')[0] || me.username } };
}
