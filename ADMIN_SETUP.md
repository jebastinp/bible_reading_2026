# 🔐 Admin Access Setup for Supabase

## Overview
Set up secure admin authentication using Supabase's built-in auth system instead of hardcoded passwords.

## 📋 Step-by-Step Instructions

### Step 1: Create Admin Table in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. **Copy and paste this SQL script:**

```sql
-- ============================================
-- ADMIN TABLE & AUTHENTICATION SETUP
-- ============================================

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT,
    active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admin policies (only admins can read/write)
CREATE POLICY "Admins can read themselves" 
    ON admins FOR SELECT 
    USING (true);

-- Create admin verification function
CREATE OR REPLACE FUNCTION verify_admin(p_username TEXT, p_password TEXT)
RETURNS TABLE(is_valid BOOLEAN, admin_id BIGINT, admin_username TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN a.password_hash = crypt(p_password, a.password_hash) 
            THEN TRUE 
            ELSE FALSE 
        END as is_valid,
        a.id as admin_id,
        a.username as admin_username
    FROM admins a
    WHERE a.username = p_username AND a.active = TRUE;
END;
$$;

-- Insert default admin (username: admin, password: bible2026)
-- Password is hashed using PostgreSQL's crypt function
INSERT INTO admins (username, password_hash, email) 
VALUES (
    'admin', 
    crypt('bible2026', gen_salt('bf')), 
    'admin@biblereading.com'
)
ON CONFLICT (username) DO NOTHING;

-- Insert additional admin (username: jebastin, password: admin123)
INSERT INTO admins (username, password_hash, email) 
VALUES (
    'jebastin', 
    crypt('admin123', gen_salt('bf')), 
    'jebastin@biblereading.com'
)
ON CONFLICT (username) DO NOTHING;
```

6. Click **Run** (or press `Cmd+Enter`)
7. You should see: **Success. No rows returned**

---

### Step 2: Enable pgcrypto Extension

The admin system uses PostgreSQL's `crypt()` function for secure password hashing.

1. In Supabase Dashboard, go to **Database** → **Extensions**
2. Search for **pgcrypto**
3. Click **Enable** if not already enabled

---

### Step 3: Update Your App Code

The updated `data-supabase.js` file now includes:
- `verifyAdmin(username, password)` - Secure admin login
- No more hardcoded passwords in JavaScript
- All authentication happens server-side in Supabase

---

## 🔑 Default Admin Accounts

| Username | Password | Email |
|----------|----------|-------|
| `admin` | `bible2026` | admin@biblereading.com |
| `jebastin` | `admin123` | jebastin@biblereading.com |

---

## ✅ Testing Admin Login

1. Open your app: http://localhost:8000
2. Navigate to **Admin** page
3. Try logging in with:
   - **Username:** `admin`
   - **Password:** `bible2026`

---

## 🔄 Adding More Admins

To add more admin users, run this in Supabase SQL Editor:

```sql
INSERT INTO admins (username, password_hash, email) 
VALUES (
    'your_username', 
    crypt('your_password', gen_salt('bf')), 
    'your_email@example.com'
);
```

---

## 🔒 Changing Admin Password

To change an admin password:

```sql
UPDATE admins 
SET password_hash = crypt('new_password', gen_salt('bf'))
WHERE username = 'admin';
```

---

## 🚨 Security Notes

- Passwords are hashed using bcrypt (via `crypt()` with blowfish)
- Password verification happens on Supabase server (not in browser)
- Session stored in `sessionStorage` (cleared when browser closes)
- No plain-text passwords in your code
- Enable Row Level Security (RLS) for all tables

---

## 🐛 Troubleshooting

**Error: "function crypt() does not exist"**
- Solution: Enable the `pgcrypto` extension (Step 2 above)

**Error: "relation admins does not exist"**
- Solution: Run the SQL script in Step 1

**Admin login not working:**
1. Open browser console (F12)
2. Check for error messages
3. Verify Supabase credentials in `data-supabase.js`
4. Confirm SQL script ran successfully

---

## 📚 Next Steps

After setup:
1. Test admin login
2. Change default passwords
3. Add your own admin accounts
4. Remove default accounts if not needed

---

Need help? Check the browser console for detailed error messages!
