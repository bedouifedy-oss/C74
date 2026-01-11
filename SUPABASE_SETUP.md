# Supabase Setup Guide for C74

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys from Settings > API

## 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Update these values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. Run Database Migrations

Go to your Supabase Dashboard > SQL Editor and run the migration files in order:

1. `supabase/migrations/001_initial_schema.sql` - Creates all tables
2. `supabase/migrations/002_storage_buckets.sql` - Sets up storage policies

## 4. Create Storage Buckets

In Supabase Dashboard > Storage, create these buckets:

| Bucket Name | Public |
|------------|--------|
| `avatars` | ✅ Yes |
| `job-photos` | ✅ Yes |
| `documents` | ❌ No |
| `payment-proofs` | ❌ No |
| `completion-photos` | ✅ Yes |

## 5. Configure SMS (Optional)

### Option A: Twilio (Recommended for production)

1. Create a Twilio account at [twilio.com](https://twilio.com)
2. Get your Account SID, Auth Token, and a phone number
3. Add to `.env.local`:

```env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Option B: Development Mode

In development, SMS messages are logged to the console instead of sent.
Use OTP code `123456` for testing.

## 6. Test the Setup

1. Start the development server:
```bash
npm run dev
```

2. Test signup flow:
   - Go to `/en/signup`
   - Enter a phone number (+216XXXXXXXX)
   - Check console for OTP (dev mode) or your phone (production)
   - Use `123456` as OTP for testing

3. Verify database:
   - Check Supabase Dashboard > Table Editor
   - You should see a new user in the `users` table

## 7. Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure real Twilio credentials
- [ ] Enable Row Level Security (RLS) policies
- [ ] Set up Supabase Auth for proper JWT handling
- [ ] Configure custom domain (optional)
- [ ] Set up database backups

## Database Schema Overview

```
users
  ├── workers (1:1)
  │     ├── worker_documents (1:N)
  │     ├── availability (1:N)
  │     └── fees (1:N)
  └── jobs (1:N as customer)
        ├── job_photos (1:N)
        ├── price_negotiations (1:N)
        ├── messages (1:N)
        ├── reviews (1:N)
        ├── guarantee_cases (1:1)
        └── disputes (1:1)
```

## API Endpoints Using Database

| Endpoint | Database Tables |
|----------|----------------|
| `POST /api/auth/signup` | users |
| `POST /api/auth/verify-otp` | users |
| `GET /api/jobs` | jobs, users, workers |
| `POST /api/jobs` | jobs |
| `GET /api/workers` | workers, users |
| `GET /api/fees` | fees, workers |
| `GET /api/messages` | messages |
| `POST /api/reviews` | reviews |

## Troubleshooting

### "Supabase environment variables not set"
- Make sure `.env.local` exists and has the correct values
- Restart the dev server after changing env vars

### "Failed to create user"
- Check if the `users` table exists in Supabase
- Verify your service role key has write permissions

### "RLS policy violation"
- Make sure you're authenticated
- Check the RLS policies in `002_storage_buckets.sql`

## Support

For issues with this setup, check:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
