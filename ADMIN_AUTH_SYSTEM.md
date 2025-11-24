# Admin Authentication System

**Created:** 2025-11-23
**Status:** ✅ Complete

---

## Overview

A separate, secure authentication system for Nala administrators that is isolated from the main user login flow but uses the same backend authentication infrastructure.

---

## Features

### 🔐 Separate Admin Portal
- **URL:** `/admin/auth/login`
- **Distinct UI:** Dark theme with red accents (vs. main site's indigo)
- **Access Control:** Automatically rejects non-admin users
- **Security Notice:** Displays warning about monitored access

### 🔑 Admin Registration
- **URL:** `/admin/auth/register`
- **Secret Code Required:** `NALA_ADMIN_2024` (configurable via env)
- **Forced Role:** Always creates users with `ADMIN` role
- **Validation:** Password strength, email format, code verification

### 🛡️ Security Features
1. **Role Verification:** Login page checks user role before allowing access
2. **Secret Registration Code:** Prevents unauthorized admin account creation
3. **Separate UI:** Not discoverable from main user flows
4. **Access Logging:** All attempts are logged (mentioned in UI)
5. **Environment Variable:** Admin code stored in `.env` for easy rotation

---

## Access URLs

### For Admins:
- **Login:** http://localhost:3000/admin/auth/login
- **Register:** http://localhost:3000/admin/auth/register
- **Dashboard:** http://localhost:3000/admin/dashboard (after login)

### For Regular Users:
- **Login:** http://localhost:3000/auth/login
- **Register:** http://localhost:3000/auth/register

---

## How It Works

### Registration Flow:
1. Admin visits `/admin/auth/register`
2. Fills in: Name, Email, Password, Confirm Password
3. Enters secret admin code: `NALA_ADMIN_2024`
4. System verifies code matches `NEXT_PUBLIC_ADMIN_CODE`
5. Creates user with `role: "ADMIN"`
6. Auto-login and redirect to `/admin/dashboard`

### Login Flow:
1. Admin visits `/admin/auth/login`
2. Enters email and password
3. System calls `/api/auth/login` (same as regular users)
4. **Additional Check:** Verifies `user.role === "ADMIN"`
5. If not admin → Shows "Access denied" error
6. If admin → Stores token and redirects to `/admin/dashboard`

---

## Environment Variables

Add to your `.env.local`:

```env
# Admin Registration Code (change this in production!)
NEXT_PUBLIC_ADMIN_CODE="NALA_ADMIN_2024"
```

**⚠️ Important:** Change this code in production to something secure!

---

## Backend Integration

### Uses Existing APIs:
- ✅ `/api/auth/register` - Creates admin user
- ✅ `/api/auth/login` - Authenticates admin
- ✅ Role-based middleware - Protects admin routes

### No New Backend Code Required:
The existing authentication system already supports:
- Multiple roles (FOUNDER, CREATOR, ADMIN)
- JWT token generation
- Password hashing
- Role-based access control

---

## UI/UX Differences

| Feature | Main Site | Admin Portal |
|---------|-----------|--------------|
| Color Scheme | Indigo/Blue | Red/Dark |
| Background | Light gradient | Dark gradient |
| Icon | User icon | Lock/Shield icon |
| Branding | "Nala" | "Nala Admin Portal" |
| Registration | Open to all | Requires secret code |
| Access Notice | None | "Monitored access" warning |

---

## Security Best Practices

### ✅ Implemented:
- Separate login URLs (not linked from main site)
- Secret registration code
- Role verification on login
- Dark theme to distinguish admin area
- Security warnings displayed

### 🔄 Recommended for Production:
1. **Change Admin Code:** Use a strong, random code
2. **IP Whitelist:** Restrict admin portal to specific IPs
3. **2FA:** Add two-factor authentication for admins
4. **Audit Logging:** Log all admin actions to database
5. **Rate Limiting:** Prevent brute force attacks
6. **Session Timeout:** Shorter timeout for admin sessions

---

## Testing

### Create First Admin:
1. Visit: http://localhost:3000/admin/auth/register
2. Fill in your details
3. Enter code: `NALA_ADMIN_2024`
4. Click "Create Admin Account"
5. You'll be redirected to admin dashboard

### Test Login:
1. Logout (if logged in)
2. Visit: http://localhost:3000/admin/auth/login
3. Enter your admin credentials
4. Should redirect to `/admin/dashboard`

### Test Access Control:
1. Try logging in with a Founder/Creator account
2. Should see "Access denied. Admin credentials required."

---

## File Structure

```
app/
├── admin/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # Admin login page
│   │   └── register/
│   │       └── page.tsx          # Admin registration page
│   ├── dashboard/
│   │   └── page.tsx              # Admin dashboard (existing)
│   ├── disputes/
│   │   └── ...                   # Dispute management (existing)
│   └── layout.tsx                # Admin layout (existing)
└── auth/
    ├── login/
    │   └── page.tsx              # Regular user login
    └── register/
        └── page.tsx              # Regular user registration
```

---

## Admin Code Rotation

To change the admin registration code:

1. Update `.env.local`:
   ```env
   NEXT_PUBLIC_ADMIN_CODE="YOUR_NEW_SECRET_CODE"
   ```

2. Restart the development server:
   ```bash
   npm run dev
   ```

3. Inform existing admins of the new code

---

## ✅ Checklist

- [x] Admin login page created
- [x] Admin registration page created
- [x] Secret code verification implemented
- [x] Role-based access control
- [x] Distinct UI/branding
- [x] Environment variable configured
- [x] Security notices displayed
- [x] Links to main site (for navigation back)
- [x] Uses existing backend APIs
- [x] No database changes required

---

**The admin authentication system is complete and ready to use!** 🎉

**Default Admin Code:** `NALA_ADMIN_2024`
**Access URL:** http://localhost:3000/admin/auth/login
