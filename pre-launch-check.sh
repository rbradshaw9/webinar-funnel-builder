#!/bin/bash

# Pre-Launch Validation Script
# Run this before deploying to Vercel

echo "🚀 Webinar Funnel Builder - Pre-Launch Validation"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check pass/fail
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

echo "1. Checking Environment Variables..."
echo "-----------------------------------"

# Check critical environment variables
if [ -f .env.local ]; then
    check_pass ".env.local file exists"
    
    # Check for required variables
    if grep -q "ANTHROPIC_API_KEY=" .env.local; then
        if grep "ANTHROPIC_API_KEY=" .env.local | grep -q "sk-ant-"; then
            check_pass "ANTHROPIC_API_KEY is set"
        else
            check_fail "ANTHROPIC_API_KEY appears invalid"
        fi
    else
        check_fail "ANTHROPIC_API_KEY not found in .env.local"
    fi
    
    if grep -q "NEXTAUTH_SECRET=" .env.local; then
        check_pass "NEXTAUTH_SECRET is set"
    else
        check_fail "NEXTAUTH_SECRET not found in .env.local"
    fi
    
    if grep -q "WEBINARFUEL_BEARER_TOKEN=" .env.local; then
        check_pass "WEBINARFUEL_BEARER_TOKEN is set"
    else
        check_fail "WEBINARFUEL_BEARER_TOKEN not found in .env.local"
    fi
    
    # Check for Postgres (can be empty in dev)
    if grep -q "POSTGRES_URL=" .env.local; then
        check_pass "POSTGRES_URL variable exists"
    else
        check_warn "POSTGRES_URL not found (will need for production)"
    fi
else
    check_fail ".env.local file not found"
fi

echo ""
echo "2. Checking Project Structure..."
echo "--------------------------------"

# Check critical directories
[ -d "app" ] && check_pass "app/ directory exists" || check_fail "app/ directory missing"
[ -d "lib" ] && check_pass "lib/ directory exists" || check_fail "lib/ directory missing"
[ -d "db" ] && check_pass "db/ directory exists" || check_fail "db/ directory missing"

# Check critical files
[ -f "package.json" ] && check_pass "package.json exists" || check_fail "package.json missing"
[ -f "next.config.ts" ] && check_pass "next.config.ts exists" || check_fail "next.config.ts missing"
[ -f "db/schema.sql" ] && check_pass "db/schema.sql exists" || check_fail "db/schema.sql missing"

echo ""
echo "3. Checking Key Files..."
echo "------------------------"

# Check admin pages
[ -f "app/admin/page.tsx" ] && check_pass "Admin dashboard exists" || check_fail "Admin dashboard missing"
[ -f "app/admin/login/page.tsx" ] && check_pass "Login page exists" || check_fail "Login page missing"
[ -f "app/admin/funnels/new/page.tsx" ] && check_pass "Funnel creation wizard exists" || check_fail "Funnel creation wizard missing"

# Check API routes
[ -f "app/api/funnels/route.ts" ] && check_pass "Funnels API exists" || check_fail "Funnels API missing"
[ -f "app/api/generate/route.ts" ] && check_pass "Generate API exists" || check_fail "Generate API missing"
[ -f "app/api/register/route.ts" ] && check_pass "Register API exists" || check_fail "Register API missing"

# Check dynamic routes
[ -f "app/[slug]/page.tsx" ] && check_pass "Dynamic funnel route exists" || check_fail "Dynamic funnel route missing"
[ -f "app/[slug]/confirmation/page.tsx" ] && check_pass "Confirmation route exists" || check_fail "Confirmation route missing"

# Check lib files
[ -f "lib/db.ts" ] && check_pass "Database utilities exist" || check_fail "Database utilities missing"
[ -f "lib/ai/claude.ts" ] && check_pass "Claude AI integration exists" || check_fail "Claude AI integration missing"
[ -f "lib/parsers/infusionsoft.ts" ] && check_pass "Infusionsoft parser exists" || check_fail "Infusionsoft parser missing"
[ -f "lib/parsers/webinarfuel.ts" ] && check_pass "WebinarFuel parser exists" || check_fail "WebinarFuel parser missing"

echo ""
echo "4. Running TypeScript Check..."
echo "-------------------------------"

if npm run build > /tmp/build.log 2>&1; then
    check_pass "Production build successful"
else
    check_fail "Production build failed"
    echo "   Check /tmp/build.log for details"
fi

echo ""
echo "5. Checking Dependencies..."
echo "---------------------------"

if [ -d "node_modules" ]; then
    check_pass "node_modules installed"
    
    # Check critical packages
    [ -d "node_modules/next" ] && check_pass "Next.js installed" || check_fail "Next.js not installed"
    [ -d "node_modules/@anthropic-ai/sdk" ] && check_pass "Anthropic SDK installed" || check_fail "Anthropic SDK not installed"
    [ -d "node_modules/next-auth" ] && check_pass "NextAuth.js installed" || check_fail "NextAuth.js not installed"
    [ -d "node_modules/@vercel/postgres" ] && check_pass "Vercel Postgres installed" || check_fail "Vercel Postgres not installed"
else
    check_fail "node_modules not found - run 'npm install'"
fi

echo ""
echo "6. Checking Documentation..."
echo "----------------------------"

[ -f "README.md" ] && check_pass "README.md exists" || check_warn "README.md missing"
[ -f "QUICKSTART.md" ] && check_pass "QUICKSTART.md exists" || check_warn "QUICKSTART.md missing"
[ -f "PROJECT_SUMMARY.md" ] && check_pass "PROJECT_SUMMARY.md exists" || check_warn "PROJECT_SUMMARY.md missing"

echo ""
echo "7. Security Checks..."
echo "---------------------"

# Check if .env.local is in .gitignore
if grep -q ".env" .gitignore; then
    check_pass ".env files in .gitignore"
else
    check_fail ".env files NOT in .gitignore - SECURITY RISK!"
fi

# Warn about default credentials
if grep -q "cashflow2025" app/api/auth/*/route.ts 2>/dev/null; then
    check_warn "Default admin password detected - CHANGE IN PRODUCTION!"
fi

echo ""
echo "=================================================="
echo "Validation Summary"
echo "=================================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub: git push origin main"
    echo "2. Import to Vercel: vercel.com"
    echo "3. Add environment variables in Vercel dashboard"
    echo "4. Create Vercel Postgres database"
    echo "5. Run db/schema.sql on production database"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Validation passed with $WARNINGS warnings${NC}"
    echo "Review warnings above before deploying"
    exit 0
else
    echo -e "${RED}✗ Validation failed with $ERRORS errors and $WARNINGS warnings${NC}"
    echo "Fix errors above before deploying"
    exit 1
fi
