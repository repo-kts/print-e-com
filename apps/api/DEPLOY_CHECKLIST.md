# Vercel Deployment Checklist for Backend

## Current Issues & Fixes

### ✅ What's Already Done:
1. ✅ `vercel.json` configured
2. ✅ `api/index.ts` serverless function wrapper created
3. ✅ All ES module imports fixed (added `.js` extensions)
4. ✅ Prisma connection configured for serverless
5. ✅ `postinstall` script for Prisma generation
6. ✅ `prisma.config.ts` handles missing DATABASE_URL

### ⚠️ What to Check:
1. ⚠️ Vercel Dashboard Build Command might be set incorrectly (should be empty)
2. ⚠️ Vercel Root Directory must be set to `apps/api`
3. ✅ Lock file exists at monorepo root (shared workspace)

---

## Step-by-Step Deployment Guide

### Step 1: Verify Setup
Your monorepo uses workspaces, so the lock file is at the root level. This is correct!
```bash
# Verify lock file exists at root
ls -la package-lock.json  # Should exist
ls -la bun.lock  # Also exists (for local dev)
```

### Step 2: Commit All Changes
```bash
git add .
git commit -m "Configure backend for Vercel deployment"
git push
```

### Step 3: Deploy on Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. **Important Settings:**
   - **Root Directory**: `apps/api`
   - **Framework Preset**: Other
   - **Build Command**: Leave EMPTY or clear it
   - **Install Command**: `npm install`
   - **Output Directory**: Leave empty

### Step 4: Set Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

**Required:**
```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**Optional (if using Supabase):**
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**CORS:**
```
CORS_ORIGINS=https://your-frontend.vercel.app
```

**Important for DATABASE_URL:**
- For serverless, use a connection pooler URL
- Example with Supabase: `?pgbouncer=true&connection_limit=1`
- Example with Neon: The pooled connection URL

### Step 5: Deploy

Click "Deploy" and wait for the build to complete.

---

## Common Errors & Solutions

### Error: "Missing script: db:generate"
**Solution:** Clear the Build Command in Vercel Dashboard
- Settings → General → Build & Development Settings
- **Build Command**: Leave empty
- The `postinstall` script handles Prisma generation

### Error: "Cannot find module"
**Solution:** All imports must have `.js` extensions
- ✅ Already fixed in your codebase

### Error: "DATABASE_URL not found during build"
**Solution:** 
- ✅ Already fixed with fallback in `prisma.config.ts`
- The `postinstall` script uses a dummy URL during build

### Error: Connection pool exhausted
**Solution:** 
- ✅ Already configured with connection pooling in `src/services/prisma.ts`
- Make sure to use a pooled DATABASE_URL

---

## Verify Deployment

After deployment, test these endpoints:

1. **Health Check:**
   ```
   GET https://your-api.vercel.app/health
   ```
   Should return: `{ "status": "ok", "timestamp": "..." }`

2. **Root:**
   ```
   GET https://your-api.vercel.app/
   ```
   Should return API info

3. **API Docs:**
   ```
   GET https://your-api.vercel.app/api/docs
   ```
   Should show Redoc documentation

---

## Database Setup

### Option 1: Vercel Postgres
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Copy the pooled connection string
3. Add as `DATABASE_URL` environment variable
4. Run migrations: `npx prisma migrate deploy`

### Option 2: Supabase
1. Get connection string from Supabase Dashboard
2. Add `?pgbouncer=true` to use connection pooling
3. Use the "Transaction" pooler URL

### Option 3: Neon
1. Get pooled connection string from Neon Dashboard
2. Use the "Pooled connection" string

---

## Post-Deployment

1. Update frontend's `NEXT_PUBLIC_API_URL` with your backend URL
2. Update backend's `CORS_ORIGINS` with your frontend URL
3. Test all API endpoints
4. Run database migrations if needed

---

## Troubleshooting

### Build Logs
Check the build logs in Vercel Dashboard for detailed error messages.

### Runtime Logs
Check the Function Logs in Vercel Dashboard for runtime errors.

### Local Testing
Test the build locally:
```bash
cd apps/api
npm install
npm run build:vercel
```

### Still Having Issues?
1. Check if `package-lock.json` exists in `apps/api`
2. Verify all environment variables are set
3. Ensure Build Command is empty in Vercel settings
4. Check DATABASE_URL uses connection pooling
5. Review the Vercel build and function logs

---

## Summary

Your backend is **READY** for Vercel deployment! All code changes are complete.

**Next Steps:**

1. **Commit your changes:**
```bash
git add .
git commit -m "Configure backend for Vercel serverless deployment"
git push
```

2. **Deploy on Vercel:**
   - Go to Vercel Dashboard
   - Import your repository
   - **Set Root Directory to `apps/api`** (CRITICAL!)
   - Leave Build Command EMPTY
   - Add environment variables (DATABASE_URL, JWT_SECRET, etc.)
   - Deploy!

3. **Most Important Settings:**
   - ✅ Root Directory: `apps/api`
   - ✅ Build Command: (empty)
   - ✅ Install Command: `npm install` (default)
   - ❌ Don't set Output Directory

The monorepo structure is handled automatically by Vercel when you set the Root Directory.

