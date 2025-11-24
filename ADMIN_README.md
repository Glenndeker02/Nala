# 🛡️ Nala Admin Panel Documentation

Welcome to the Nala Admin Panel. This system provides comprehensive tools for managing the Nala platform, including users, campaigns, disputes, and financial analytics.

## 🚀 Getting Started

### 1. Database Setup
Before using the admin panel, ensure your database schema is up to date.
```bash
npx prisma db push
```

### 2. Create Your First Admin
Since admin registration is restricted, you must create the first admin user via the command line.

**Usage:**
```bash
npx ts-node scripts/create-admin.ts <email> <password> "<Full Name>"
```

**Example:**
```bash
npx ts-node scripts/create-admin.ts admin@nala.com securePass123 "Super Admin"
```

### 3. Accessing the Panel
Once created, log in with your credentials at `/login`. You will be automatically redirected to the admin dashboard at:
`http://localhost:3000/admin`

---

## 📦 Features & Modules

### 📊 Dashboard (`/admin`)
- **Real-time Overview**: View live stats for GMV, active campaigns, and user signups.
- **Alerts System**: Immediate notifications for disputes, stalled campaigns, or high-risk activities.
- **Financial Summary**: 30-day revenue and payout tracking.

### 👥 User Management
- **Creators (`/admin/creators`)**:
  - Verify KYC status.
  - View detailed profiles and earnings.
  - Suspend or ban users.
  - Adjust earnings manually.
- **Founders (`/admin/founders`)**:
  - Monitor spending and campaign history.
  - Manage account tiers.

### 📢 Campaign Oversight (`/admin/campaigns`)
- **Monitoring**: Track all campaigns across the platform.
- **Intervention**: Pause, resume, or cancel campaigns.
- **Force Settlement**: Manually complete campaigns and release funds if stuck.

### ⚖️ Dispute Resolution (`/admin/disputes`)
- **Ticket System**: Manage conflicts between creators and founders.
- **Evidence Viewer**: Review uploaded screenshots and videos.
- **Chat Interface**: Communicate directly with involved parties.
- **Resolution**: Issue binding decisions (refunds or payouts).

### 📈 Financial Analytics (`/admin/analytics`)
- **Revenue Breakdown**: Detailed view of platform fees vs. GMV.
- **Top Performers**: Identify your most valuable creators and founders.
- **Trends**: Visual charts for growth tracking.

### ⚙️ System Settings (`/admin/settings`)
- **Team Management**: View other admins and their roles.
- **Audit Logs**: detailed history of every admin action for compliance.
- **Email Broadcasts**: Send mass announcements to all users.

---

## 🔐 Roles & Permissions

The system supports hierarchical admin levels:

1.  **JUNIOR**: Can view data and handle basic support tickets. Cannot ban users or move money.
2.  **SENIOR**: Can verify KYC, resolve disputes, and suspend users.
3.  **MANAGER**: Can manage campaigns and override payments up to a limit.
4.  **DIRECTOR**: Full system access, including banning users and unlimited financial overrides.

---

## 🛠️ Technical Notes

- **Audit Logging**: Every write action (POST/PUT/DELETE) is logged to the `admin_audit_logs` table with IP and User Agent.
- **Security**: All admin routes are protected by `requireRole('ADMIN')` middleware.
- **Performance**: Dashboard metrics are cached for 60 seconds to reduce database load.

---

## 🆘 Support

For technical issues with the admin panel, please refer to `ADMIN_IMPLEMENTATION_PROGRESS.md` to see the development history or contact the engineering team.
