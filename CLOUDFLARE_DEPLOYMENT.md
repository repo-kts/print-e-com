# Cloudflare Workers Deployment Guide

Step-by-step guide to deploy your Express.js backend API to Cloudflare Workers.

## Prerequisites

- Cloudflare account (sign up at https://dash.cloudflare.com/sign-up)
- Node.js 18+ installed (for Wrangler CLI)
- Git repository

## Step 1: Install Wrangler CLI

Wrangler is Cloudflare's command-line tool for managing Workers.

```bash
npm install -g wrangler
# or
bun add -g wrangler
```

Verify installation:
```bash
wrangler --version
```

## Step 2: Login to Cloudflare

Authenticate Wrangler with your Cloudflare account:

```bash
wrangler login
```

This will open a browser window for authentication.

## Step 3: Configure Your Worker

The `wrangler.toml` file is already configured in `apps/api/wrangler.toml`. 

**Optional:** Update the worker name:
```toml
name = "your-custom-worker-name"
```

## Step 4: Set Environment Variables

Cloudflare Workers use secrets and environment variables. Set them using Wrangler:

### Required Environment Variables

```bash
cd apps/api

# Database
wrangler secret put DATABASE_URL

# JWT Secret
wrangler secret put JWT_SECRET

# Razorpay (if using payments)
wrangler secret put RAZORPAY_KEY_ID
wrangler secret put RAZORPAY_KEY_SECRET
wrangler secret put RAZORPAY_WEBHOOK_SECRET

# Supabase (if using)
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# CORS Origins (comma-separated)
wrangler secret put CORS_ORIGINS
```

**Note:** Secrets are encrypted and can only be set via CLI, not in `wrangler.toml`.

### For Staging Environment

```bash
wrangler secret put DATABASE_URL --env staging
wrangler secret put JWT_SECRET --env staging
# ... repeat for other secrets
```

## Step 5: Install Dependencies

Make sure all dependencies are installed:

```bash
cd apps/api
bun install
```

## Step 6: Generate Prisma Client

Generate Prisma Client before deploying:

```bash
cd apps/api
bun run db:generate
```

## Step 7: Test Locally (Optional)

Test your Worker locally before deploying:

```bash
cd apps/api
bun run dev:cloudflare
# or
wrangler dev
```

This starts a local development server at `http://localhost:8787`.

## Step 8: Deploy to Cloudflare Workers

### Deploy to Production

```bash
cd apps/api
bun run deploy:cloudflare
# or
wrangler deploy
```

### Deploy to Staging

```bash
cd apps/api
bun run deploy:cloudflare:staging
# or
wrangler deploy --env staging
```

Upon successful deployment, Wrangler will provide a URL like:
```
https://print-e-com-api.your-subdomain.workers.dev
```

## Step 9: Test Your Deployment

Test your API endpoints:

```bash
# Health check
curl https://print-e-com-api.your-subdomain.workers.dev/health

# Root endpoint
curl https://print-e-com-api.your-subdomain.workers.dev/

# API endpoints
curl https://print-e-com-api.your-subdomain.workers.dev/api/v1/products
```

## Step 10: Update CORS Origins

After deployment, update your `CORS_ORIGINS` secret to include your Cloudflare Workers URL:

```bash
wrangler secret put CORS_ORIGINS
# Enter: https://your-frontend-domain.com,https://print-e-com-api.your-subdomain.workers.dev
```

## Monitoring and Debugging

### View Logs

View real-time logs from your Worker:

```bash
wrangler tail
```

### View Logs for Specific Environment

```bash
wrangler tail --env staging
```

### View Worker Details

```bash
wrangler whoami
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy-cloudflare.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main
    paths:
      - 'apps/api/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
        working-directory: apps/api
      
      - name: Generate Prisma Client
        run: bun run db:generate
        working-directory: apps/api
      
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          workingDirectory: apps/api
```

## Important Notes

1. **Node.js Compatibility**: Cloudflare Workers now supports Node.js APIs via `node_compat = true` in `wrangler.toml`, allowing Express.js to run directly.

2. **Database Connections**: Ensure your database allows connections from Cloudflare Workers IPs. Consider using connection pooling.

3. **File System**: Some Node.js file system operations may not work in Workers. The code uses `fs.existsSync` for OpenAPI spec - this should work with node_compat enabled.

4. **Cold Starts**: Workers have minimal cold start times, but database connections may need warm-up strategies.

5. **Limits**: 
   - CPU time: 50ms on free plan, 50s on paid plans
   - Memory: 128MB
   - Request size: 100MB
   - Response size: 100MB

6. **Secrets vs Environment Variables**:
   - Use `wrangler secret put` for sensitive data (encrypted)
   - Use `[vars]` in `wrangler.toml` for non-sensitive configuration (public)

## Troubleshooting

### Build Errors

If you encounter build errors:
```bash
# Clear cache and rebuild
wrangler dev --clear-cache
```

### Database Connection Issues

- Verify `DATABASE_URL` is set correctly
- Check database firewall allows Cloudflare IPs
- Consider using connection pooling for better performance

### CORS Errors

- Verify `CORS_ORIGINS` includes your frontend domain
- Check that CORS middleware is configured correctly

### Module Resolution Issues

- Ensure `compatibility_flags = ["nodejs_compat"]` is set in `wrangler.toml`
- **Node.js Built-in Modules**: Even with `nodejs_compat`, Wrangler's bundler may fail to resolve Node.js built-ins (`crypto`, `path`, `fs`, etc.) during the build. These are provided at runtime, but the bundler needs to treat them as external.
- **Note**: Cloudflare Workers have limitations:
  - File system operations (`fs`) are not available (Workers are stateless)
  - Some Node.js APIs may not be fully supported
  - Consider using Cloudflare R2 for file storage instead of the file system

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Node.js Compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [Express on Cloudflare Workers Blog Post](https://blog.cloudflare.com/bringing-node-js-http-servers-to-cloudflare-workers/)

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Configure automatic deployments via CI/CD
3. ✅ Set up monitoring and alerts
4. ✅ Configure rate limiting
5. ✅ Set up analytics

