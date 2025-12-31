# Google/Facebook Authentication Setup Guide

## What I Fixed

Previously, the Google and Facebook sign-in buttons were just logging to the console. Now they're properly implemented using Supabase OAuth.

## Files Created/Updated

1. **`lib/supabase.ts`** - Supabase client for frontend with OAuth functions
2. **`app/auth/callback/page.tsx`** - OAuth callback handler
3. **`app/auth/login/page.tsx`** - Updated to use real Google/Facebook login
4. **`app/auth/signup/page.tsx`** - Updated to use real Google/Facebook signup

## Setup Required

### 1. Install Dependencies

```bash
cd apps/web
bun add @supabase/supabase-js
```

### 2. Configure Environment Variables

Create `.env.local` in `apps/web/`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You already have `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the backend `.env`, so copy those values (add `NEXT_PUBLIC_` prefix for frontend).

### 3. Enable Google OAuth in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Enable **Google** provider
5. Add your Google OAuth credentials:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
6. Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 4. Setup Google OAuth (if not already done)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local testing)
7. Copy **Client ID** and **Client Secret** to Supabase

### 5. (Optional) Setup Facebook OAuth

Similar process for Facebook:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. Add credentials to Supabase

## How It Works

1. **User clicks "Login with Google"**
2. `signInWithGoogle()` is called → redirects to Google
3. User authorizes the app on Google
4. Google redirects back to `/auth/callback`
5. Callback page extracts the session token
6. Token is stored in cookies
7. User is redirected to home page

## Testing

1. Start the frontend: `cd apps/web && bun run dev`
2. Go to `http://localhost:3000/auth/login`
3. Click "Login with Google"
4. Should redirect to Google sign-in
5. After authorization, should redirect back and log you in

## Troubleshooting

### "Supabase is not configured"
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`
- Restart the dev server after adding env vars

### OAuth not working
- Check Supabase dashboard that Google provider is enabled
- Verify redirect URLs are correctly configured in both Google Console and Supabase
- Check browser console for errors

### Session not persisting
- The callback page stores the token in cookies
- Make sure `lib/api-client.ts` is using the cookie functions correctly

## Current Status

✅ Google OAuth implemented
✅ Facebook OAuth implemented
✅ Callback handler created
✅ Token storage via cookies
⚠️  Requires Supabase configuration (follow steps above)
⚠️  Requires Google OAuth credentials
⚠️  Requires Facebook OAuth credentials (optional)

