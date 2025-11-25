# Debugging Guide for Webinar Funnel Builder

## Enable Debug Mode

### Local Development

Debug mode is automatically enabled when `NODE_ENV=development`. You can also force it:

```bash
# In .env.local
NEXTAUTH_DEBUG="true"
```

### Production (Vercel)

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add or update: `NEXTAUTH_DEBUG` = `true`
3. Redeploy the application
4. View logs: Settings → Logs → Function Logs

## Common Issues & Solutions

### 500 Error on /api/auth/session

**Symptoms:**
- NextAuth session endpoint returns 500
- "There is a problem with the server configuration" error
- Can't access admin pages

**Solutions:**

1. **Check NEXTAUTH_SECRET**
   ```bash
   # Must be 32+ characters
   # Generate a new one:
   openssl rand -base64 32
   ```
   Set in Vercel: Settings → Environment Variables → Add `NEXTAUTH_SECRET`

2. **Check NEXTAUTH_URL**
   ```bash
   # Must match your production domain
   NEXTAUTH_URL="https://webinar-funnel-builder.vercel.app"
   ```

3. **Enable Debug Logs**
   - Set `NEXTAUTH_DEBUG="true"` in Vercel
   - Redeploy
   - Check logs for detailed error messages

### Authentication Not Working

**Debug Steps:**

1. **Check Logs for Auth Attempts**
   ```
   [NextAuth] Authorize attempt: { username: 'admin', hasPassword: true }
   [NextAuth] Authorization successful
   [NextAuth] JWT callback - user signed in: 1
   [NextAuth] Session callback: 1
   ```

2. **Verify Credentials**
   ```bash
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="MiR43Tx2-"
   ```

3. **Test Login Flow**
   - Visit `/admin/login`
   - Open browser DevTools → Console
   - Watch for network requests to `/api/auth/callback/credentials`
   - Check response status

### Database Connection Issues

**Symptoms:**
- Errors when loading funnels
- "relation does not exist" errors
- Connection timeout errors

**Solutions:**

1. **Verify Connection String**
   ```bash
   # Check all POSTGRES_* variables are set
   echo $POSTGRES_URL
   ```

2. **Test Direct Connection**
   ```bash
   psql "$POSTGRES_URL" -c "SELECT NOW();"
   ```

3. **Check Schema Deployment**
   ```bash
   psql "$POSTGRES_URL" -c "\dt"
   # Should show: funnels, funnel_submissions, funnel_versions, funnel_analytics
   ```

4. **Verify Pooling vs Non-Pooling**
   - Use `POSTGRES_PRISMA_URL` (pooled) for queries
   - Use `POSTGRES_URL_NON_POOLING` for migrations

### Missing /admin/env Endpoint (404)

**This is normal** - The error in console is from an old admin template script trying to fetch environment variables client-side. This endpoint doesn't exist and isn't needed.

**To fix:**
1. The app works fine without it
2. Or add a dummy endpoint if it bothers you:
   ```typescript
   // app/admin/env/route.ts
   export async function GET() {
     return Response.json({ ok: true });
   }
   ```

### Chrome Extension Errors

**Errors like:**
```
GET chrome-extension://pejdijmoenmkgeppbflobdenhhabjlaj/utils.js net::ERR_FILE_NOT_FOUND
```

**This is normal** - These are from Chrome extensions (like 1Password, Grammarly, etc.) trying to inject scripts. They don't affect your app.

## Debug Checklist

### Pre-Deployment

- [ ] `npm run build` succeeds locally
- [ ] `npm run dev` works and shows debug logs
- [ ] Can login at `localhost:3000/admin/login`
- [ ] `.env.local` has all required variables
- [ ] No sensitive data committed to git

### Post-Deployment (Vercel)

- [ ] All environment variables set in Vercel dashboard
- [ ] `NEXTAUTH_SECRET` is 32+ characters
- [ ] `NEXTAUTH_URL` matches production URL
- [ ] Database variables match Neon connection
- [ ] Deployment succeeded without errors
- [ ] Visit root URL redirects to `/admin/login`
- [ ] Can access `/admin/login` page
- [ ] Login works with correct credentials
- [ ] After login, dashboard loads

## Viewing Logs

### Vercel Function Logs

1. Go to https://vercel.com/rbradshaw9/webinar-funnel-builder
2. Click **Logs** in sidebar
3. Filter by:
   - **Type**: Function Logs
   - **Time Range**: Last 1 hour
   - **Search**: `[NextAuth]` to see auth logs

### Real-Time Logs

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Watch logs live
vercel logs webinar-funnel-builder --follow
```

### Browser DevTools

1. Open browser DevTools (F12)
2. **Console Tab**: See client-side errors
3. **Network Tab**: 
   - Filter by `Fetch/XHR`
   - Look for `/api/auth/` requests
   - Check status codes (200 = good, 500 = error)
4. **Application Tab → Cookies**:
   - Look for `next-auth.session-token`
   - Should be present after successful login

## Debug Endpoints

### Test Auth Status

```bash
# Check if authenticated
curl https://webinar-funnel-builder.vercel.app/api/auth/session

# Should return:
# Logged out: {}
# Logged in: { "user": { "name": "Admin", ... }, "expires": "..." }
```

### Test Database Connection

```bash
# From terminal (needs psql)
psql "$POSTGRES_URL" -c "SELECT COUNT(*) FROM funnels;"
```

### Test Environment Variables

Create `app/api/debug/env/route.ts` (remove before production!):

```typescript
export async function GET() {
  return Response.json({
    nodeEnv: process.env.NODE_ENV,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    hasDbUrl: !!process.env.POSTGRES_URL,
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    nextauthUrl: process.env.NEXTAUTH_URL,
  });
}
```

Visit: `https://webinar-funnel-builder.vercel.app/api/debug/env`

⚠️ **Remove this endpoint before going live!**

## Debug Output Examples

### Successful Auth Flow

```
[NextAuth] Debug mode enabled
[NextAuth] Environment check: {
  NEXTAUTH_SECRET: '✓ Set',
  NEXTAUTH_URL: 'https://webinar-funnel-builder.vercel.app',
  ADMIN_USERNAME: 'admin',
  ADMIN_PASSWORD: '✓ Set',
  NODE_ENV: 'production'
}
[NextAuth] Authorize attempt: { username: 'admin', hasPassword: true }
[NextAuth] Authorization successful
[NextAuth] JWT callback - user signed in: 1
[NextAuth] Session callback: 1
```

### Failed Auth (Wrong Password)

```
[NextAuth] Authorize attempt: { username: 'admin', hasPassword: true }
[NextAuth] Authorization failed - invalid credentials
```

### Missing Environment Variable

```
[NextAuth] Environment check: {
  NEXTAUTH_SECRET: '✗ Missing',
  ...
}
Error: [next-auth]: `secret` must be provided
```

## Quick Fixes

### Clear and Restart

```bash
# Local development
rm -rf .next
npm run dev

# Force Vercel redeploy
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### Reset Session

**Browser:**
1. Open DevTools → Application → Cookies
2. Delete `next-auth.session-token`
3. Refresh page

**Command Line:**
```bash
curl -X POST https://webinar-funnel-builder.vercel.app/api/auth/signout
```

### Regenerate Everything

```bash
# New NEXTAUTH_SECRET
openssl rand -base64 32

# Update in Vercel
vercel env rm NEXTAUTH_SECRET production
vercel env add NEXTAUTH_SECRET production
# Paste new secret

# Redeploy
vercel --prod
```

## Getting Help

If you're still stuck:

1. **Enable Debug Mode**: Set `NEXTAUTH_DEBUG="true"`
2. **Collect Logs**: Copy Vercel function logs
3. **Check Network Tab**: Screenshot any 500 errors
4. **Note Exact Steps**: What did you do before the error?
5. **Check Recent Changes**: What was the last thing that worked?

## Performance Monitoring

### Check Response Times

```bash
curl -w "\nTotal time: %{time_total}s\n" \
  https://webinar-funnel-builder.vercel.app/api/auth/session
```

### Monitor Database Queries

```bash
# Enable query logging in Neon
# Go to Neon Console → Database → Settings
# Enable "Log all queries"
```

## Production Checklist

Before turning off debug mode:

- [ ] All features tested and working
- [ ] No errors in Vercel logs
- [ ] Login/logout works reliably
- [ ] Database queries performing well
- [ ] No sensitive data exposed in logs
- [ ] Set `NEXTAUTH_DEBUG="false"`
- [ ] Remove any debug endpoints
- [ ] Monitor for 24 hours after launch
