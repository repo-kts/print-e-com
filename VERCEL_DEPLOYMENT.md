# Vercel Deployment Guide

This guide will help you deploy both the frontend (Next.js) and backend (Express API) to Vercel.

## Overview

- **Frontend (`apps/web`)**: Next.js app - Native Vercel support ✅
- **Backend (`apps/api`)**: Express.js API - Deployed as serverless functions ✅

## Prerequisites

1. A Vercel account ([sign up here](https://vercel.com/signup))
2. Vercel CLI (use `npx vercel` - no installation needed, or install globally if preferred)
3. PostgreSQL database (for production)
   - Recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Supabase](https://supabase.com), or [Neon](https://neon.tech)

### Installing Vercel CLI (Optional)

You have three options:

**Option A: Use npx (Recommended - No installation needed)**
```bash
npx vercel
```

**Option B: Install globally with sudo (macOS/Linux)**
```bash
sudo npm i -g vercel
```

**Option C: Install globally without sudo (Recommended)**
Configure npm to use a directory in your home folder:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
npm i -g vercel
```

## Deployment Options

### Option 1: Deploy as Separate Projects (Recommended)

This is the recommended approach for monorepos. Deploy the frontend and backend as separate Vercel projects.

#### Deploy Frontend (Next.js)

1. **Navigate to the web app directory:**
   ```bash
   cd apps/web
   ```

2. **Link to Vercel:**
   ```bash
   npx vercel link
   ```
   (Or use `vercel link` if you installed globally)

3. **Deploy:**
   ```bash
   npx vercel --prod
   ```
   (Or use `vercel --prod` if you installed globally)

   Or use the Vercel dashboard:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Set **Root Directory** to `apps/web`
   - Vercel will auto-detect Next.js

#### Deploy Backend (Express API)

1. **Navigate to the API directory:**
   ```bash
   cd apps/api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Link to Vercel:**
   ```bash
   npx vercel link
   ```
   (Or use `vercel link` if you installed globally)

4. **Deploy:**
   ```bash
   npx vercel --prod
   ```
   (Or use `vercel --prod` if you installed globally)

   Or use the Vercel dashboard:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Set **Root Directory** to `apps/api`
   - Framework Preset: **Other**

### Option 2: Deploy from Monorepo Root

You can also deploy from the root, but you'll need to configure the root directory in Vercel settings.

## Environment Variables

### Frontend Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

```env
# API endpoint (your backend URL)
NEXT_PUBLIC_API_URL=https://your-api.vercel.app

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# JWT
JWT_SECRET=your_jwt_secret_key

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Supabase (if using)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CORS Origins (comma-separated)
CORS_ORIGINS=https://your-frontend.vercel.app,https://your-frontend-domain.com

# Node Environment
NODE_ENV=production
```

## Database Setup

### Using Vercel Postgres

1. In your Vercel project dashboard, go to **Storage** → **Create Database** → **Postgres**
2. Copy the connection string
3. Add it as `DATABASE_URL` in environment variables
4. Run migrations:
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```

### Using External PostgreSQL

1. Get your database connection string
2. **Important**: For serverless, use a connection pooler URL (not direct connection)
   - Example: `postgresql://user:pass@host/db?pgbouncer=true&connection_limit=1`
3. Add as `DATABASE_URL` in environment variables

### Running Migrations

After setting up the database, run migrations:

```bash
cd apps/api
npx prisma migrate deploy
npx prisma generate
```

Or use Vercel's build command to auto-generate Prisma client.

## Build Configuration

### Frontend Build

The `apps/web/vercel.json` is already configured. Vercel will:
- Auto-detect Next.js
- Run `npm run build`
- Deploy to `.next` directory

### Backend Build

The `apps/api/vercel.json` is configured to:
- Generate Prisma client during build using `build:vercel` script
- Deploy the Express app as serverless functions

**Important**: The build command automatically runs `npx prisma generate` to create the Prisma client. This is handled by the `build:vercel` script in `package.json`.

## Post-Deployment Steps

### 1. Update CORS Origins

After deploying the frontend, update the backend's `CORS_ORIGINS` environment variable with the frontend URL:

```env
CORS_ORIGINS=https://your-frontend.vercel.app
```

### 2. Update Frontend API URL

Update the frontend's `NEXT_PUBLIC_API_URL` environment variable with the backend URL:

```env
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
```

### 3. Test the Deployment

- Frontend: Visit `https://your-frontend.vercel.app`
- Backend Health: Visit `https://your-api.vercel.app/health`
- API Docs: Visit `https://your-api.vercel.app/api/docs`

## Troubleshooting

### Backend Issues

1. **"Cannot find module" errors:**
   - Ensure all dependencies are in `package.json`
   - Check that `@vercel/node` is installed

2. **Database connection errors:**
   - Verify `DATABASE_URL` is set correctly
   - Ensure you're using a connection pooler URL for serverless
   - Check database firewall allows Vercel IPs

3. **Prisma client not found:**
   - The `build:vercel` script should automatically generate it
   - Verify `prisma` is in `devDependencies` in `package.json`
   - Check build logs to ensure `npx prisma generate` runs successfully

### Frontend Issues

1. **API calls failing:**
   - Check `NEXT_PUBLIC_API_URL` is set correctly
   - Verify CORS is configured on backend
   - Check browser console for errors

2. **Build errors:**
   - Ensure all environment variables are set
   - Check for TypeScript errors: `npm run check-types`

## Monorepo Considerations

Since this is a monorepo, you have a few options:

1. **Separate Projects (Recommended)**: Deploy `apps/web` and `apps/api` as separate Vercel projects
2. **Single Project**: Deploy from root and configure routes in `vercel.json`

For separate projects, Vercel will:
- Only install dependencies for the specific app
- Build only the relevant app
- Deploy independently

## Continuous Deployment

Vercel automatically deploys on:
- Push to main/master branch → Production
- Push to other branches → Preview deployments
- Pull requests → Preview deployments

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Serverless Functions](https://vercel.com/docs/functions)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## Notes

- The backend uses connection pooling for Prisma to work efficiently in serverless environments
- File uploads using Multer may need adjustment for serverless (consider using S3 or similar)
- Webhooks (Razorpay) should use the production backend URL
- Consider using Vercel's Edge Config or KV for caching if needed

