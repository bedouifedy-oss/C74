import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { storeAuthSession } from '@/lib/auth-session';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Validate input
    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Phone and password are required' },
        { status: 400 }
      );
    }

    const normalizedPhone = String(phone).trim();
    const { data: adminUser, error: adminError } = await client
      .from('users')
      .select('id, phone, name, role, password_hash')
      .eq('role', 'admin')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (adminError || !adminUser) {
      console.log('Admin login failed for phone:', normalizedPhone);
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 });
    }

    const passwordHash = hashPassword(password);
    console.log('Login attempt for phone:', normalizedPhone);
    console.log('Input password hash:', passwordHash);
    console.log('Stored password hash:', adminUser.password_hash);
    console.log('Hashes match:', adminUser.password_hash === passwordHash);
    
    if (!adminUser.password_hash || adminUser.password_hash !== passwordHash) {
      console.log('Admin login failed for phone:', normalizedPhone);
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 });
    }

    // Generate admin token
    const token = `admin_jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    storeAuthSession(token, {
      user_id: adminUser.id,
      role: 'admin',
    });

    console.log('Admin login successful:', normalizedPhone);

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: adminUser.id,
        phone: adminUser.phone,
        name: adminUser.name,
        role: 'admin',
      },
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
