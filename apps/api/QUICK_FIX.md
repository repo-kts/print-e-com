# 🚨 Quick Fix: What's Going Wrong

## The Problem

You're getting build errors on Vercel because of **one main issue**:

### ❌ Vercel Dashboard has a Build Command set incorrectly

The error `"Missing script: db:generate"` means Vercel is trying to run a command that doesn't exist in your `package.json` anymore.

## The Solution (5 Minutes)

### 1. Fix Vercel Dashboard Settings

Go to your Vercel project → **Settings** → **General** → **Build & Development Settings**

Change these:

| Setting | Current (Wrong) | Should Be (Correct) |
|---------|----------------|---------------------|
| **Root Directory** | ❌ (empty or `.`) | ✅ `apps/api` |
| **Build Command** | ❌ `npm run db:generate` | ✅ (leave EMPTY) |
| **Install Command** | ✅ `npm install` | ✅ `npm install` |
| **Output Directory** | Leave empty | Leave empty |

### 2. Set Environment Variables

In Vercel → **Settings** → **Environment Variables**, add:

**Minimum Required:**
```
DATABASE_URL=your_database_connection_string_here
JWT_SECRET=your_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Important:** For `DATABASE_URL`, use a **pooled connection** URL for serverless:
- Supabase: Add `?pgbouncer=true`
- Neon: Use the "Pooled connection" string
- Vercel Postgres: Use the default URL

### 3. Redeploy

Click **Deployments** → **Redeploy** (on your latest deployment)

---

## Why It Works Now

1. ✅ **Empty Build Command**: The `postinstall` script in `package.json` automatically runs `prisma generate` after `npm install`. No separate build command needed.

2. ✅ **Root Directory Set**: Vercel needs to know to deploy from `apps/api`, not the monorepo root.

3. ✅ **All Code Fixed**: 
   - ES module imports have `.js` extensions
   - Prisma config handles missing DATABASE_URL during build
   - Serverless function wrapper at `api/index.ts`
   - Connection pooling configured for serverless

---

## After Deployment Success

Test these URLs (replace with your actual Vercel URL):

```bash
# Health check
curl https://your-api.vercel.app/health

# Root
curl https://your-api.vercel.app/

# API docs
open https://your-api.vercel.app/api/docs
```

Expected response from `/health`:
```json
{
  "status": "ok",
  "timestamp": "2026-01-06T..."
}
```

---

## Still Having Issues?

### Error: "Missing script: ..."
**Fix:** Clear the Build Command in Vercel settings (leave it empty)

### Error: "Cannot find module"
**Check:** All your ES module imports should have `.js` extensions
- ✅ Fixed! Including the Prisma client import

### Error: "DATABASE_URL not set"
**Fix:** Add `DATABASE_URL` to environment variables in Vercel

### Error: "Connection pool exhausted"
**Fix:** Use a pooled connection URL for DATABASE_URL

---

## Quick Reference: Your Current Setup

✅ **File Structure:**
```
apps/api/
├── api/
│   └── index.ts          ← Serverless function entry
├── src/
│   ├── index.ts          ← Express app (exported)
│   ├── routes/           ← All have .js imports ✅
│   ├── controllers/      ← All have .js imports ✅
│   └── middleware/       ← All have .js imports ✅
├── prisma/
│   └── schema.prisma
├── prisma.config.ts      ← Has DATABASE_URL fallback ✅
├── package.json          ← Has postinstall script ✅
└── vercel.json           ← Configured for serverless ✅
```

✅ **Scripts in package.json:**
- `postinstall`: Automatically generates Prisma client
- `build:vercel`: Backup option (not used if Build Command is empty)

✅ **vercel.json:**
```json
{
  "buildCommand": "",
  "installCommand": "npm install",
  "rewrites": [{ "source": "/(.*)", "destination": "/api/index" }]
}
```

---

## That's It!

Your backend is fully configured. Just:
1. Clear the Build Command in Vercel Dashboard
2. Set Root Directory to `apps/api`
3. Add environment variables
4. Redeploy

It should work! 🎉

