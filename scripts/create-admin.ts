/**
 * Create Admin User Script
 * 
 * Option 1: Run with environment variables loaded
 *   source .env.local && npx tsx scripts/create-admin.ts
 * 
 * Option 2: Run this SQL directly in Supabase SQL Editor:
 * 
 * INSERT INTO users (role, name, phone, phone_verified, password_hash)
 * VALUES (
 *   'admin',
 *   'C74 Admin',
 *   '+21600000000',
 *   true,
 *   '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
 * )
 * ON CONFLICT (phone) DO UPDATE SET
 *   password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
 *   role = 'admin';
 * 
 * ADMIN CREDENTIALS:
 *   Phone: +21600000000
 *   Password: Admin123!
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables.');
  console.error('');
  console.error('Run this SQL in Supabase SQL Editor instead:');
  console.error('');
  console.error(`INSERT INTO users (role, name, phone, phone_verified, password_hash)
VALUES (
  'admin',
  'C74 Admin',
  '+21600000000',
  true,
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
)
ON CONFLICT (phone) DO UPDATE SET
  password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  role = 'admin';`);
  console.error('');
  console.error('=== ADMIN CREDENTIALS ===');
  console.error('Phone: +21600000000');
  console.error('Password: Admin123!');
  console.error('Login URL: /admin/login');
  console.error('=========================');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function createAdmin() {
  const adminPhone = '+21600000000';
  const adminPassword = 'Admin123!';
  const adminName = 'C74 Admin';

  console.log('Creating admin user...');

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', adminPhone)
    .single();

  if (existing) {
    console.log('Admin user already exists, updating password...');
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hashPassword(adminPassword) })
      .eq('phone', adminPhone);
    
    if (error) {
      console.error('Error updating admin:', error);
      process.exit(1);
    }
    console.log('✅ Admin password updated!');
  } else {
    const { error } = await supabase.from('users').insert({
      role: 'admin',
      name: adminName,
      phone: adminPhone,
      phone_verified: true,
      password_hash: hashPassword(adminPassword),
    });

    if (error) {
      console.error('Error creating admin:', error);
      process.exit(1);
    }
    console.log('✅ Admin user created!');
  }

  console.log('');
  console.log('=== ADMIN CREDENTIALS ===');
  console.log('Phone: +21600000000');
  console.log('Password: Admin123!');
  console.log('Login URL: /admin/login');
  console.log('=========================');
}

createAdmin();
