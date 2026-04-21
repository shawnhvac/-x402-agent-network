#!/usr/bin/env python3
"""
X (Twitter) login using Playwright
"""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    # Load credentials
    creds_path = Path(__file__).parent.parent / ".credentials" / "x-elonmuskoxnft.json"
    with open(creds_path) as f:
        creds = json.load(f)

    username = creds["username"]
    password = creds["password"]

    async with async_playwright() as p:
        print("🚀 Launching browser...")
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        try:
            print("🔐 Navigating to X login...")
            await page.goto('https://x.com/login', timeout=30000)
            await page.wait_for_load_state('networkidle')

            print("📝 Entering username...")
            # Wait for username field and enter
            await page.fill('input[autocomplete="username"]', username)
            await page.click('button:has-text("Next")')
            await page.wait_for_timeout(2000)

            print("🔑 Entering password...")
            # Wait for password field and enter
            await page.fill('input[type="password"]', password)
            await page.click('button:has-text("Log in")')
            
            # Wait for login to complete
            await page.wait_for_url('https://x.com/home', timeout=15000)
            
            print("✅ Login successful!")

            # Save cookies
            cookies = await context.cookies()
            cookies_path = Path(__file__).parent.parent / ".credentials" / "x_playwright_cookies.json"
            with open(cookies_path, 'w') as f:
                json.dump(cookies, f, indent=2)
            print(f"💾 Cookies saved to {cookies_path}")

            # Get account info
            await page.goto('https://x.com/elonmuskoxnft')
            await page.wait_for_load_state('networkidle')
            
            print("\n📊 Account visible - ready for automation!")
            print("   URL: https://x.com/elonmuskoxnft")

        except Exception as e:
            print(f"❌ Error: {e}")
            # Take screenshot for debugging
            await page.screenshot(path='/root/.openclaw/workspace/x_error.png')
            print("📸 Error screenshot saved to x_error.png")
            raise

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
