# Important: Cloudflare Workers Limitations

## Current Issue: Node.js Built-in Modules

Your Express.js app uses Node.js built-in modules (`crypto`, `path`, `fs`) that Wrangler's bundler cannot resolve, even with `nodejs_compat` enabled.

## The Problem

- `nodejs_compat` provides **runtime** polyfills for Node.js APIs
- But Wrangler's bundler (esbuild) tries to **resolve and bundle** these modules during build
- Node.js built-ins don't exist as npm packages, so the bundler fails

## Solutions

### Option 1: Use Cloudflare Pages Functions (Recommended for Express)

Cloudflare Pages Functions might be a better fit for Express.js apps. However, this also has limitations.

### Option 2: Adapt Code for Workers Limitations

Your code uses:
- `fs` (file system) - **NOT available in Workers** (stateless environment)
- `path` - Should work with `nodejs_compat` but bundler issue
- `crypto` - Should work with `nodejs_compat` but bundler issue

**File System Operations:**
- The `/uploads` static file serving won't work (no file system)
- OpenAPI YAML file reading won't work (no file system)
- Consider:
  - Using Cloudflare R2 for file storage
  - Embedding OpenAPI spec in code instead of reading from file
  - Using environment variables or KV for configuration

### Option 3: Use a Different Platform

Consider deploying to:
- **Railway** - Full Node.js support
- **Render** - Full Node.js support  
- **Fly.io** - Full Node.js support
- **DigitalOcean App Platform** - Full Node.js support
- **AWS Lambda** - Better Node.js compatibility
- **Vercel** - You already have Vercel setup in `apps/api/api/index.ts`

### Option 4: Wait for Wrangler Improvements

Cloudflare is actively improving Node.js compatibility, but there are still bundler issues with built-in modules.

## Recommendation

Given the complexity and limitations, I recommend:
1. **Use Vercel** (you already have the setup)
2. Or **adapt the code** to work without file system operations and deploy to a platform with full Node.js support

Would you like me to:
- Set up Vercel deployment instead?
- Adapt the code to work with Cloudflare Workers (remove fs usage, embed OpenAPI spec)?
- Set up deployment to Railway/Render/Fly.io?

