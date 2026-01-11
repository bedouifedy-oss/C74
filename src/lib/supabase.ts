import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if properly configured
const isConfigured = supabaseUrl.startsWith('https://') && 
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey.length > 20;

if (!isConfigured) {
  console.warn(
    '[Supabase] Not configured. Using mock mode. ' +
    'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

// Create Supabase client - use a safe placeholder if not configured
const safeUrl = isConfigured ? supabaseUrl : 'https://mock.supabase.co';
const safeKey = isConfigured ? supabaseAnonKey : 'mock-key-for-development-only';

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
  },
});

// Export config check for other modules
export const isSupabaseReady = isConfigured;

// Server-side Supabase client (uses service role key for admin operations)
export function createServerSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Server Supabase client not configured');
    return null;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Database types (aligned with SQL schema)
export type UserRole = 'customer' | 'worker' | 'admin';
export type JobStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type FeeStatus = 'unpaid' | 'overdue' | 'paid';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: UserRole;
  avatar_url?: string;
  verification_status: VerificationStatus;
  rating: number;
  completed_jobs: number;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface Worker extends User {
  category: string;
  bio?: string;
  hourly_rate?: number;
  years_of_experience?: number;
  guarantee_enabled: boolean;
  city?: string; // Changed from cities array to city string
  status: 'pending' | 'active' | 'suspended' | 'rejected'; // Added status field
  rating_avg?: number;
  rating_count?: number;
  documents_verified?: boolean;
  profile_photo_url?: string;
  completed_jobs_count?: number;
  verified_at?: string;
  verified_by?: string;
}

export interface Job {
  id: string;
  customer_id: string;
  worker_id?: string;
  category: string;
  description: string;
  address: string;
  city: string;
  status: JobStatus;
  original_price?: number;
  final_price?: number;
  negotiation_count: number;
  guarantee_enabled: boolean;
  created_at: string;
  completed_at?: string;
}

export interface Fee {
  id: string;
  worker_id: string;
  job_id: string;
  amount_due: number;
  status: FeeStatus;
  grace_period_days: number;
  reminder_sent_at?: string;
  warning_sent_at?: string;
  suspension_scheduled_at?: string;
  paid_at?: string;
  payment_proof_url?: string;
  created_at: string;
}

export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

// Helper functions for common database operations
export async function getUser(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return data;
}

export async function getWorkersByCategory(category: string, city?: string): Promise<Worker[]> {
  console.log(`[Supabase] Fetching workers for category: ${category}, city: ${city || 'any'}`);
  
  // Direct query - no redundant testing
  let query = supabase
    .from('workers')
    .select('*')
    .eq('category', category)
    .eq('status', 'active');
  
  if (city) {
    query = query.eq('city', city);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('[Supabase] Query error:', error);
    return [];
  }
  
  console.log(`[Supabase] Found ${data?.length || 0} workers for ${category}`);
  return data || [];
}

// NEW: Get all worker counts in one query
export async function getAllWorkerCounts(): Promise<{ plumbing: number; electrical: number; ac: number; cleaning: number }> {
  console.log('[Supabase] Fetching all worker counts in single query...');
  
  const { data, error } = await supabase
    .from('workers')
    .select('category')
    .eq('status', 'active');
  
  if (error) {
    console.error('[Supabase] Error fetching all workers:', error);
    return { plumbing: 0, electrical: 0, ac: 0, cleaning: 0 };
  }
  
  // Count workers by category
  const counts = { plumbing: 0, electrical: 0, ac: 0, cleaning: 0 };
  data?.forEach(worker => {
    const category = worker.category as keyof typeof counts;
    if (category in counts) {
      counts[category]++;
    }
  });
  
  console.log('[Supabase] Worker counts:', counts);
  return counts;
}

export async function getJobsByUser(userId: string, role: 'customer' | 'worker'): Promise<Job[]> {
  const column = role === 'customer' ? 'customer_id' : 'worker_id';
  
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq(column, userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
  
  return data || [];
}

export async function getUnpaidFees(workerId: string): Promise<Fee[]> {
  const { data, error } = await supabase
    .from('fees')
    .select('*')
    .eq('worker_id', workerId)
    .in('status', ['unpaid', 'overdue'])
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching fees:', error);
    return [];
  }
  
  return data || [];
}
