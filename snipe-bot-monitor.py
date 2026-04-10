#!/usr/bin/env python3
"""
MUSKOX Snipe Bot Message Monitor
Logs all incoming messages to a file for real-time monitoring and support
"""

import asyncio
import json
from datetime import datetime
from pathlib import Path

# This would integrate with the Grammy bot to capture messages
# For now, we create a monitoring log file that can be tailed

LOG_FILE = Path('/root/.openclaw/workspace/snipe-bot-monitor.log')
QUESTIONS_FILE = Path('/root/.openclaw/workspace/snipe-bot-questions.jsonl')

def log_message(user_id, username, message_text, message_type='text'):
    """Log incoming message to monitoring file"""
    
    timestamp = datetime.utcnow().isoformat()
    
    log_entry = {
        'timestamp': timestamp,
        'user_id': user_id,
        'username': username,
        'message': message_text,
        'type': message_type,
        'is_command': message_text.startswith('/') if message_text else False,
        'command': message_text.split()[0] if message_text.startswith('/') else None
    }
    
    # Append to JSONL file
    with open(QUESTIONS_FILE, 'a') as f:
        f.write(json.dumps(log_entry) + '\n')
    
    # Also append to human-readable log
    with open(LOG_FILE, 'a') as f:
        if log_entry['is_command']:
            f.write(f"[{timestamp}] {username} ({user_id}): {message_text} [COMMAND]\n")
        else:
            f.write(f"[{timestamp}] {username} ({user_id}): {message_text} [QUESTION]\n")

def get_unanswered_questions(hours=1):
    """Retrieve unanswered questions from the last N hours"""
    
    if not QUESTIONS_FILE.exists():
        return []
    
    questions = []
    now = datetime.utcnow()
    
    with open(QUESTIONS_FILE, 'r') as f:
        for line in f:
            try:
                entry = json.loads(line.strip())
                timestamp = datetime.fromisoformat(entry['timestamp'])
                time_diff = (now - timestamp).total_seconds() / 3600
                
                # Only show non-command messages from last N hours
                if time_diff < hours and not entry['is_command']:
                    questions.append(entry)
            except:
                pass
    
    return questions

def print_recent_questions(limit=10):
    """Print recent unanswered questions"""
    
    questions = get_unanswered_questions(hours=24)
    
    if not questions:
        print("✅ No recent questions")
        return
    
    print(f"\n📋 Recent Questions (Last {limit}):\n")
    for i, q in enumerate(questions[-limit:], 1):
        timestamp = q['timestamp'].split('T')[1][:5]  # HH:MM
        print(f"{i}. [{timestamp}] {q['username']}: {q['message']}")
    
    print()

if __name__ == '__main__':
    # Initialize log files if they don't exist
    LOG_FILE.touch(exist_ok=True)
    QUESTIONS_FILE.touch(exist_ok=True)
    
    print("✅ MUSKOX Snipe Bot Monitor initialized")
    print(f"📝 Questions log: {QUESTIONS_FILE}")
    print(f"📝 Full log: {LOG_FILE}")
    print("\nTo tail questions: tail -f /root/.openclaw/workspace/snipe-bot-questions.jsonl")
    print("To tail all messages: tail -f /root/.openclaw/workspace/snipe-bot-monitor.log")
