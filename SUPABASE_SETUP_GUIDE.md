# Supabase Database Setup Guide

**Date:** 2025-11-23
**Database:** Supabase PostgreSQL

---

## 🎯 Quick Setup Steps

### 1. Create `.env.local` File

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

### 2. Get Your Supabase Password

1. Go to your Supabase project: https://supabase.com/dashboard/project/rqxcrkoucousopfkhhas
2. Navigate to **Settings** → **Database**
3. Find your database password (or reset it if needed)
4. Copy the password

### 3. Update `.env.local`

Replace `[YOUR-PASSWORD]` in both `DATABASE_URL` and `DIRECT_URL` with your actual Supabase password:

```env
DATABASE_URL="postgresql://postgres.rqxcrkoucousopfkhhas:YOUR_ACTUAL_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.rqxcrkoucousopfkhhas:YOUR_ACTUAL_PASSWORD@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"
```

**⚠️ Important:** Remove the square brackets `[` and `]` when replacing the password!

### 4. Push Database Schema

Run the following command to create all tables in Supabase:

```bash
npx prisma db push
```

This will:
- Connect to your Supabase database
- Create all 20+ tables
- Set up all relations and indexes
- Validate the schema

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Verify Connection

Test the database connection:

```bash
npx prisma studio
```

This will open Prisma Studio in your browser where you can view and edit data.

---

## 📋 What's Already Configured

✅ **Supabase Project ID:** `rqxcrkoucousopfkhhas`
✅ **Supabase URL:** `https://rqxcrkoucousopfkhhas.supabase.co`
✅ **Anon Key:** Already set in `.env.example`
✅ **Connection Pooling:** Configured (port 6543)
✅ **Direct Connection:** Configured (port 5432)
✅ **Prisma Schema:** Updated with `directUrl` support

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"
- ✅ Check that your password is correct
- ✅ Ensure no spaces or special characters are improperly escaped
- ✅ Verify your Supabase project is active

### Error: "Connection pool timeout"
- ✅ Check Supabase dashboard for connection limits
- ✅ Ensure you're using the pooler URL (port 6543) for `DATABASE_URL`

### Error: "Migration failed"
- ✅ Use `npx prisma db push` instead of `npx prisma migrate dev` for Supabase
- ✅ Ensure `DIRECT_URL` is set correctly (port 5432)

---

## 📊 Database Schema Overview

Once pushed, your Supabase database will have:

### Core Tables
- `users` - User accounts (Founder, Creator, Admin)
- `creator_profiles` - Creator-specific data
- `campaigns` - Campaign information
- `videos` - Video submissions and tracking
- `applications` - Creator applications to campaigns

### Feature Tables
- `notifications` - In-app notifications
- `disputes` - Dispute resolution system
- `social_connections` - OAuth tokens
- `social_accounts` - Connected social media accounts
- `scheduled_posts` - Automated posting queue

### Tracking Tables
- `view_snapshots` - Historical view count data
- `payments` - Payment records
- `licenses` - Content licensing
- `revisions` - Video revision requests

### Supporting Tables
- `verification_tokens` - Email verification
- And more...

**Total:** 20+ tables with full relations

---

## 🚀 Next Steps After Setup

1. **Restart Development Server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Test User Registration:**
   - Go to http://localhost:3000/auth/register
   - Create a Founder account
   - Create a Creator account

3. **Verify Data in Supabase:**
   - Open Supabase dashboard
   - Go to Table Editor
   - Check that users were created

4. **Test Full Flow:**
   - Login as Founder
   - Create a campaign
   - Login as Creator
   - Apply to campaign
   - Check notifications

---

## 🔐 Security Notes

- ✅ `.env.local` is in `.gitignore` (never commit it!)
- ✅ Use environment variables for all secrets
- ✅ Supabase provides automatic SSL encryption
- ✅ Connection pooling is enabled for performance

---

## 📞 Support

If you encounter issues:

1. **Check Supabase Logs:**
   - Dashboard → Logs → Database

2. **Check Prisma Logs:**
   - Add `DEBUG=*` to your command:
   ```bash
   DEBUG=* npx prisma db push
   ```

3. **Verify Environment Variables:**
   ```bash
   # In PowerShell
   Get-Content .env.local
   ```

---

## ✅ Checklist

- [ ] Created `.env.local` from `.env.example`
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] Ran `npx prisma db push` successfully
- [ ] Ran `npx prisma generate` successfully
- [ ] Verified connection with `npx prisma studio`
- [ ] Restarted development server
- [ ] Tested user registration
- [ ] Confirmed data appears in Supabase dashboard

---

**Once complete, your Nala platform will be fully connected to Supabase and ready for production use!** 🎉
