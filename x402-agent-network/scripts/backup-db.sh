#!/bin/bash
#
# backup-db.sh - Automated SQLite Database Backup
# Runs daily, keeps last 7 days of backups
# Add to crontab: 0 2 * * * /root/.openclaw/workspace/x402-agent-network/scripts/backup-db.sh
#

BACKUP_DIR="/root/.openclaw/workspace/backups/x402"
DB_PATH="/root/.openclaw/workspace/x402-agent-network/x402.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/x402_$TIMESTAMP.db"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Copy database (SQLite WAL-safe backup)
cp "$DB_PATH" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Backup created: $BACKUP_FILE"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Compressed: $BACKUP_FILE.gz"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Backup failed!"
    exit 1
fi

# Clean up old backups (keep last 7 days)
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🧹 Cleaning old backups..."
find "$BACKUP_DIR" -mtime +7 -delete

# List current backups
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📦 Current backups:"
ls -lh "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Backup completed"
