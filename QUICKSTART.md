# Quick Start Guide

## Get Running in 5 Minutes

### 1. Install & Configure (2 min)

```bash
# Install dependencies
npm install

# Generate NextAuth secret
openssl rand -base64 32
# Copy output and add to .env.local as NEXTAUTH_SECRET
```

### 2. Setup Vercel Postgres (2 min)

```bash
# Option A: Use Vercel CLI
vercel login
vercel link
vercel env pull .env.local

# Option B: Manual setup
# 1. Go to vercel.com/dashboard
# 2. Create new Postgres database
# 3. Copy connection strings to .env.local
```

### 3. Run Database Schema (30 sec)

```bash
# Connect and run schema
psql $POSTGRES_URL < db/schema.sql

# Verify tables created
psql $POSTGRES_URL -c "\dt"
```

### 4. Start Development Server (30 sec)

```bash
npm run dev
```

Visit: `http://localhost:3000/admin/login`

**Login:**
- Username: `admin`
- Password: `cashflow2025`

## First Funnel in 2 Minutes

### 1. Create Funnel

1. Click **"Create New Funnel"**
2. Enter name: `Test Webinar`
3. Slug auto-fills: `test-webinar`
4. Click **Continue**

### 2. Add Infusionsoft Code

Paste your Infusionsoft form HTML (example):

```html
<form method="POST" action="https://example.infusionsoft.com/app/form/process">
  <input type="hidden" name="inf_form_xid" value="abc123" />
  <input type="hidden" name="inf_form_name" value="Webinar Registration" />
  <input type="text" name="inf_field_FirstName" />
  <input type="text" name="inf_field_LastName" />
  <input type="email" name="inf_field_Email" />
  <input type="tel" name="inf_field_Phone1" />
</form>
```

Click **Continue**

### 3. Add WebinarFuel Code

Paste your WebinarFuel widget code (example):

```html
<script src="https://app.webinarfuel.com/widgets/123/456.js"></script>
```

Optional: Add WebinarFuel URL:
```
https://app.webinarfuel.com/register/your-webinar/123/456
```

Click **Continue**

### 4. Generate Pages

- Click **"Generate Pages"**
- Wait 10-30 seconds for AI
- Review generated HTML
- Click **"Publish Funnel"**

### 5. Test Your Funnel

Visit: `http://localhost:3000/test-webinar`

- Fill out form
- Submit
- Check confirmation page
- Verify in Infusionsoft
- Verify in WebinarFuel
- Check admin analytics

## Environment Variables Quick Reference

```bash
# Required for development
POSTGRES_URL="postgres://..."
NEXTAUTH_SECRET="generate-with-openssl"
ANTHROPIC_API_KEY="sk-ant-api03-..."
WEBINARFUEL_BEARER_TOKEN="your-token"

# Optional (already set)
WEBINARFUEL_APP_KEY="0599dd5a553ec98a518aa010f0a3982f"
NEXT_PUBLIC_DOMAIN="learn.thecashflowacademy.com"
```

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
psql $POSTGRES_URL < db/schema.sql              # Run schema
psql $POSTGRES_URL -c "SELECT * FROM funnels;"  # Query funnels
psql $POSTGRES_URL -c "DROP TABLE IF EXISTS funnels CASCADE;"  # Reset

# Deployment
vercel                # Deploy to Vercel
vercel --prod         # Deploy to production
vercel env pull       # Pull environment variables
```

## Troubleshooting

### Can't Connect to Database
```bash
# Check connection string
echo $POSTGRES_URL

# Test connection
psql $POSTGRES_URL -c "SELECT NOW();"
```

### Login Not Working
- Check NEXTAUTH_SECRET is set
- Clear browser cookies
- Verify credentials: admin/cashflow2025

### AI Generation Fails
- Check Anthropic API key in .env.local
- Verify API has credits
- Check logs: `npm run dev` output

### Form Submission Fails
- Open browser console (F12)
- Check Network tab for errors
- Verify API credentials
- Check database for submission record

## Next Steps

1. **Change Admin Password**
   - Edit `/app/api/auth/[...nextauth]/route.ts`
   - Replace hardcoded credentials

2. **Deploy to Production**
   - See README.md deployment section
   - Configure custom domain

3. **Create Real Funnels**
   - Use actual Infusionsoft forms
   - Use actual WebinarFuel widgets
   - Test complete flow

4. **Monitor Performance**
   - Check `/admin/analytics`
   - Review conversion rates
   - Optimize pages as needed

## Support Resources

- **Full Documentation**: See README.md
- **Project Summary**: See PROJECT_SUMMARY.md
- **Database Schema**: See db/schema.sql
- **API Documentation**: See README.md API section

---

Need help? Check the logs:
- Server errors: Terminal where `npm run dev` is running
- Client errors: Browser console (F12)
- Database errors: Vercel Postgres dashboard
