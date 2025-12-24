# 🔐 Admin Setup - Quick Start

## 🚀 Quick Setup (5 minutes)

### Step 1: Run SQL Script in Supabase
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy all content from `admin-setup.sql` file
6. Paste into SQL Editor
7. Click **RUN** (or press `Cmd+Enter`)
8. ✅ You should see: **Success. No rows returned**

### Step 2: Test Admin Login
1. Open your app: http://localhost:8000
2. Click **Admin** in bottom navigation
3. Login with:
   - **Username:** `admin`
   - **Password:** `bible2026`
4. ✅ You should see the Admin Panel

---

## 👥 Default Admin Accounts

| Username | Password | Email |
|----------|----------|-------|
| `admin` | `bible2026` | admin@biblereading.com |
| `jebastin` | `admin123` | jebastin@biblereading.com |

---

## 🔧 Common Tasks

### Add a New Admin
Run in Supabase SQL Editor:
```sql
SELECT add_admin('username', 'password', 'email@example.com');
```

### Change Admin Password
```sql
UPDATE admins 
SET password_hash = crypt('new_password', gen_salt('bf'))
WHERE username = 'admin';
```

### List All Admins
```sql
SELECT id, username, email, active, created_at FROM admins;
```

### Disable an Admin (without deleting)
```sql
UPDATE admins SET active = FALSE WHERE username = 'admin';
```

### Re-enable an Admin
```sql
UPDATE admins SET active = TRUE WHERE username = 'admin';
```

### Delete an Admin
```sql
DELETE FROM admins WHERE username = 'old_admin';
```

---

## 🔒 Security Features

✅ **Passwords are hashed** using bcrypt (via PostgreSQL's `crypt()`)  
✅ **No plain-text passwords** stored in database  
✅ **Server-side verification** - password never sent to browser  
✅ **Session-based** - cleared when browser closes  
✅ **Row Level Security (RLS)** enabled on all tables  

---

## 🐛 Troubleshooting

### ❌ Error: "function crypt() does not exist"
**Solution:**
1. Go to Supabase → Database → Extensions
2. Search for `pgcrypto`
3. Click **Enable**
4. Re-run the SQL script

### ❌ Error: "relation admins does not exist"
**Solution:** Run the `admin-setup.sql` script

### ❌ Login button stuck on "Verifying..."
**Solution:**
1. Open browser console (F12)
2. Check for error messages
3. Verify Supabase credentials in `data-supabase.js`
4. Make sure you ran the SQL script

### ❌ "Invalid username or password" but credentials are correct
**Solution:**
1. Check if admin is active: `SELECT * FROM admins WHERE username = 'admin';`
2. Verify the `verify_admin` function exists: `\df verify_admin` or check Functions in Supabase
3. Re-insert the admin: Run the INSERT statement from `admin-setup.sql`

---

## 📚 What Changed?

### Before (Insecure)
- ❌ Password hardcoded in JavaScript: `ADMIN_PASSWORD = 'bible2026'`
- ❌ Anyone can view source code and see password
- ❌ Only one password for all admins
- ❌ No user tracking

### After (Secure)
- ✅ Multiple admin accounts with unique usernames
- ✅ Passwords hashed with bcrypt in database
- ✅ Server-side verification via Supabase function
- ✅ No passwords visible in code
- ✅ Track who logged in (username stored in session)

---

## 📝 File Updates

Files that were updated:
- ✅ `data-supabase.js` - Added `verifyAdmin()` function
- ✅ `admin.js` - Updated login logic to use Supabase
- ✅ `admin.html` - Added username input field
- ✅ `styles.css` - Added styling for login hint
- ✅ `admin-setup.sql` - New SQL script to create admin system
- ✅ `ADMIN_SETUP.md` - Detailed documentation
- ✅ `ADMIN_QUICKSTART.md` - This quick reference guide

---

## ✨ Next Steps

1. ✅ Run `admin-setup.sql` in Supabase
2. ✅ Test login with default credentials
3. 🔒 Change the default passwords
4. 👤 Add your own admin accounts
5. 🗑️ (Optional) Remove default accounts you don't need

---

Need help? Open browser console (F12) to see detailed error messages!
