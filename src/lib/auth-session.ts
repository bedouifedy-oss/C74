import type { NextRequest } from 'next/server';

type Session = {
  user_id: string;
  role: 'customer' | 'worker' | 'admin';
  phone?: string;
  created_at: number;
};

declare global {
  // eslint-disable-next-line no-var
  var authSessions: Record<string, Session> | undefined;
}

export function storeAuthSession(token: string, session: Omit<Session, 'created_at'>) {
  global.authSessions = global.authSessions || {};
  global.authSessions[token] = { ...session, created_at: Date.now() };
}

export function getAuthSessionFromRequest(request: NextRequest): Session | null {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
  if (!token) return null;
  return global.authSessions?.[token] || null;
}
