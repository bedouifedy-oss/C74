import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface Session {
  user_id: string;
  role: string;
  phone?: string;
  created_at: number;
}

export function generateAuthToken(session: Session): string {
  return jwt.sign(session, process.env.JWT_SECRET!, {
    expiresIn: '7d'
  });
}

export function getAuthSessionFromRequest(request: NextRequest): Session | null {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Session;
    return decoded;
  } catch (error) {
    return null;
  }
}
