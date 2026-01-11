import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // This is a temporary endpoint for development only
    // In production, migrations should be run via Supabase Dashboard
    
    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Execute the migration SQL step by step
    const migrations = [
      `ALTER TABLE workers ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE workers ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE workers ADD COLUMN IF NOT EXISTS id_front_url TEXT`,
      `ALTER TABLE workers ADD COLUMN IF NOT EXISTS id_back_url TEXT`,
      `ALTER TABLE workers ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{"available": true, "days": [], "timeSlots": []}'`,
      `ALTER TABLE workers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`,
      `CREATE INDEX IF NOT EXISTS idx_workers_onboarding_completed ON workers(onboarding_completed)`,
      `CREATE INDEX IF NOT EXISTS idx_workers_terms_accepted ON workers(terms_accepted)`
    ];

    const results = [];
    for (const sql of migrations) {
      const { error } = await client.from('workers').select('id').limit(1); // Test connection
      if (error) {
        results.push({ sql, error: error.message });
      } else {
        // Try to execute the SQL using a different approach
        try {
          const { error: migrationError } = await client.rpc('exec', { sql });
          if (migrationError) {
            results.push({ sql, error: migrationError.message });
          } else {
            results.push({ sql, success: true });
          }
        } catch (e) {
          results.push({ sql, error: 'Function not available' });
        }
      }
    }

    return NextResponse.json({ 
      message: 'Please run the migration manually in Supabase Dashboard',
      manual_sql: migrations,
      instructions: [
        '1. Go to your Supabase Dashboard',
        '2. Click on SQL Editor',
        '3. Run each SQL statement below in order:',
        ...migrations.map(sql => `   ${sql}`)
      ]
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
