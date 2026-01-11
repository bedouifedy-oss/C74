/**
 * Database Service Layer
 * Centralized database operations with Supabase
 */

import { supabase, isSupabaseReady, createServerSupabaseClient } from './supabase';

// ============================================
// CONFIGURATION
// ============================================

const FEE_PERCENTAGE = Number(process.env.FEE_PERCENTAGE) || 10;
const FEE_MINIMUM_TND = Number(process.env.FEE_MINIMUM_TND) || 5;
const GRACE_PERIOD_DAYS = Number(process.env.GRACE_PERIOD_DAYS) || 30;

// Use the exported check from supabase.ts
const isSupabaseConfigured = () => isSupabaseReady;

// Get server client for read operations when available (bypasses RLS)
const getReadClient = () => {
  const serverClient = createServerSupabaseClient();
  return serverClient || supabase;
};

// Get server client for write operations (bypasses RLS)
const getServerClient = () => {
  const client = createServerSupabaseClient();
  if (!client) {
    throw new Error('Server Supabase client not configured');
  }
  return client;
};

// ============================================
// USER OPERATIONS
// ============================================

export async function getUserByEmail(email: string) {
  // Skip DB query if Supabase not configured
  if (!isSupabaseConfigured()) {
    console.log('[DB] Supabase not configured, skipping getUserByEmail');
    return null;
  }

  try {
    const client = getReadClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by email:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('getUserByEmail exception:', err);
    return null;
  }
}

export async function getUserByPhone(phone: string) {
  // Skip DB query if Supabase not configured
  if (!isSupabaseConfigured()) {
    console.log('[DB] Supabase not configured, skipping getUserByPhone');
    return null;
  }

  try {
    const client = getReadClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by phone:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('getUserByPhone exception:', err);
    return null;
  }
}

export async function createUser(userData: {
  phone: string;
  name: string;
  email?: string;
  role: 'customer' | 'worker';
  password_hash?: string | null;
}) {
  // Skip if Supabase not configured
  if (!isSupabaseConfigured()) {
    console.log('[DB] Supabase not configured, skipping createUser');
    throw new Error('Database not configured');
  }

  try {
    // Use server client to bypass RLS for user creation
    const serverClient = getServerClient();
    const { data, error } = await serverClient
      .from('users')
      .insert({
        ...userData,
        phone_verified: false,
        strikes_count: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error.message, error.code, error.details, error.hint);
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('createUser exception:', err);
    throw err;
  }
}

export async function updateUser(userId: string, updates: Record<string, unknown>) {
  // Skip if Supabase not configured
  if (!isSupabaseConfigured()) {
    console.log('[DB] Supabase not configured, skipping updateUser');
    return null;
  }

  try {
    // Use server client to bypass RLS
    const serverClient = getServerClient();
    const { data, error } = await serverClient
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('updateUser exception:', err);
    return null;
  }
}

export async function verifyUserPhone(userId: string) {
  // Skip if Supabase not configured
  if (!isSupabaseConfigured()) {
    console.log('[DB] Supabase not configured, skipping verifyUserPhone');
    return null;
  }
  return updateUser(userId, { phone_verified: true, last_login: new Date().toISOString() });
}

// ============================================
// WORKER OPERATIONS
// ============================================

export async function getWorkerProfile(workerId: string) {
  const client = getReadClient();
  const { data, error } = await client
    .from('workers')
    .select(`
      *,
      users!workers_id_fkey(name, phone, email, role, strikes_count, suspended_until)
    `)
    .eq('id', workerId)
    .single();

  if (error) {
    console.error('Error fetching worker:', error);
    return null;
  }

  return data;
}

export async function getWorkers(filters?: {
  category?: string;
  city?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const client = getReadClient();
  let query = client
    .from('workers')
    .select(`
      *,
      users!workers_id_fkey(name, phone, avatar_url)
    `, { count: 'exact' });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.city) {
    query = query.eq('city', filters.city);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  } else {
    query = query.eq('status', 'active');
  }

  query = query.order('rating_avg', { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching workers:', error);
    return { workers: [], total: 0 };
  }

  return { workers: data || [], total: count || 0 };
}

export async function getPendingWorkers() {
  const { data, error } = await supabase
    .from('workers')
    .select(`
      *,
      users!workers_id_fkey(name, phone, email, created_at),
      worker_documents(*)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending workers:', error);
    return [];
  }

  return data || [];
}

export async function approveWorker(workerId: string, adminId: string) {
  const { error } = await supabase
    .from('workers')
    .update({
      status: 'active',
      documents_verified: true,
      verified_at: new Date().toISOString(),
      verified_by: adminId,
    })
    .eq('id', workerId);

  if (error) {
    console.error('Error approving worker:', error);
    throw new Error('Failed to approve worker');
  }

  return true;
}

export async function suspendWorker(workerId: string, reason: string, days?: number) {
  const suspendedUntil = days
    ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from('users')
    .update({
      suspended_until: suspendedUntil,
      suspension_reason: reason,
    })
    .eq('id', workerId);

  if (error) {
    console.error('Error suspending worker:', error);
    throw new Error('Failed to suspend worker');
  }

  // Also update worker status
  await supabase
    .from('workers')
    .update({ status: 'suspended' })
    .eq('id', workerId);

  return true;
}

// ============================================
// JOB OPERATIONS
// ============================================

export async function createJob(jobData: {
  customer_id: string;
  category: string;
  description: string;
  address: string;
  address_details?: string;
  scheduled_date: string;
  scheduled_time_slot: string;
  inspection_required?: boolean;
  price_after_inspection?: boolean;
}) {
  // Skip if Supabase not configured
  if (!isSupabaseConfigured()) {
    console.log('[DB] Supabase not configured, skipping createJob');
    throw new Error('Database not configured');
  }

  const client = getServerClient();
  const { data, error } = await client
    .from('jobs')
    .insert({
      ...jobData,
      status: 'requested',
      negotiation_count: 0,
      max_negotiations: 3,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating job:', error);
    throw new Error('Failed to create job');
  }

  return data;
}

export async function getJob(jobId: string) {
  // Skip DB query if Supabase not configured
  if (!isSupabaseConfigured()) {
    console.log('[DB] Supabase not configured, skipping getJob');
    return null;
  }

  const client = getReadClient();
  const { data, error } = await client
    .from('jobs')
    .select(`
      *,
      customer:users!jobs_customer_id_fkey(id, name, phone),
      worker:workers!jobs_worker_id_fkey(
        id,
        category,
        rating_avg,
        users!workers_id_fkey(name, phone)
      ),
      job_photos(*),
      price_negotiations(*)
    `)
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Error fetching job:', error);
    return null;
  }

  return data;
}

export async function getJobs(filters?: {
  customer_id?: string;
  worker_id?: string;
  category?: string;
  status?: string | string[];
  limit?: number;
  offset?: number;
}) {
  // Skip DB query if Supabase not configured
  if (!isSupabaseConfigured()) {
    console.log('[DB] Supabase not configured, skipping getJobs');
    return { jobs: [], total: 0 };
  }

  const client = getReadClient();
  let query = client
    .from('jobs')
    .select(`
      *,
      customer:users!jobs_customer_id_fkey(name),
      worker:workers!jobs_worker_id_fkey(
        users!workers_id_fkey(name)
      )
    `, { count: 'exact' });

  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id);
  }
  if (filters?.worker_id) {
    query = query.eq('worker_id', filters.worker_id);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status);
    } else {
      query = query.eq('status', filters.status);
    }
  }

  query = query.order('created_at', { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
    return { jobs: [], total: 0 };
  }

  return { jobs: data || [], total: count || 0 };
}

export async function getAvailableJobs(workerId: string, category: string) {
  // Get jobs that match worker's category and are open for applications
  // Skip DB query if Supabase not configured
  if (!isSupabaseConfigured()) {
    console.log('[DB] Supabase not configured, skipping getAvailableJobs');
    return [];
  }

  const client = getReadClient();
  const { data, error } = await client
    .from('jobs')
    .select(`
      *,
      customer:users!jobs_customer_id_fkey(name)
    `)
    .eq('category', category)
    .eq('status', 'requested')
    .is('worker_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching available jobs:', error);
    return [];
  }

  return data || [];
}

export async function updateJobStatus(
  jobId: string,
  status: string,
  additionalData?: Record<string, unknown>
) {
  // Skip if Supabase not configured
  if (!isSupabaseConfigured()) {
    console.log('[DB] Supabase not configured, skipping updateJobStatus');
    throw new Error('Database not configured');
  }

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
    ...additionalData,
  };

  // Set timestamp based on status
  if (status === 'accepted') {
    updates.accepted_at = new Date().toISOString();
  } else if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  } else if (status === 'cancelled') {
    updates.cancelled_at = new Date().toISOString();
  }

  const client = getServerClient();
  const { data, error } = await client
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    console.error('Error updating job status:', error);
    throw new Error('Failed to update job status');
  }

  // If job completed, create fee record
  if (status === 'completed' && data.price_agreed) {
    await createFeeForJob(data);
  }

  return data;
}

export async function assignWorkerToJob(jobId: string, workerId: string, price: number) {
  // Skip if Supabase not configured
  if (!isSupabaseConfigured()) {
    console.log('[DB] Supabase not configured, skipping assignWorkerToJob');
    throw new Error('Database not configured');
  }

  const client = getServerClient();
  const { data, error } = await client
    .from('jobs')
    .update({
      worker_id: workerId,
      price_agreed: price,
      price_agreed_at: new Date().toISOString(),
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    console.error('Error assigning worker to job:', error);
    throw new Error('Failed to assign worker');
  }

  return data;
}

// ============================================
// FEE OPERATIONS
// ============================================

function calculateFee(price: number): number {
  const percentageFee = price * (FEE_PERCENTAGE / 100);
  return Math.max(percentageFee, FEE_MINIMUM_TND);
}

async function createFeeForJob(job: { id: string; worker_id: string; price_agreed: number }) {
  const feeAmount = calculateFee(job.price_agreed);
  const now = new Date();
  const dueDate = new Date(now.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  // Get current week boundaries
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  // Check if a fee record exists for this week
  const { data: existingFee } = await supabase
    .from('fees')
    .select('*')
    .eq('worker_id', job.worker_id)
    .gte('period_start', weekStart.toISOString().split('T')[0])
    .lte('period_end', weekEnd.toISOString().split('T')[0])
    .single();

  if (existingFee) {
    // Update existing weekly fee
    await supabase
      .from('fees')
      .update({
        amount_due: existingFee.amount_due + feeAmount,
        jobs_count: existingFee.jobs_count + 1,
      })
      .eq('id', existingFee.id);
  } else {
    // Create new weekly fee record
    await supabase
      .from('fees')
      .insert({
        worker_id: job.worker_id,
        period_start: weekStart.toISOString().split('T')[0],
        period_end: weekEnd.toISOString().split('T')[0],
        jobs_count: 1,
        amount_due: feeAmount,
        amount_paid: 0,
        status: 'unpaid',
        grace_period_days: GRACE_PERIOD_DAYS,
        due_date: dueDate.toISOString(),
        created_at: new Date().toISOString(),
      });
  }
}

export async function getWorkerFees(workerId: string, status?: string) {
  let query = supabase
    .from('fees')
    .select('*')
    .eq('worker_id', workerId);

  if (status) {
    query = query.eq('status', status);
  }

  query = query.order('period_start', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching worker fees:', error);
    return [];
  }

  return data || [];
}

export async function getAllFees(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('fees')
    .select(`
      *,
      worker:workers!fees_worker_id_fkey(
        id,
        users!workers_id_fkey(name, phone)
      )
    `, { count: 'exact' });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  query = query.order('due_date', { ascending: true });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching all fees:', error);
    return { fees: [], total: 0 };
  }

  return { fees: data || [], total: count || 0 };
}

export async function submitFeePayment(
  feeId: string,
  paymentData: {
    payment_method: string;
    payment_reference: string;
    payment_proof_url?: string;
    payment_notes?: string;
  }
) {
  const { data, error } = await supabase
    .from('fees')
    .update({
      ...paymentData,
      status: 'pending_verification',
      paid_at: new Date().toISOString(),
    })
    .eq('id', feeId)
    .select()
    .single();

  if (error) {
    console.error('Error submitting fee payment:', error);
    throw new Error('Failed to submit payment');
  }

  return data;
}

export async function verifyFeePayment(feeId: string, adminId: string) {
  const { data, error } = await supabase
    .from('fees')
    .update({
      status: 'paid',
      verified_by: adminId,
      verified_at: new Date().toISOString(),
    })
    .eq('id', feeId)
    .select()
    .single();

  if (error) {
    console.error('Error verifying fee payment:', error);
    throw new Error('Failed to verify payment');
  }

  return data;
}

export async function rejectFeePayment(feeId: string, adminId: string, reason: string) {
  const { data, error } = await supabase
    .from('fees')
    .update({
      status: 'unpaid',
      payment_proof_url: null,
      payment_reference: null,
      verified_by: adminId,
      admin_notes: reason,
    })
    .eq('id', feeId)
    .select()
    .single();

  if (error) {
    console.error('Error rejecting fee payment:', error);
    throw new Error('Failed to reject payment');
  }

  return data;
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

export async function getConversations(userId: string) {
  // Get all jobs where user is customer or worker
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id,
      category,
      status,
      customer_id,
      worker_id,
      customer:users!jobs_customer_id_fkey(id, name),
      worker:workers!jobs_worker_id_fkey(
        id,
        users!workers_id_fkey(id, name)
      ),
      messages(
        id,
        message_text,
        sender_id,
        created_at,
        read
      )
    `)
    .or(`customer_id.eq.${userId},worker_id.eq.${userId}`)
    .not('worker_id', 'is', null)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Transform to conversation format
  return (data || []).map((job: any) => {
    const isCustomer = job.customer_id === userId;
    const workerUser = job.worker?.users;
    const otherUser = isCustomer
      ? { id: job.worker?.id, name: workerUser?.name }
      : { id: job.customer?.id, name: job.customer?.name };

    const messages = job.messages || [];
    const lastMessage = messages[messages.length - 1];
    const unreadCount = messages.filter((m: { read: boolean; sender_id: string }) => !m.read && m.sender_id !== userId).length;

    return {
      id: job.id,
      jobId: job.id,
      category: job.category,
      otherUser,
      lastMessage: lastMessage ? {
        content: lastMessage.message_text,
        senderId: lastMessage.sender_id,
        createdAt: lastMessage.created_at,
      } : null,
      unreadCount,
    };
  });
}

export async function getMessages(jobId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}

export async function sendMessage(messageData: {
  job_id: string;
  sender_id: string;
  message_text: string;
  message_type?: string;
}) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      ...messageData,
      message_type: messageData.message_type || 'text',
      read: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }

  return data;
}

export async function markMessagesRead(jobId: string, userId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('job_id', jobId)
    .neq('sender_id', userId);

  if (error) {
    console.error('Error marking messages read:', error);
  }
}

// ============================================
// REVIEW OPERATIONS
// ============================================

export async function createReview(reviewData: {
  job_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment?: string;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ...reviewData,
      published: true,
      flagged: false,
      created_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    throw new Error('Failed to create review');
  }

  // Update worker rating
  await updateWorkerRating(reviewData.reviewed_user_id);

  return data;
}

async function updateWorkerRating(workerId: string) {
  // Get all reviews for this worker
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewed_user_id', workerId)
    .eq('published', true);

  if (reviews && reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await supabase
      .from('workers')
      .update({
        rating_avg: Math.round(avgRating * 10) / 10,
        rating_count: reviews.length,
      })
      .eq('id', workerId);
  }
}

// ============================================
// DISPUTE OPERATIONS
// ============================================

export async function createDispute(disputeData: {
  job_id: string;
  opened_by: string;
  issue_type: string;
  description: string;
}) {
  const { data, error } = await supabase
    .from('disputes')
    .insert({
      ...disputeData,
      status: 'open',
      opened_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating dispute:', error);
    throw new Error('Failed to create dispute');
  }

  // Update job status
  await updateJobStatus(disputeData.job_id, 'disputed');

  return data;
}

export async function getDisputes(filters?: {
  status?: string;
  limit?: number;
}) {
  let query = supabase
    .from('disputes')
    .select(`
      *,
      job:jobs!disputes_job_id_fkey(
        id,
        category,
        customer:users!jobs_customer_id_fkey(name),
        worker:workers!jobs_worker_id_fkey(users!workers_id_fkey(name))
      ),
      reporter:users!disputes_opened_by_fkey(name)
    `);

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  query = query.order('opened_at', { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching disputes:', error);
    return [];
  }

  return data || [];
}

export async function resolveDispute(
  disputeId: string,
  adminId: string,
  resolution: string
) {
  const { data, error } = await supabase
    .from('disputes')
    .update({
      status: 'resolved',
      resolution,
      assigned_to: adminId,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', disputeId)
    .select()
    .single();

  if (error) {
    console.error('Error resolving dispute:', error);
    throw new Error('Failed to resolve dispute');
  }

  return data;
}

// ============================================
// NOTIFICATION OPERATIONS
// ============================================

export async function createNotification(notificationData: {
  user_id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...notificationData,
      read: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }

  return data;
}

export async function getNotifications(userId: string, unreadOnly = false) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId);

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  query = query.order('created_at', { ascending: false }).limit(50);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification read:', error);
  }
}

// ============================================
// ADMIN STATISTICS
// ============================================

export async function getAdminStats() {
  const [
    { count: totalWorkers },
    { count: pendingWorkers },
    { count: activeJobs },
    { count: openDisputes },
    { data: fees },
  ] = await Promise.all([
    supabase.from('workers').select('*', { count: 'exact', head: true }),
    supabase.from('workers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).in('status', ['accepted', 'in_progress']),
    supabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('fees').select('amount_due, status').in('status', ['unpaid', 'overdue', 'pending_verification']),
  ]);

  const pendingFees = fees?.reduce((sum, f) => sum + (f.amount_due || 0), 0) || 0;

  return {
    totalWorkers: totalWorkers || 0,
    pendingWorkers: pendingWorkers || 0,
    activeJobs: activeJobs || 0,
    openDisputes: openDisputes || 0,
    pendingFees,
  };
}
