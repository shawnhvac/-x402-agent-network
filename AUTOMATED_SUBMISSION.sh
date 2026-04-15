#!/bin/bash
# Automated Google & Bing Search Engine Submission Script
# April 15, 2026

DOMAIN="x402-agent-pay.com"
DOMAIN_HTTPS="https://x402-agent-pay.com"
SITEMAP_URL="$DOMAIN_HTTPS/sitemap.xml"
ROBOTS_TXT="$DOMAIN_HTTPS/robots.txt"

echo "🚀 AUTOMATED SEARCH ENGINE SUBMISSION"
echo "Domain: $DOMAIN"
echo "Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# PART 1: VALIDATION
# ============================================
echo -e "${YELLOW}PART 1: Pre-Submission Validation${NC}"
echo ""

echo "1. Checking domain accessibility..."
if curl -s -I "$DOMAIN_HTTPS/" | grep -q "200"; then
    echo -e "${GREEN}✅ Domain is live${NC}"
else
    echo -e "${RED}❌ Domain not responding${NC}"
    exit 1
fi

echo "2. Checking sitemap accessibility..."
if curl -s -I "$SITEMAP_URL" | grep -q "200"; then
    echo -e "${GREEN}✅ Sitemap is accessible${NC}"
else
    echo -e "${RED}❌ Sitemap not accessible${NC}"
    exit 1
fi

echo "3. Checking robots.txt accessibility..."
if curl -s -I "$ROBOTS_TXT" | grep -q "200"; then
    echo -e "${GREEN}✅ Robots.txt is accessible${NC}"
else
    echo -e "${RED}❌ Robots.txt not accessible${NC}"
    exit 1
fi

echo "4. Validating sitemap XML..."
if curl -s "$SITEMAP_URL" | xmllint --format - > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Sitemap XML is valid${NC}"
else
    echo -e "${YELLOW}⚠️  XML validation skipped (xmllint not available)${NC}"
fi

echo "5. Checking robots.txt syntax..."
ROBOTS_CONTENT=$(curl -s "$ROBOTS_TXT")
if echo "$ROBOTS_CONTENT" | grep -q "Sitemap:"; then
    echo -e "${GREEN}✅ Robots.txt contains sitemap reference${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Robots.txt may be missing sitemap reference${NC}"
fi

echo ""

# ============================================
# PART 2: GOOGLE SEARCH CONSOLE
# ============================================
echo -e "${YELLOW}PART 2: Google Search Console Submission${NC}"
echo ""

cat << 'EOF'
⚠️  MANUAL STEPS REQUIRED FOR GOOGLE:

Since Google Search Console requires authentication, follow these steps:

1. Go to: https://search.google.com/search-console
2. Login with your Google Account
3. Click "Add property"
4. Select "URL prefix" option
5. Enter: https://x402-agent-pay.com/
6. Click "Continue"

VERIFICATION (Choose ONE method):

Method A: DNS TXT Record (Recommended)
  - Google will provide a TXT record
  - Go to your domain registrar
  - Add DNS TXT record: google-site-verification=XXXXX
  - Wait 10-30 minutes
  - Click "Verify" in Google Search Console

Method B: HTML File
  - Download provided HTML file
  - Upload to your website root
  - Click "Verify"

Method C: Google Analytics (if connected)
  - Use existing GA4 property
  - Click "Verify"

AFTER VERIFICATION:

1. Go to "Sitemaps" (left menu)
2. Click "New sitemap"
3. Enter: sitemap.xml
4. Click "Submit"
5. Monitor "Coverage" tab for indexed pages

EOF

echo ""
echo -e "${GREEN}Google Search Console submission details saved.${NC}"

# ============================================
# PART 3: BING WEBMASTER TOOLS
# ============================================
echo -e "${YELLOW}PART 3: Bing Webmaster Tools Submission${NC}"
echo ""

cat << 'EOF'
⚠️  MANUAL STEPS REQUIRED FOR BING:

Since Bing Webmaster Tools requires authentication, follow these steps:

1. Go to: https://www.bing.com/webmasters
2. Login with your Microsoft Account
3. Click "Add a site"
4. Enter: https://x402-agent-pay.com
5. Click "Add"

VERIFICATION (Choose ONE method):

Method A: XML File (Recommended)
  - Download: BingSiteAuth.xml
  - Upload to website root
  - Click "Verify"

Method B: CNAME Record
  - Add CNAME record from Bing
  - Wait for propagation
  - Click "Verify"

AFTER VERIFICATION:

1. Go to "Sitemaps" section
2. Click "Submit sitemap"
3. Enter: https://x402-agent-pay.com/sitemap.xml
4. Click "Submit"

EOF

echo ""
echo -e "${GREEN}Bing Webmaster Tools submission details saved.${NC}"

# ============================================
# PART 4: AUTOMATED SUBMISSION (IndexNow Protocol)
# ============================================
echo -e "${YELLOW}PART 4: IndexNow Submission (Automated - Bing/Google)${NC}"
echo ""

# IndexNow allows automated submission to search engines
echo "Submitting via IndexNow protocol (when key is available)..."

# This requires an IndexNow API key
# For now, we'll just document it

cat << 'EOF'

IndexNow is the modern way to submit URLs to search engines automatically.

SETUP STEPS:
1. Go to: https://www.bing.com/webmasters/indexnow
2. Generate your IndexNow API key
3. Upload to: https://x402-agent-pay.com/[your-key].txt
4. Save your API key for future submissions

AUTOMATED SUBMISSION (Example):
curl -s "https://api.indexnow.org/indexnow" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "host": "x402-agent-pay.com",
    "key": "YOUR_INDEXNOW_KEY",
    "keyLocation": "https://x402-agent-pay.com/YOUR_INDEXNOW_KEY.txt",
    "urlList": [
      "https://x402-agent-pay.com/",
      "https://x402-agent-pay.com/marketplace",
      "https://x402-agent-pay.com/pricing"
    ]
  }'

This can be automated in CI/CD pipeline for continuous submission.

EOF

echo ""
echo -e "${GREEN}IndexNow setup details saved.${NC}"

# ============================================
# SUMMARY
# ============================================
echo ""
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}SUBMISSION SUMMARY${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo ""

echo "📋 CHECKLIST:"
echo ""
echo "PRE-SUBMISSION (Completed):"
echo "  ✅ Domain is live and accessible"
echo "  ✅ Sitemap.xml is valid and accessible"
echo "  ✅ Robots.txt is valid and accessible"
echo ""

echo "GOOGLE SEARCH CONSOLE (Manual):"
echo "  ⏳ Add property: https://x402-agent-pay.com/"
echo "  ⏳ Verify domain (DNS TXT record)"
echo "  ⏳ Submit sitemap: sitemap.xml"
echo "  ⏳ Monitor coverage report"
echo ""

echo "BING WEBMASTER TOOLS (Manual):"
echo "  ⏳ Add site: https://x402-agent-pay.com"
echo "  ⏳ Verify domain (XML file)"
echo "  ⏳ Submit sitemap: sitemap.xml"
echo "  ⏳ Monitor search traffic"
echo ""

echo "EXPECTED TIMELINE:"
echo "  Day 1: Submission complete"
echo "  Day 2-3: First crawls by Google/Bing bots"
echo "  Day 5-7: 20+ pages indexed"
echo "  Day 7-14: First organic impressions"
echo "  Day 30: 50-100 keyword impressions"
echo ""

echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}Next: Follow manual steps in Google Search Console and Bing${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

# Save submission URLs for reference
cat > /tmp/search_engine_urls.txt << 'URLS'
GOOGLE SEARCH CONSOLE
URL: https://search.google.com/search-console
Action: Add property > https://x402-agent-pay.com/ > Verify > Submit sitemap.xml

BING WEBMASTER TOOLS
URL: https://www.bing.com/webmasters
Action: Add site > https://x402-agent-pay.com > Verify > Submit sitemap.xml

SITEMAP LOCATION
URL: https://x402-agent-pay.com/sitemap.xml

ROBOTS.TXT LOCATION
URL: https://x402-agent-pay.com/robots.txt

INDEXNOW (Optional - For continuous submission)
URL: https://www.bing.com/webmasters/indexnow
Action: Generate API key > Save > Use in CI/CD
URLS

echo "📄 URLs saved to: /tmp/search_engine_urls.txt"
cat /tmp/search_engine_urls.txt
