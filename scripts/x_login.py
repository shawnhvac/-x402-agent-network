#!/usr/bin/env python3
"""
X (Twitter) login script using twikit
"""
import asyncio
import json
import sys
from pathlib import Path
from twikit import Client

async def main():
    # Load credentials
    creds_path = Path(__file__).parent.parent / ".credentials" / "x-elonmuskoxnft.json"
    with open(creds_path) as f:
        creds = json.load(f)

    username = creds["username"]
    password = creds["password"]

    # Initialize client
    client = Client('en-US')

    try:
        print(f"🔐 Logging into X as @elonmuskoxnft...")
        
        # Login
        await client.login(
            auth_info_1=username,
            password=password
        )
        
        print("✅ Login successful!")
        
        # Save cookies for future use
        cookies_path = Path(__file__).parent.parent / ".credentials" / "x_cookies.json"
        client.save_cookies(str(cookies_path))
        print(f"💾 Cookies saved to {cookies_path}")
        
        # Get user info
        user = await client.user()
        print(f"\n📊 Account Info:")
        print(f"   Handle: @{user.screen_name}")
        print(f"   Name: {user.name}")
        print(f"   Followers: {user.followers_count:,}")
        print(f"   Following: {user.friends_count:,}")
        print(f"   Tweets: {user.statuses_count:,}")
        
    except Exception as e:
        print(f"❌ Login failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
