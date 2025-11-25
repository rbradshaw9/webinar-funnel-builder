# Vercel Environment Variables Setup

## Critical Environment Variables

These must be set in your Vercel project settings (Settings → Environment Variables).

### 1. Authentication (Required)

```bash
# Generate a secure secret (32+ characters)
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# Your production URL
NEXTAUTH_URL="https://webinar-funnel-builder.vercel.app"

# Debug mode (set to "false" in production)
NEXTAUTH_DEBUG="false"

# Admin credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="MiR43Tx2-"
```

**How to generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Database (Auto-configured from Neon)

These are automatically set when you connect Neon Postgres from Vercel Marketplace:

```bash
POSTGRES_URL="postgresql://neondb_owner:npg_d2bw7yNBOpMU@ep-divine-rice-adya8684-pooler.c-2.us-east-1.aws.neon.tech/neondb"
POSTGRES_PRISMA_URL="postgresql://neondb_owner:npg_d2bw7yNBOpMU@ep-divine-rice-adya8684-pooler.c-2.us-east-1.aws.neon.tech/neondb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NO_SSL="postgresql://neondb_owner:npg_d2bw7yNBOpMU@ep-divine-rice-adya8684-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=disable"
POSTGRES_URL_NON_POOLING="postgresql://neondb_owner:npg_d2bw7yNBOpMU@ep-divine-rice-adya8684.c-2.us-east-1.aws.neon.tech/neondb"
POSTGRES_USER="neondb_owner"
POSTGRES_HOST="ep-divine-rice-adya8684-pooler.c-2.us-east-1.aws.neon.tech"
POSTGRES_PASSWORD="npg_d2bw7yNBOpMU"
POSTGRES_DATABASE="neondb"
```

### 3. Claude AI API

```bash
ANTHROPIC_API_KEY="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"
```

### 4. WebinarFuel Integration

```bash
WEBINARFUEL_BEARER_TOKEN="Dp2kG9Vucpyq5t5RVPqvDxfU"
WEBINARFUEL_APP_KEY="0599dd5a553ec98a518aa010f0a3982f"
```

### 5. Domain Configuration

```bash
NEXT_PUBLIC_BASE_URL="https://webinar-funnel-builder.vercel.app"
NEXT_PUBLIC_DOMAIN="learn.thecashflowacademy.com"
```

## Setup Steps in Vercel

1. Go to your Vercel project: https://vercel.com/rbradshaw9/webinar-funnel-builder
2. Click **Settings** → **Environment Variables**
3. Add each variable above
4. For each variable:
   - **Name**: Copy the variable name (e.g., `NEXTAUTH_SECRET`)
   - **Value**: Copy the value
   - **Environment**: Select all environments (Production, Preview, Development)
5. Click **Save**
6. Redeploy your application for changes to take effect

## Troubleshooting

### Debug Mode

To enable detailed logging in production:

```bash
NEXTAUTH_DEBUG="true"
```

Then check Vercel logs:
```
Settings → Logs → Function Logs
```

### Check Environment Variables

After deployment, verify variables are set:
1. Go to Settings → Environment Variables
2. Look for ✓ next to each variable
3. Variables should show as "Encrypted" for security

### Common Issues

**500 Error on /api/auth/session:**
- Check `NEXTAUTH_SECRET` is set (32+ characters)
- Check `NEXTAUTH_URL` matches your domain
- Enable `NEXTAUTH_DEBUG="true"` and check logs

**Authentication not working:**
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set
- Check logs for authorization attempt details

**Database connection errors:**
- Ensure all POSTGRES_* variables are set
- Verify Neon database is connected in Vercel Marketplace
- Check database credentials haven't changed

## Security Notes

⚠️ **Never commit these values to git**

The `.env.local` file is gitignored. Use `.env.example` as a template.

🔒 **Rotate secrets regularly**

- Change `ADMIN_PASSWORD` periodically
- Regenerate `NEXTAUTH_SECRET` when team members leave
- Monitor API key usage in Anthropic dashboard

## Quick Copy-Paste for Vercel

```bash
# Generate new secret first
openssl rand -base64 32

# Then set in Vercel:
NEXTAUTH_SECRET="<paste-generated-secret>"
NEXTAUTH_URL="https://webinar-funnel-builder.vercel.app"
NEXTAUTH_DEBUG="false"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="MiR43Tx2-"
ANTHROPIC_API_KEY="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"
WEBINARFUEL_BEARER_TOKEN="Dp2kG9Vucpyq5t5RVPqvDxfU"
WEBINARFUEL_APP_KEY="0599dd5a553ec98a518aa010f0a3982f"
NEXT_PUBLIC_BASE_URL="https://webinar-funnel-builder.vercel.app"
NEXT_PUBLIC_DOMAIN="learn.thecashflowacademy.com"
```

**Note:** Database variables should already be set from Neon integration.
