// ============================================
// C74 - Core Type Definitions
// ============================================

import type { Locale } from '@/i18n-routing';

// ============================================
// USER TYPES
// ============================================

export type UserRole = 'customer' | 'worker' | 'admin';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  name?: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  is_verified: boolean;
  is_active: boolean;
}

export interface Customer extends User {
  role: 'customer';
  address?: string;
  preferred_language?: Locale;
}

export interface Worker extends User {
  role: 'worker';
  categories: ServiceCategory[];
  bio?: string;
  experience_years?: number;
  hourly_rate?: number;
  rating?: number;
  review_count?: number;
  is_available: boolean;
  location?: string;
  service_areas?: string[];
  certifications?: string[];
  portfolio_images?: string[];
  verified_at?: string;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

// ============================================
// SERVICE CATEGORIES
// ============================================

export type ServiceCategory = 
  | 'plumbing'
  | 'electrical'
  | 'ac'
  | 'cleaning'
  | 'painting'
  | 'carpentry'
  | 'gardening'
  | 'appliance_repair'
  | 'moving'
  | 'other';

export interface CategoryInfo {
  id: ServiceCategory;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  icon: string;
}

// ============================================
// JOB TYPES
// ============================================

export type JobStatus = 
  | 'draft'
  | 'requested'
  | 'quoted'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export interface Job {
  id: string;
  customer_id: string;
  worker_id?: string;
  category: ServiceCategory;
  title?: string;
  description: string;
  photos?: string[];
  address: string;
  address_details?: string;
  preferred_date: string;
  preferred_time_slot: TimeSlot;
  inspection_required: boolean;
  price_after_inspection: boolean;
  budget?: number;
  final_price?: number;
  status: JobStatus;
  created_at: string;
  updated_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  
  // Populated fields
  customer?: Customer;
  worker?: Worker;
  applications?: JobApplication[];
  application_count?: number;
}

export interface JobCreateInput {
  category: ServiceCategory;
  description: string;
  photos?: string[];
  address: string;
  address_details?: string;
  preferred_date: string;
  preferred_time_slot: TimeSlot;
  inspection_required?: boolean;
}

// ============================================
// APPLICATION TYPES
// ============================================

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  proposed_price: number;
  message?: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at?: string;
  accepted_at?: string;
  rejected_at?: string;
  
  // Populated fields
  job?: Job;
  worker?: Worker;
}

export interface ApplicationCreateInput {
  job_id: string;
  proposed_price: number;
  message?: string;
}

// ============================================
// MESSAGING TYPES
// ============================================

export type MessageType = 'text' | 'image' | 'price_proposal' | 'system';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: MessageType;
  amount?: number; // For price proposals
  read: boolean;
  read_at?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  job_id?: string;
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
  
  // Populated fields
  other_user?: User;
  job?: Job;
}

export interface ConversationWithDetails extends Conversation {
  other_user: User;
  job?: Job;
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
  
  // Populated fields
  reviewer?: User;
  reviewee?: User;
  job?: Job;
}

export interface ReviewCreateInput {
  job_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
}

// ============================================
// DISPUTE TYPES
// ============================================

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';
export type DisputeType = 'quality' | 'payment' | 'no_show' | 'damage' | 'other';

export interface Dispute {
  id: string;
  job_id: string;
  reporter_id: string;
  type: DisputeType;
  description: string;
  evidence_urls?: string[];
  status: DisputeStatus;
  resolution?: string;
  created_at: string;
  resolved_at?: string;
  
  // Populated fields
  job?: Job;
  reporter?: User;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'job_application'
  | 'application_accepted'
  | 'application_rejected'
  | 'job_started'
  | 'job_completed'
  | 'new_message'
  | 'new_review'
  | 'payment_received'
  | 'dispute_opened'
  | 'dispute_resolved';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============================================
// AUTH TYPES
// ============================================

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginInput {
  phone: string;
}

export interface VerifyOtpInput {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============================================
// FORM TYPES
// ============================================

export interface JobFormData {
  category: ServiceCategory | '';
  description: string;
  photos: string[];
  address: string;
  address_details: string;
  preferred_date: string;
  preferred_time_slot: TimeSlot | '';
  inspection_required: boolean;
}

export interface ApplicationFormData {
  proposed_price: string;
  message: string;
}

// ============================================
// UI TYPES
// ============================================

export interface MenuItemType {
  key: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  separator?: boolean;
}

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

export interface FilterOption {
  value: string;
  label: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type LocalizedString = Record<Locale, string>;

export type WithLocale<T> = T & {
  locale: Locale;
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
