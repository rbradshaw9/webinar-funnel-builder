# 🚀 Deployment Checklist

## Pre-Deployment Validation ✅

All systems validated and ready for production deployment!

### ✓ Build Status
- [x] TypeScript compilation successful
- [x] Production build completes without errors
- [x] All dependencies installed (488 packages)
- [x] No runtime errors detected

### ✓ Code Quality
- [x] All TypeScript types properly defined
- [x] Next.js 16 async params properly handled
- [x] Database queries use parameterized statements
- [x] API routes have proper error handling
- [x] Environment variables properly configured

### ✓ Security
- [x] `.env.local` in `.gitignore`
- [x] API keys not committed to repository
- [x] Session-based authentication configured
- [x] Protected API routes validated
- [⚠️] **DEFAULT PASSWORD IN CODE** - Change before production!

### ✓ Architecture
- [x] Database schema complete (4 tables)
- [x] All CRUD operations implemented
- [x] Dual API integration (Infusionsoft + WebinarFuel)
- [x] Analytics tracking implemented
- [x] Calendar generation working
- [x] AI page generation configured

---

## 🎯 Deployment Steps

### Step 1: GitHub Push

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Complete webinar funnel builder - production ready"

# Push to GitHub
git branch -M main
git remote add origin https://github.com/rbradshaw9/webinar-funnel-builder.git
git push -u origin main
```

### Step 2: Vercel Import

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js 16

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

#### Required Variables
```bash
NEXTAUTH_SECRET=                    # Generate new: openssl rand -base64 32
NEXTAUTH_URL=                       # Will be: https://learn.thecashflowacademy.com
ANTHROPIC_API_KEY=                  # Your Claude API key
WEBINARFUEL_BEARER_TOKEN=           # Your WebinarFuel token
WEBINARFUEL_APP_KEY=                # Your WebinarFuel app key
NEXT_PUBLIC_DOMAIN=                 # learn.thecashflowacademy.com
```

#### Database Variables (Auto-configured by Vercel Postgres)
```bash
POSTGRES_URL=                       # Auto-filled
POSTGRES_PRISMA_URL=               # Auto-filled
POSTGRES_URL_NO_SSL=               # Auto-filled
POSTGRES_URL_NON_POOLING=          # Auto-filled
POSTGRES_USER=                      # Auto-filled
POSTGRES_HOST=                      # Auto-filled
POSTGRES_PASSWORD=                  # Auto-filled
POSTGRES_DATABASE=                  # Auto-filled
```

### Step 4: Create Vercel Postgres Database

1. In Vercel Project → **Storage** tab
2. Click **"Create Database"**
3. Select **"Postgres"**
4. Choose region: **US East (iad1)** (closest to your users)
5. Database name: `webinar-funnel-builder`
6. Click **"Create"**

Environment variables will be automatically added to your project.

### Step 5: Initialize Database Schema

```bash
# Pull production environment variables
vercel env pull .env.production.local

# Connect to production database and run schema
psql $POSTGRES_URL < db/schema.sql

# Verify tables were created
psql $POSTGRES_URL -c "\dt"

# Expected output:
#  public | funnel_analytics    | table | default
#  public | funnel_submissions  | table | default
#  public | funnel_versions     | table | default
#  public | funnels             | table | default
```

### Step 6: Deploy Application

```bash
# Deploy to production
vercel --prod

# Or let Vercel auto-deploy from GitHub
# (Happens automatically on push to main branch)
```

### Step 7: Configure Custom Domain

1. Vercel Dashboard → **Domains**
2. Add domain: `learn.thecashflowacademy.com`
3. Vercel will show DNS records to add

#### DNS Configuration

Add these records to your DNS provider:

**Option A: Using A Record (Recommended)**
```
Type: A
Name: learn
Value: 76.76.21.21
```

**Option B: Using CNAME**
```
Type: CNAME
Name: learn
Value: cname.vercel-dns.com
```

**SSL Certificate**
- Vercel automatically provisions SSL via Let's Encrypt
- Takes 1-5 minutes after DNS propagation

### Step 8: Update Admin Credentials

**CRITICAL SECURITY STEP**

Edit `app/api/auth/[...nextauth]/route.ts`:

```typescript
// Change these lines:
if (
  credentials.username === "admin" &&
  credentials.password === "cashflow2025"  // ← CHANGE THIS!
) {
```

To:
```typescript
if (
  credentials.username === "admin" &&
  credentials.password === "YOUR-SECURE-PASSWORD-HERE"
) {
```

Then commit and push:
```bash
git add app/api/auth/[...nextauth]/route.ts
git commit -m "Update admin credentials"
git push origin main
```

### Step 9: Smoke Test Production

1. **Test Login**
   - Visit: `https://learn.thecashflowacademy.com/admin/login`
   - Login with new credentials
   - Verify dashboard loads

2. **Create Test Funnel**
   - Click "Create New Funnel"
   - Use real Infusionsoft/WebinarFuel codes
   - Generate pages with AI
   - Publish funnel

3. **Test Registration Flow**
   - Visit: `https://learn.thecashflowacademy.com/test-slug`
   - Fill out registration form
   - Submit
   - Verify redirect to confirmation page
   - Check Infusionsoft for contact
   - Check WebinarFuel for registrant
   - Check database for submission

4. **Test Analytics**
   - Visit: `https://learn.thecashflowacademy.com/admin/analytics`
   - Verify 1 view, 1 submission showing
   - Check conversion rate

5. **Test Calendar Links**
   - Click Google Calendar link
   - Download ICS file
   - Verify event details correct

---

## 🔒 Post-Deployment Security

### 1. Change Admin Password ⚠️ CRITICAL
See Step 8 above - DO NOT skip this!

### 2. Generate New NextAuth Secret
```bash
openssl rand -base64 32
```
Update in Vercel environment variables.

### 3. Enable Rate Limiting (Optional)

Add to `app/api/register/route.ts`:
```typescript
import { ratelimit } from "@/lib/ratelimit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }
  
  // ... rest of code
}
```

### 4. Enable Vercel Protection

1. Settings → **Protection**
2. Enable **"Vercel Authentication"** for `/admin` routes
3. Add team members who need access

### 5. Set Up Monitoring

1. Vercel Dashboard → **Analytics**
2. Enable Web Analytics
3. Set up alerts for:
   - High error rates
   - Slow response times
   - Failed deployments

---

## 📊 Expected Performance Metrics

### Initial Load Times
- Homepage: < 500ms
- Admin Dashboard: < 1s
- Registration Page: < 500ms
- Confirmation Page: < 500ms

### API Response Times
- List Funnels: < 200ms
- Create Funnel: < 300ms
- Generate Pages (AI): 10-30 seconds
- Submit Registration: 2-5 seconds

### Database Performance
- View Tracking: < 50ms
- Submission Recording: < 100ms
- Analytics Query: < 200ms

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Check:**
- Environment variables are set
- No syntax errors in code
- Dependencies are in `package.json`
- Node version compatible (18+)

**View logs:**
```bash
vercel logs [deployment-url]
```

### Database Connection Fails

**Check:**
- Vercel Postgres is created
- Environment variables are set
- Schema was applied: `psql $POSTGRES_URL -c "\dt"`

**Test connection:**
```bash
psql $POSTGRES_URL -c "SELECT NOW();"
```

### Domain Not Working

**Check:**
- DNS records are correct
- DNS has propagated (can take 24-48 hours)
- Check: https://dnschecker.org/

**Force SSL redirect:**
Add to `next.config.ts`:
```typescript
async redirects() {
  return [
    {
      source: '/:path*',
      has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
      destination: 'https://learn.thecashflowacademy.com/:path*',
      permanent: true,
    },
  ];
}
```

### AI Generation Fails

**Check:**
- Anthropic API key is valid
- API has credits/quota remaining
- Request isn't timing out (increase maxDuration in vercel.json)

**View API logs:**
Check Vercel Functions logs for `/api/generate`

---

## ✅ Post-Launch Checklist

- [ ] Admin password changed from default
- [ ] Database schema applied successfully
- [ ] Test funnel created and working
- [ ] Form submissions reaching both APIs
- [ ] Analytics tracking properly
- [ ] Calendar links generating correctly
- [ ] SSL certificate active
- [ ] Custom domain resolving
- [ ] Monitoring alerts configured
- [ ] Team members have access
- [ ] Documentation shared with team

---

## 🎉 You're Live!

Your AI-Powered Webinar Funnel Builder is now in production!

**Admin Dashboard:** https://learn.thecashflowacademy.com/admin

### Next Steps

1. **Create Your First Real Funnel**
   - Use actual Infusionsoft form
   - Use actual WebinarFuel widget
   - Let AI generate beautiful pages

2. **Share Funnel URL**
   - Format: `learn.thecashflowacademy.com/your-slug`
   - Test with real users
   - Monitor analytics

3. **Iterate & Optimize**
   - Review conversion rates
   - A/B test different approaches
   - Refine AI prompts if needed

---

**Need Help?**
- Check logs: `vercel logs`
- Review docs: README.md, QUICKSTART.md
- Check Vercel dashboard for errors
