# Authentication Debug Guide

## Changes Made to Fix "User Details Not Showing"

### Problem
After logging in (email/password or OAuth), the header still showed "Sign Up/Sign In" instead of the user's name.

### Root Causes Found
1. **OAuth Callback Issue**: The callback page stored the token but didn't fetch the user profile
2. **Type Mismatch**: Frontend User interface didn't match backend response
3. **No Debugging**: No console logs to troubleshoot the issue

### Fixes Applied

#### 1. Updated OAuth Callback (`app/auth/callback/page.tsx`)
**Before**: Just stored token and redirected
```typescript
setAuthToken(session.access_token);
router.push("/");
```

**After**: Now fetches user profile before redirecting
```typescript
setAuthToken(session.access_token);
await refreshUser();  // ← This fetches the profile!
router.push("/");
```

#### 2. Fixed User Interface (`lib/api/auth.ts`)
Made optional fields that backend doesn't always return:
- `isSuperAdmin` → Optional (backend doesn't always return this)
- `updatedAt` → Optional (backend doesn't return this)
- Added `addresses` field (backend returns this in getProfile)

#### 3. Added Debug Logging (`contexts/AuthContext.tsx`)
Now you can see in browser console:
- `[AuthContext] Checking auth, token exists: true/false`
- `[AuthContext] Profile response: {...}`
- `[AuthContext] Setting user: {...}`
- Any errors that occur

#### 4. Added Loading State (`Header.tsx`)
Shows "Loading..." spinner while checking authentication

## How to Debug

### 1. Open Browser Console
Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

### 2. Look for AuthContext Logs
After login or page refresh, you should see:

**✅ Successful Login:**
```
[AuthContext] Login response: {success: true, data: {...}}
[AuthContext] Setting token and user after login: {...}
```

**✅ Successful Profile Fetch:**
```
[AuthContext] Checking auth, token exists: true
[AuthContext] Profile response: {success: true, data: {...}}
[AuthContext] Setting user: {id: "...", email: "...", name: "..."}
```

**❌ Failed Profile Fetch:**
```
[AuthContext] Checking auth, token exists: true
[AuthContext] Error fetching profile: Error: ...
```

### 3. Common Issues & Solutions

#### Issue: Token exists but profile fails
**Symptoms:**
- Console shows: `[AuthContext] Checking auth, token exists: true`
- Followed by: `[AuthContext] Error fetching profile: ...`

**Possible Causes:**
1. Backend API is not running (`http://localhost:3002`)
2. CORS issue
3. Token is invalid/expired
4. Database connection issue on backend

**Solution:**
- Check backend is running: `cd apps/api && bun run dev`
- Check backend logs for errors
- Try clearing cookies and logging in again

#### Issue: No token found
**Symptoms:**
- Console shows: `[AuthContext] Checking auth, token exists: false`
- Header shows "Sign Up/Sign In"

**Possible Causes:**
1. Login didn't complete successfully
2. Token wasn't stored in cookies
3. Cookies were cleared

**Solution:**
- Try logging in again
- Check browser DevTools → Application → Cookies
- Look for `auth_token` cookie

#### Issue: Login succeeds but user not set
**Symptoms:**
- Console shows successful login response
- But header still shows "Sign Up/Sign In"

**Possible Causes:**
1. User state not updating
2. Backend response format doesn't match frontend expectations

**Solution:**
- Check the login response in console
- Verify it has `{success: true, data: {user: {...}, token: "..."}}`
- Check if backend returned all required user fields

### 4. Check Cookies

Go to: **DevTools → Application → Cookies → http://localhost:3000**

You should see:
- **Name**: `auth_token`
- **Value**: Long JWT string starting with `eyJ...`
- **Path**: `/`
- **Expires**: 7 days from login

If cookie is missing or expired, login again.

### 5. Test API Endpoint Manually

Test if backend is working:
```bash
# Get your token from cookies (copy the value)
TOKEN="your-token-here"

# Test profile endpoint
curl http://localhost:3002/api/v1/auth/user/profile \
  -H "Authorization: Bearer $TOKEN"
```

Should return:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "...",
    "name": "...",
    "isAdmin": false,
    ...
  }
}
```

## Expected Flow

### Email/Password Login
1. User enters credentials → clicks Login
2. Frontend calls `/api/v1/auth/login`
3. Backend validates & returns `{user, token}`
4. Frontend stores token in cookie
5. Frontend sets user in AuthContext
6. Header shows user name ✅

### OAuth Login (Google/Facebook)
1. User clicks "Login with Google"
2. Redirects to Google
3. Google redirects back to `/auth/callback`
4. Callback gets session token from Supabase
5. Stores token in cookie
6. **Calls `refreshUser()`** to fetch profile
7. Redirects to home
8. Header shows user name ✅

## Still Not Working?

1. **Clear all cookies**: DevTools → Application → Clear site data
2. **Restart both servers**:
   ```bash
   # Terminal 1 - Backend
   cd apps/api && bun run dev
   
   # Terminal 2 - Frontend
   cd apps/web && bun run dev
   ```
3. **Try a fresh login**
4. **Check console logs** - share them if you need help

## Remove Debug Logs (Production)

Once everything works, remove the `console.log` statements from `AuthContext.tsx`:
- Search for `console.log('[AuthContext]`
- Delete those lines
- Keep the actual logic

