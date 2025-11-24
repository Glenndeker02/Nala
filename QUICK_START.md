# 🚀 IMMEDIATE NEXT STEPS

## Step 1: Create `.env.local` File

**Option A - Manual:**
1. Create a new file named `.env.local` in the root directory
2. Copy all content from `.env.example`
3. Replace `[YOUR-PASSWORD]` with your Supabase database password

**Option B - Command Line:**
```powershell
Copy-Item .env.example .env.local
# Then edit .env.local and replace [YOUR-PASSWORD]
```

---

## Step 2: Get Your Supabase Password

1. Go to: https://supabase.com/dashboard/project/rqxcrkoucousopfkhhas/settings/database
2. Scroll to "Database Password"
3. Click "Reset Database Password" if needed
4. Copy the password

---

## Step 3: Update `.env.local`

Find these two lines in `.env.local`:

```env
DATABASE_URL="postgresql://postgres.rqxcrkoucousopfkhhas:[YOUR-PASSWORD]@..."
DIRECT_URL="postgresql://postgres.rqxcrkoucousopfkhhas:[YOUR-PASSWORD]@..."
```

Replace `[YOUR-PASSWORD]` (including the brackets!) with your actual password.

**Example:**
If your password is `MySecurePass123`, change:
```env
# FROM:
DATABASE_URL="postgresql://postgres.rqxcrkoucousopfkhhas:[YOUR-PASSWORD]@..."

# TO:
DATABASE_URL="postgresql://postgres.rqxcrkoucousopfkhhas:MySecurePass123@..."
```

---

## Step 4: Push Database Schema

Run this command to create all tables in Supabase:

```powershell
npx prisma db push
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Database synchronized with Prisma schema
```

---

## Step 5: Restart Development Server

1. Stop the current server (press `Ctrl+C` in the terminal)
2. Start it again:
```powershell
npm run dev
```

---

## Step 6: Test the Platform

1. Open http://localhost:3000/auth/register
2. Create a **Founder** account
3. Login and create a campaign
4. Logout and create a **Creator** account
5. Browse briefs and apply

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Registration creates a user in Supabase
- ✅ Login redirects to the correct dashboard
- ✅ Campaigns appear in the database
- ✅ No database connection errors in console

---

## 🆘 Quick Fixes

**Error: "Can't reach database server"**
→ Check your password in `.env.local`

**Error: "Environment variable not found"**
→ Make sure `.env.local` exists and is in the root directory

**Error: "Migration failed"**
→ Use `npx prisma db push` (not `migrate dev`)

---

## 📊 Verify in Supabase Dashboard

After registration, check:
1. Go to https://supabase.com/dashboard/project/rqxcrkoucousopfkhhas/editor
2. Click on "users" table
3. You should see your registered user!

---

**Total Time:** ~5 minutes
**Difficulty:** Easy
**Reward:** Fully functional Nala platform! 🎉
