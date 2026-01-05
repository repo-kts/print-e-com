# Netlify Deployment Guide

Step-by-step guide to deploy your backend API to Netlify.

## Prerequisites

- Netlify account (sign up at https://app.netlify.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- PostgreSQL database URL
- API keys (Razorpay, Supabase, etc.)

## Pre-Deployment Checklist

✅ Netlify function handler configured (`apps/api/netlify/functions/api.ts`)
✅ `serverless-http` dependency added
✅ `netlify.toml` configured with redirects
✅ Environment variables documented

## Step 1: Commit Your Changes

```bash
git add .
git commit -m "Configure Netlify deployment"
git push
```

## Step 2: Connect Repository to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository: `print-e-com` 
5. Click **"Next"**

## Step 3: Configure Build Settings

### Option A: Using Bun (Recommended if Bun plugin available)

**Build command:**
```bash
cd apps/api && bun run db:generate && bun run build
```

**Publish directory:**
```
apps/api/dist
```

**Functions directory:**
```
apps/api/netlify/functions
```

**To enable Bun on Netlify:**
- Install Netlify Build Plugin: `netlify-plugin-bun` (if available)
- Or use a custom build image with Bun pre-installed

### Option B: Using Node.js (Fallback)

Since Netlify uses Node.js by default, you may need to adapt:

**Build command:**
```bash
cd apps/api && npm install -g prisma && npx prisma generate --schema=apps/api/prisma/schema.prisma
```

**Note:** The build step is mainly for generating Prisma Client. Netlify will bundle your function using esbuild.

**Publish directory:**
```
apps/api/dist
```

**Functions directory:**
```
apps/api/netlify/functions
```

## Step 4: Set Environment Variables

In Netlify Dashboard → **Site settings** → **Environment variables**, add:

### Required Environment Variables

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secure-random-secret-key
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

### Razorpay Configuration

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret
```

### Supabase Configuration (Recommended)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### CORS Configuration

```env
CORS_ORIGINS=https://your-frontend-domain.com,https://another-domain.com
```

**Important:** Add your Netlify API URL to CORS_ORIGINS after deployment:
```
https://your-site-name.netlify.app
```

### Optional Variables

```env
APP_URL=https://your-site-name.netlify.app
PORT=3002
NODE_ENV=production
```

## Step 5: Deploy

1. Click **"Deploy site"** in Netlify Dashboard
2. Wait for the build to complete (check logs for errors)
3. Once deployed, you'll get a URL like: `https://your-site-name.netlify.app`

## Step 6: Update CORS After Deployment

1. Copy your Netlify site URL (e.g., `https://your-site-name.netlify.app`)
2. Go to **Site settings** → **Environment variables**
3. Update `CORS_ORIGINS` to include your Netlify URL and frontend URL:
   ```
   https://your-site-name.netlify.app,https://your-frontend-domain.com
   ```
4. Trigger a new deploy (or wait for next deployment)

## Step 7: Test Your API

Your API will be available at:

- **Root:** `https://your-site-name.netlify.app/`
- **Health check:** `https://your-site-name.netlify.app/health`
- **API routes:** `https://your-site-name.netlify.app/api/v1/*`
- **Docs:** `https://your-site-name.netlify.app/api/docs`
- **Playground:** `https://your-site-name.netlify.app/api/playground`

### Test Commands

```bash
# Health check
curl https://your-site-name.netlify.app/health

# Get products
curl https://your-site-name.netlify.app/api/v1/products

# Admin login
curl -X POST https://your-site-name.netlify.app/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Step 8: Configure Razorpay Webhook

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-site-name.netlify.app/api/webhooks/razorpay`
3. Select events you want to listen to (e.g., `payment.captured`, `payment.failed`)
4. Copy the webhook secret and add it to Netlify environment variables as `RAZORPAY_WEBHOOK_SECRET`

## Troubleshooting

### Build Fails with "bun: command not found"

**Solution:** Use Node.js build command instead (Option B in Step 3), or install Bun build plugin.

### Function Times Out

- Netlify Functions have a 10-second timeout on free tier (26 seconds on Pro)
- Optimize database queries
- Consider using Netlify Pro for longer timeouts

### Database Connection Errors

- Verify `DATABASE_URL` is correct
- Ensure database allows connections from Netlify IPs
- Check database firewall settings

### CORS Errors

- Verify `CORS_ORIGINS` includes your frontend domain
- Include your Netlify API URL in `CORS_ORIGINS`
- Check browser console for specific CORS errors

### Prisma Client Not Found

- Ensure `db:generate` runs during build
- Check that `generated/prisma/client` is included in `included_files`
- Verify Prisma schema is correct

### Function Returns 404

- Verify function handler is at `apps/api/netlify/functions/api.ts`
- Check `netlify.toml` has correct `functions` directory path
- Ensure redirects are configured in `netlify.toml`

## File Structure Reference

```
print-e-com/
├── netlify.toml                    # Netlify configuration (root)
├── apps/
│   └── api/
│       ├── netlify/
│       │   └── functions/
│       │       └── api.ts          # Netlify function handler
│       ├── src/
│       │   └── index.ts            # Express app
│       ├── prisma/
│       │   └── schema.prisma       # Prisma schema
│       └── package.json
```

## Next Steps

1. ✅ Set up CI/CD (auto-deploy on git push)
2. ✅ Configure custom domain (optional)
3. ✅ Set up monitoring and logging
4. ✅ Configure backup strategies for database
5. ✅ Update frontend API URL to point to Netlify

## Support

- Netlify Docs: https://docs.netlify.com/
- Functions Docs: https://docs.netlify.com/functions/overview/
- Serverless HTTP: https://github.com/dougmoscrop/serverless-http

