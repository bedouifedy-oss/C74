// Production-ready database configuration
// This file contains the database setup and security configurations
// For production, you would install and configure the actual database packages

// Environment variables (to be set in .env.local)
export const DB_CONFIG = {
  // PostgreSQL configuration
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'c74_marketplace',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  
  // CORS
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
};

// Database schema (for reference)
export const SCHEMA = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'worker')),
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      avatar_url VARCHAR(500),
      bio TEXT,
      hourly_rate DECIMAL(10,2),
      years_of_experience INTEGER,
      verification_status VARCHAR(20) DEFAULT 'pending',
      rating DECIMAL(3,2) DEFAULT 0,
      completed_jobs INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  jobs: `
    CREATE TABLE IF NOT EXISTS jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      location VARCHAR(255) NOT NULL,
      budget DECIMAL(10,2) NOT NULL,
      customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
      applicant_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  applications: `
    CREATE TABLE IF NOT EXISTS applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
      worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
      customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      proposed_budget DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(job_id, worker_id)
    );
  `,
  
  reviews: `
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
      worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
      customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review TEXT NOT NULL,
      communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
      punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
      quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
      helpful_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(job_id, customer_id)
    );
  `,
  
  messages: `
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id VARCHAR(255) NOT NULL,
      sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
      receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      type VARCHAR(20) DEFAULT 'text',
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  notifications: `
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      data JSONB,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
};

// Validation functions
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  phone: (phone: string): boolean => {
    const phoneRegex = /^\+216\d{8}$/;
    return phoneRegex.test(phone);
  },
  
  budget: (budget: number): boolean => {
    return budget > 0 && budget <= 10000; // Max 10,000 TND
  },
  
  rating: (rating: number): boolean => {
    return rating >= 1 && rating <= 5;
  },
  
  password: (password: string): boolean => {
    return password.length >= 8;
  },
  
  name: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 255;
  },
};

// Sanitization functions
export const sanitizers = {
  input: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },
  
  html: (input: string): string => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },
  
  sql: (input: string): string => {
    return input.replace(/['"\\;]/g, '');
  },
};

// Security configurations
export const security = {
  // Password hashing (in production, use bcrypt)
  hashPassword: async (password: string): Promise<string> => {
    // For demo purposes only - use bcrypt in production
    return `hashed_${password}`;
  },
  
  comparePassword: async (password: string, hash: string): Promise<boolean> => {
    // For demo purposes only - use bcrypt in production
    return hash === `hashed_${password}`;
  },
  
  // JWT token generation (in production, use jsonwebtoken)
  generateToken: (payload: any): string => {
    // For demo purposes only - use proper JWT in production
    return btoa(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  },
  
  verifyToken: (token: string): any => {
    // For demo purposes only - use proper JWT verification in production
    try {
      return JSON.parse(atob(token));
    } catch {
      throw new Error('Invalid token');
    }
  },
  
  // Rate limiting
  rateLimitStore: new Map<string, { count: number; resetTime: number }>(),
  
  rateLimit: (identifier: string, limit: number = DB_CONFIG.rateLimitMax, windowMs: number = DB_CONFIG.rateLimitWindowMs): boolean => {
    const now = Date.now();
    const record = security.rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
      security.rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  },
};

// Error classes
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Response helpers
export const responses = {
  success: (data: any, message?: string) => ({
    success: true,
    data,
    message: message || 'Operation successful'
  }),
  
  error: (message: string, status: number = 400, details?: any) => ({
    success: false,
    error: message,
    details
  }),
  
  validationError: (errors: any) => ({
    success: false,
    error: 'Validation failed',
    errors
  }),
  
  unauthorized: () => ({
    success: false,
    error: 'Unauthorized'
  }),
  
  forbidden: () => ({
    success: false,
    error: 'Forbidden'
  }),
  
  notFound: () => ({
    success: false,
    error: 'Resource not found'
  }),
  
  serverError: (message?: string) => ({
    success: false,
    error: message || 'Internal server error'
  }),
};

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'default-src \'self\'',
};

// Environment validation
export const validateEnvironment = () => {
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Export configuration
export const config = {
  database: DB_CONFIG,
  schema: SCHEMA,
  validators,
  sanitizers,
  security,
  errors: { ValidationError, DatabaseError, AuthenticationError },
  responses,
  securityHeaders,
  validateEnvironment,
};
