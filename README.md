# AI-Powered Webinar Funnel Builder

An intelligent multi-funnel builder that automatically generates high-converting webinar registration pages using Claude AI, with seamless integrations to WebinarFuel and Infusionsoft.

**Last Updated**: November 25, 2025

## Features

- 🤖 **AI-Powered Page Generation** - Claude Sonnet 4.5 builds custom funnels by analyzing your Infusionsoft and WebinarFuel codes
- 🎯 **Dual API Integration** - Automatic submission to both WebinarFuel and Infusionsoft
- 📅 **Smart Session Handling** - Supports dropdown widgets, single sessions, and recurring schedules
- 📊 **Built-in Analytics** - Track views, submissions, and conversion rates per funnel
- 🗓️ **Calendar Integration** - Google Calendar, Apple Calendar (.ics), and Outlook (.ics) links
- 🔒 **Secure Admin** - NextAuth.js authentication with protected routes
- ⚡ **High Performance** - Next.js 16 with Turbopack for blazing-fast builds

## Tech Stack

- **Framework**: Next.js 16 with App Router & TypeScript
- **Database**: Vercel Postgres with full schema
- **AI**: Claude Sonnet 4.5 via Anthropic SDK
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS 4
- **APIs**: WebinarFuel REST API, Infusionsoft form submission
- **Parsers**: Cheerio for HTML/JavaScript extraction

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update `.env.local` with your credentials:

```bash
# Database (from Vercel Postgres)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NO_SSL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="default"
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="verceldb"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Anthropic AI
ANTHROPIC_API_KEY="sk-ant-api03-..."

# WebinarFuel API
WEBINARFUEL_BEARER_TOKEN="Dp2kG9Vucpyq5t5RVPqvDxfU"
WEBINARFUEL_APP_KEY="0599dd5a553ec98a518aa010f0a3982f"

# Domain
NEXT_PUBLIC_DOMAIN="learn.thecashflowacademy.com"
```

### 3. Setup Database

Connect to Vercel Postgres and run the schema:

```bash
psql $POSTGRES_URL < db/schema.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000/admin/login`

**Default credentials:**
- Username: `admin`
- Password: `cashflow2025`

## Usage Guide

### Creating a New Funnel

1. **Log in** at `/admin/login`
2. **Click "Create New Funnel"**
3. **Step 1 - Basic Info**: Enter name (slug auto-generates)
4. **Step 2 - Infusionsoft**: Paste complete form HTML
5. **Step 3 - WebinarFuel**: Paste widget code (+ optional URL)
6. **Step 4 - Generate**: AI creates pages (~10-30 seconds)
7. **Step 5 - Review**: Preview, then publish
8. **Live**: Funnel at `learn.thecashflowacademy.com/{slug}`

### Managing Funnels

- **Dashboard** (`/admin`) - View all funnels with stats
- **Edit** (`/admin/funnels/[id]`) - Update name, slug, status
- **Analytics** (`/admin/analytics`) - Performance metrics
- **Preview** - Test live pages before sharing

### How It Works

1. User visits `/{slug}` → View tracked
2. User fills form → Submits to `/api/register`
3. System submits to both APIs in parallel
4. Database records submission
5. User redirects to `/{slug}/confirmation`
6. Shows calendar links + next steps

## Architecture

### Key Directories

```
app/
  [slug]/               # Dynamic funnel pages
  admin/                # Protected admin dashboard
  api/                  # API routes
lib/
  db.ts                 # Database operations
  ai/claude.ts          # AI generation
  parsers/              # Code parsers
  calendar.ts           # Calendar utilities
db/
  schema.sql            # Database schema
```

### Database Tables

- **funnels** - Main configuration, API settings, generated HTML, analytics
- **funnel_submissions** - Individual registrations with API status
- **funnel_analytics** - Daily metrics per funnel
- **funnel_versions** - A/B testing support

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/funnels` | GET | List all funnels |
| `/api/funnels` | POST | Create funnel |
| `/api/funnels/[id]` | GET/PUT/DELETE | Manage funnel |
| `/api/generate` | POST | Generate pages with AI |
| `/api/register` | POST | Process registration |
| `/api/calendar/google` | GET | Google Calendar link |
| `/api/calendar/ics` | GET | Download ICS file |

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Complete funnel builder"
git push origin main
```

### 2. Import to Vercel

1. Visit [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Add environment variables
4. Deploy

### 3. Setup Database

1. Create Vercel Postgres in dashboard
2. Run schema: `psql $POSTGRES_URL < db/schema.sql`

### 4. Configure Domain

1. Add `learn.thecashflowacademy.com` in Vercel
2. Update DNS as instructed

## Security

⚠️ **Important Security Steps:**

1. **Change default password** in `/app/api/auth/[...nextauth]/route.ts`
2. **Generate strong secret**: `openssl rand -base64 32`
3. **Never commit** `.env.local` (already in `.gitignore`)
4. **Enable rate limiting** on `/api/register`
5. **Validate all inputs** before database writes

## Troubleshooting

### Database Issues
- Verify `POSTGRES_URL` is set correctly
- Check schema was applied: `psql $POSTGRES_URL -c "\dt"`
- Review Vercel Postgres dashboard

### AI Generation Fails
- Verify Anthropic API key
- Check API rate limits
- Review parser output in logs

### Form Submissions Fail
- Check browser console for errors
- Verify API credentials
- Test APIs individually
- Check database for submissions

### Login Issues
- Verify credentials in auth handler
- Check `NEXTAUTH_SECRET` is set
- Clear cookies and retry

## License

Proprietary - The Cash Flow Academy
