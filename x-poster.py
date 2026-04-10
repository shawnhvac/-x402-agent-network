#!/usr/bin/env python3
"""
X (Twitter) Automated Poster for @elonmuskoxnft
"""
import tweepy
import json
from pathlib import Path

CREDS_FILE = Path(__file__).parent / ".credentials/x-api.json"
QUEUE_FILE = Path(__file__).parent / "x-post-queue.json"

def load_credentials():
    with open(CREDS_FILE) as f:
        return json.load(f)

def init_client():
    creds = load_credentials()
    auth = tweepy.OAuthHandler(creds['consumer_key'], creds['consumer_secret'])
    auth.set_access_token(creds['access_token'], creds['access_token_secret'])
    return tweepy.API(auth)

def post_tweet(text):
    """Post a single tweet"""
    try:
        client = init_client()
        status = client.update_status(text)
        return {
            'success': True,
            'id': status.id,
            'text': status.text,
            'url': f"https://x.com/elonmuskoxnft/status/{status.id}"
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def post_reply(tweet_id, text):
    """Reply to a tweet"""
    try:
        client = init_client()
        status = client.update_status(text, in_reply_to_status_id=tweet_id)
        return {
            'success': True,
            'id': status.id,
            'text': status.text
        }
    except Exception as e:
        return {'success': False, 'error': str(e)}

def like_tweet(tweet_id):
    """Like a tweet"""
    try:
        client = init_client()
        client.create_favorite(id=tweet_id)
        return {'success': True, 'id': tweet_id}
    except Exception as e:
        return {'success': False, 'error': str(e)}

def retweet(tweet_id):
    """Retweet a tweet"""
    try:
        client = init_client()
        client.retweet(id=tweet_id)
        return {'success': True, 'id': tweet_id}
    except Exception as e:
        return {'success': False, 'error': str(e)}

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: x-poster.py <command> [args]")
        print("  post <text>")
        print("  reply <tweet_id> <text>")
        print("  like <tweet_id>")
        print("  retweet <tweet_id>")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == 'post':
        text = ' '.join(sys.argv[2:])
        result = post_tweet(text)
        print(json.dumps(result, indent=2))
    
    elif cmd == 'reply':
        tweet_id = sys.argv[2]
        text = ' '.join(sys.argv[3:])
        result = post_reply(tweet_id, text)
        print(json.dumps(result, indent=2))
    
    elif cmd == 'like':
        tweet_id = sys.argv[2]
        result = like_tweet(tweet_id)
        print(json.dumps(result, indent=2))
    
    elif cmd == 'retweet':
        tweet_id = sys.argv[2]
        result = retweet(tweet_id)
        print(json.dumps(result, indent=2))
    
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
