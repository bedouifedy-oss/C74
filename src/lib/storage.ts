/**
 * File Storage Service
 * Upload files to Supabase Storage
 */

import { supabase } from './supabase';

// Storage bucket names
export const BUCKETS = {
  AVATARS: 'avatars',
  JOB_PHOTOS: 'job-photos',
  DOCUMENTS: 'documents',
  PAYMENT_PROOFS: 'payment-proofs',
  COMPLETION_PHOTOS: 'completion-photos',
} as const;

type BucketName = typeof BUCKETS[keyof typeof BUCKETS];

interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  bucket: BucketName,
  file: File | Blob,
  path: string,
  options?: {
    contentType?: string;
    upsert?: boolean;
  }
): Promise<UploadResult> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        upsert: options?.upsert ?? false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(
  userId: string,
  file: File | Blob
): Promise<UploadResult> {
  const ext = file instanceof File ? file.name.split('.').pop() : 'jpg';
  const path = `${userId}/avatar.${ext}`;
  
  return uploadFile(BUCKETS.AVATARS, file, path, {
    upsert: true,
    contentType: file.type || 'image/jpeg',
  });
}

/**
 * Upload job photo (request or completion)
 */
export async function uploadJobPhoto(
  jobId: string,
  file: File | Blob,
  type: 'request' | 'completion' | 'dispute',
  index: number = 0
): Promise<UploadResult> {
  const ext = file instanceof File ? file.name.split('.').pop() : 'jpg';
  const path = `${jobId}/${type}_${index}_${Date.now()}.${ext}`;
  
  return uploadFile(BUCKETS.JOB_PHOTOS, file, path, {
    contentType: file.type || 'image/jpeg',
  });
}

/**
 * Upload worker document (ID, certificate, etc.)
 */
export async function uploadDocument(
  workerId: string,
  file: File | Blob,
  documentType: 'id_front' | 'id_back' | 'certificate' | 'license'
): Promise<UploadResult> {
  const ext = file instanceof File ? file.name.split('.').pop() : 'jpg';
  const path = `${workerId}/${documentType}_${Date.now()}.${ext}`;
  
  return uploadFile(BUCKETS.DOCUMENTS, file, path, {
    contentType: file.type || 'image/jpeg',
  });
}

/**
 * Upload payment proof
 */
export async function uploadPaymentProof(
  feeId: string,
  workerId: string,
  file: File | Blob
): Promise<UploadResult> {
  const ext = file instanceof File ? file.name.split('.').pop() : 'jpg';
  const path = `${workerId}/${feeId}_${Date.now()}.${ext}`;
  
  return uploadFile(BUCKETS.PAYMENT_PROOFS, file, path, {
    contentType: file.type || 'image/jpeg',
  });
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: BucketName,
  path: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete exception:', error);
    return false;
  }
}

/**
 * Get signed URL for private file access
 */
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Signed URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Signed URL exception:', error);
    return null;
  }
}

/**
 * List files in a directory
 */
export async function listFiles(
  bucket: BucketName,
  path: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);

    if (error) {
      console.error('List files error:', error);
      return [];
    }

    return data.map(file => `${path}/${file.name}`);
  } catch (error) {
    console.error('List files exception:', error);
    return [];
  }
}

/**
 * Helper to convert base64 to Blob
 */
export function base64ToBlob(base64: string, contentType: string = 'image/jpeg'): Blob {
  const byteCharacters = atob(base64.split(',')[1] || base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] } = options;

  // Check file size
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` };
  }

  return { valid: true };
}
