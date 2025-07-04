# 🔐 Database Safety & Backup Guide

This guide provides comprehensive strategies to keep your school management system database safe and recoverable.

## 📋 Table of Contents

- [Quick Answer](#quick-answer)
- [Manual Backup Strategies](#manual-backup-strategies)
- [Automated Backup Solutions](#automated-backup-solutions)
- [Cloud Storage Integration](#cloud-storage-integration)
- [Complete Restoration Process](#complete-restoration-process)
- [Data Verification](#data-verification)
- [Advanced Safety Measures](#advanced-safety-measures)
- [Backup Schedule](#backup-schedule)
- [Emergency Recovery Plan](#emergency-recovery-plan)
- [Backup Scripts](#backup-scripts)

## 🎯 Quick Answer

**For data safety, uploading the `.db` file to Google Drive works perfectly!** Here's the simple process:

### Backup Process:
```bash
# Copy database to safe location
cp backend/school.db ~/Desktop/school_backup_$(date +%Y%m%d).db
# Upload to Google Drive manually
```

### Restore Process:
```bash
# Clone repository
git clone <your-repo-url>
cd Brilliant_school

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Download school.db from Google Drive and place in backend/
cp ~/Downloads/school.db backend/school.db

# Start servers
cd backend && npm start  # Terminal 1
cd frontend && npm start # Terminal 2
```

---

## 💾 Manual Backup Strategies

### 1. Direct File Backup
```bash
# Create timestamped backup
cp backend/school.db ~/Desktop/school_backup_$(date +%Y%m%d_%H%M%S).db

# Create weekly backup
cp backend/school.db ~/Desktop/school_backup_week_$(date +%U).db

# Create monthly backup
cp backend/school.db ~/Desktop/school_backup_month_$(date +%m_%Y).db
```

### 2. SQL Export Backup (Recommended)
```bash
# Export entire database to SQL file
sqlite3 backend/school.db .dump > backup_$(date +%Y%m%d).sql

# Export specific tables
sqlite3 backend/school.db "SELECT sql FROM sqlite_master WHERE type='table';" > schema_backup.sql
sqlite3 backend/school.db ".dump students" > students_backup.sql
sqlite3 backend/school.db ".dump transactions" > transactions_backup.sql
sqlite3 backend/school.db ".dump towns" > towns_backup.sql
```

### 3. Compressed Backup
```bash
# Create compressed backup
tar -czf school_backup_$(date +%Y%m%d).tar.gz backend/school.db

# Create encrypted compressed backup
tar -czf - backend/school.db | gpg -c > school_backup_$(date +%Y%m%d).tar.gz.gpg
```

---

## 🤖 Automated Backup Solutions

### 1. Git Backup Branch (Data-Only)
```bash
# Create orphan branch for data backups
git checkout --orphan data-backup
git rm -rf .
cp backend/school.db ./school.db
git add school.db
git commit -m "Database backup $(date)"
git push origin data-backup

# Switch back to main development
git checkout dev
```

### 2. Daily Backup Script
Create `scripts/backup_database.sh`:
```bash
#!/bin/bash
# Daily automated backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/school_backups"
DB_PATH="backend/school.db"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "Error: Database file not found at $DB_PATH"
    exit 1
fi

echo "Starting backup process: $DATE"

# 1. Copy database file
cp "$DB_PATH" "$BACKUP_DIR/school_${DATE}.db"
echo "✅ Database file copied"

# 2. Export as SQL
sqlite3 "$DB_PATH" .dump > "$BACKUP_DIR/school_${DATE}.sql"
echo "✅ SQL export completed"

# 3. Create compressed backup
tar -czf "$BACKUP_DIR/school_${DATE}.tar.gz" "$DB_PATH"
echo "✅ Compressed backup created"

# 4. Generate checksum
md5sum "$DB_PATH" > "$BACKUP_DIR/school_${DATE}.md5"
echo "✅ Checksum generated"

# 5. Cleanup old backups (keep last 30 days)
find "$BACKUP_DIR" -name "school_*.db" -mtime +30 -delete
find "$BACKUP_DIR" -name "school_*.sql" -mtime +30 -delete
find "$BACKUP_DIR" -name "school_*.tar.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "school_*.md5" -mtime +30 -delete
echo "✅ Old backups cleaned up"

echo "Backup completed successfully: $DATE"
echo "Backup location: $BACKUP_DIR"
```

Make it executable:
```bash
chmod +x scripts/backup_database.sh
```

### 3. Cron Job Setup (Linux/macOS)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/Brilliant_school/scripts/backup_database.sh

# Add weekly backup on Sunday at 3 AM
0 3 * * 0 /path/to/Brilliant_school/scripts/backup_database.sh

# List current cron jobs
crontab -l
```

---

## ☁️ Cloud Storage Integration

### 1. Google Drive Sync
```bash
# Manual upload using Google Drive CLI (if installed)
gdrive upload backup_$(date +%Y%m%d).sql

# Sync backup folder with Google Drive desktop app
rsync -av "$HOME/school_backups/" "$HOME/Google Drive/SchoolDB_Backups/"
```

### 2. Multiple Cloud Providers Setup
```bash
# Create cloud sync script
#!/bin/bash
BACKUP_FILE="school_backup_$(date +%Y%m%d).sql"

# Export database
sqlite3 backend/school.db .dump > "$BACKUP_FILE"

# Copy to multiple cloud folders
cp "$BACKUP_FILE" "$HOME/Google Drive/SchoolDB_Backups/"
cp "$BACKUP_FILE" "$HOME/Dropbox/SchoolDB_Backups/"
cp "$BACKUP_FILE" "$HOME/OneDrive/SchoolDB_Backups/"

echo "Backup synced to all cloud providers"
```

### 3. Cloud Storage Commands
```bash
# Google Drive (using gdrive CLI)
gdrive upload school_backup.sql

# Dropbox (using dropbox CLI)
dropbox upload school_backup.sql /SchoolDB_Backups/

# AWS S3 (using aws CLI)
aws s3 cp school_backup.sql s3://your-bucket/school-backups/

# Azure (using azure CLI)
az storage blob upload --file school_backup.sql --container backups
```

---

## 🔄 Complete Restoration Process

### Step 1: Clone Repository
```bash
# Clone your repository
git clone <your-repo-url>
cd Brilliant_school

# Check repository structure
ls -la
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install
echo "✅ Backend dependencies installed"

# Install frontend dependencies
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

# Return to project root
cd ..
```

### Step 3: Restore Database

#### Method A: Direct File Copy
```bash
# Download school.db from Google Drive to Downloads folder
# Then copy to backend directory
cp ~/Downloads/school.db backend/school.db
echo "✅ Database restored from backup file"
```

#### Method B: SQL Import (Recommended)
```bash
# Download the .sql backup file
# Import into new database
sqlite3 backend/school.db < ~/Downloads/backup_20250628.sql
echo "✅ Database restored from SQL backup"
```

#### Method C: Extract from Compressed Backup
```bash
# Extract from tar.gz backup
tar -xzf ~/Downloads/school_backup_20250628.tar.gz

# Copy extracted database
cp backend/school.db backend/school.db
echo "✅ Database restored from compressed backup"
```

### Step 4: Verify Restoration
```bash
# Check if database file exists
if [ -f "backend/school.db" ]; then
    echo "✅ Database file found"
else
    echo "❌ Database file missing"
    exit 1
fi

# Check database integrity
sqlite3 backend/school.db "PRAGMA integrity_check;"
```

### Step 5: Start Application
```bash
# Open two terminals

# Terminal 1 - Start Backend
cd backend
npm start

# Terminal 2 - Start Frontend
cd frontend
npm start
```

---

## ✅ Data Verification

### Database Integrity Check
```bash
# Connect to database
sqlite3 backend/school.db

# Check tables exist
.tables

# Verify table structures
.schema students
.schema transactions
.schema towns

# Check record counts
SELECT COUNT(*) as student_count FROM students;
SELECT COUNT(*) as transaction_count FROM transactions;
SELECT COUNT(*) as town_count FROM towns;

# Check for any corrupted data
PRAGMA integrity_check;

# Exit database
.quit
```

### Verification Script
Create `scripts/verify_database.sh`:
```bash
#!/bin/bash
DB_PATH="backend/school.db"

echo "🔍 Verifying database integrity..."

# Check if file exists
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Database file not found"
    exit 1
fi

# Check file size (should be > 0)
SIZE=$(stat -f%z "$DB_PATH" 2>/dev/null || stat -c%s "$DB_PATH" 2>/dev/null)
if [ "$SIZE" -eq 0 ]; then
    echo "❌ Database file is empty"
    exit 1
fi

echo "✅ Database file exists (Size: $SIZE bytes)"

# Check database integrity
INTEGRITY=$(sqlite3 "$DB_PATH" "PRAGMA integrity_check;")
if [ "$INTEGRITY" = "ok" ]; then
    echo "✅ Database integrity check passed"
else
    echo "❌ Database integrity check failed: $INTEGRITY"
    exit 1
fi

# Check table counts
STUDENTS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM students;")
TRANSACTIONS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM transactions;")
TOWNS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM towns;")

echo "📊 Database Statistics:"
echo "   Students: $STUDENTS"
echo "   Transactions: $TRANSACTIONS"
echo "   Towns: $TOWNS"

echo "✅ Database verification completed successfully"
```

---

## 🛡️ Advanced Safety Measures

### 1. Checksums for Integrity
```bash
# Create checksum
md5sum backend/school.db > school.db.md5

# Verify integrity
md5sum -c school.db.md5

# Alternative with SHA256
sha256sum backend/school.db > school.db.sha256
sha256sum -c school.db.sha256
```

### 2. Encrypted Backups
```bash
# Encrypt SQL backup
gpg -c backup_20250628.sql
# Creates: backup_20250628.sql.gpg

# Decrypt backup
gpg backup_20250628.sql.gpg
# Prompts for password and creates: backup_20250628.sql

# Encrypt database file
gpg -c backend/school.db
# Creates: school.db.gpg
```

### 3. Version Tags for Database States
```bash
# Tag important database milestones
git tag -a "db-v1.0" -m "Initial database setup with sample data"
git tag -a "db-v1.1" -m "Added course fees support"
git tag -a "db-v1.2" -m "Production data after first month"

# List all tags
git tag -l

# Push tags to remote
git push origin --tags
```

### 4. Database Schema Backup
```bash
# Export only schema (no data)
sqlite3 backend/school.db .schema > schema_backup.sql

# Export with CREATE statements
sqlite3 backend/school.db "
  SELECT sql FROM sqlite_master 
  WHERE type='table' AND name NOT LIKE 'sqlite_%';
" > tables_schema.sql
```

---

## 📅 Recommended Backup Schedule

| Frequency | Method | Storage Location | Retention |
|-----------|---------|------------------|-----------|
| **Real-time** | File copy before major changes | Local | 7 days |
| **Daily** | Automated script | Local + Google Drive | 30 days |
| **Weekly** | SQL export + compression | Multiple cloud providers | 12 weeks |
| **Monthly** | Full project backup | External drive + cloud | 12 months |
| **Quarterly** | Encrypted backup | Secure cloud storage | 2 years |

### Backup Automation Schedule
```bash
# Daily at 2 AM
0 2 * * * /path/to/backup_database.sh

# Weekly on Sunday at 3 AM
0 3 * * 0 /path/to/weekly_backup.sh

# Monthly on 1st at 4 AM
0 4 1 * * /path/to/monthly_backup.sh
```

---

## 🚨 Emergency Recovery Plan

### Scenario 1: Local Database Corrupted
```bash
# Step 1: Check for recent local backups
ls -la ~/school_backups/school_*.db

# Step 2: Restore from most recent backup
cp ~/school_backups/school_20250628_140000.db backend/school.db

# Step 3: Verify integrity
sqlite3 backend/school.db "PRAGMA integrity_check;"
```

### Scenario 2: No Local Backups Available
```bash
# Step 1: Download from Google Drive
# Go to Google Drive and download latest backup

# Step 2: Restore from cloud backup
cp ~/Downloads/school_backup_20250628.sql .
sqlite3 backend/school.db < school_backup_20250628.sql

# Step 3: Verify data
./scripts/verify_database.sh
```

### Scenario 3: Complete System Failure
```bash
# Step 1: Clone repository on new system
git clone <your-repo-url>
cd Brilliant_school

# Step 2: Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Step 3: Download backup from any cloud provider
# Restore using any available backup method

# Step 4: Verify and start
./scripts/verify_database.sh
npm start
```

### Recovery Priority Order:
1. **Most Recent Local Backup** (~/school_backups/)
2. **Google Drive Backup** (Primary cloud)
3. **Dropbox Backup** (Secondary cloud)
4. **OneDrive Backup** (Tertiary cloud)
5. **External Drive Backup** (Physical backup)
6. **Git Data Branch** (Version control backup)

---

## 📝 Backup Scripts

### Complete Backup Script
Create `scripts/complete_backup.sh`:
```bash
#!/bin/bash
# Complete backup solution

set -e  # Exit on any error

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="$PROJECT_DIR/backend/school.db"
BACKUP_DIR="$HOME/school_backups"
DATE=$(date +%Y%m%d_%H%M%S)
CLOUD_DIRS=(
    "$HOME/Google Drive/SchoolDB_Backups"
    "$HOME/Dropbox/SchoolDB_Backups"
    "$HOME/OneDrive/SchoolDB_Backups"
)

echo "🚀 Starting complete backup process..."
echo "📅 Date: $(date)"
echo "💾 Database: $DB_PATH"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Verify database exists and is valid
if [ ! -f "$DB_PATH" ]; then
    echo "❌ Error: Database file not found at $DB_PATH"
    exit 1
fi

echo "✅ Database file found"

# 2. Check database integrity
if ! sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
    echo "❌ Error: Database integrity check failed"
    exit 1
fi

echo "✅ Database integrity verified"

# 3. Create multiple backup formats
echo "📦 Creating backups..."

# Direct copy
cp "$DB_PATH" "$BACKUP_DIR/school_${DATE}.db"
echo "   ✅ Direct copy: school_${DATE}.db"

# SQL dump
sqlite3 "$DB_PATH" .dump > "$BACKUP_DIR/school_${DATE}.sql"
echo "   ✅ SQL export: school_${DATE}.sql"

# Compressed backup
tar -czf "$BACKUP_DIR/school_${DATE}.tar.gz" -C "$PROJECT_DIR" backend/school.db
echo "   ✅ Compressed: school_${DATE}.tar.gz"

# Checksum
md5sum "$DB_PATH" > "$BACKUP_DIR/school_${DATE}.md5"
echo "   ✅ Checksum: school_${DATE}.md5"

# 4. Copy to cloud directories
echo "☁️ Syncing to cloud storage..."
for CLOUD_DIR in "${CLOUD_DIRS[@]}"; do
    if [ -d "$CLOUD_DIR" ]; then
        cp "$BACKUP_DIR/school_${DATE}.sql" "$CLOUD_DIR/"
        echo "   ✅ Synced to: $(basename "$(dirname "$CLOUD_DIR")")"
    else
        echo "   ⚠️ Cloud directory not found: $CLOUD_DIR"
    fi
done

# 5. Cleanup old backups (keep 30 days)
echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -name "school_*.*" -mtime +30 -delete
echo "   ✅ Cleaned up backups older than 30 days"

# 6. Generate backup report
cat > "$BACKUP_DIR/backup_report_${DATE}.txt" << EOF
=================================
School Database Backup Report
=================================
Date: $(date)
Database: $DB_PATH
Backup Directory: $BACKUP_DIR

Files Created:
- school_${DATE}.db (Direct copy)
- school_${DATE}.sql (SQL export)
- school_${DATE}.tar.gz (Compressed)
- school_${DATE}.md5 (Checksum)

Database Statistics:
- Students: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM students;")
- Transactions: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM transactions;")
- Towns: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM towns;")
- File Size: $(ls -lh "$DB_PATH" | awk '{print $5}')

Backup Status: SUCCESS ✅
=================================
EOF

echo "📊 Backup report generated: backup_report_${DATE}.txt"
echo "🎉 Complete backup process finished successfully!"
echo "📂 Backup location: $BACKUP_DIR"
```

### Quick Restore Script
Create `scripts/quick_restore.sh`:
```bash
#!/bin/bash
# Quick database restore script

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="$PROJECT_DIR/backend/school.db"
BACKUP_DIR="$HOME/school_backups"

echo "🔄 Quick Database Restore"
echo "========================="

# Show available backups
echo "Available backups:"
ls -lt "$BACKUP_DIR"/school_*.sql | head -5

# Get latest backup
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/school_*.sql | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup files found in $BACKUP_DIR"
    exit 1
fi

echo "📁 Latest backup: $(basename "$LATEST_BACKUP")"
echo "📅 Created: $(date -r "$LATEST_BACKUP")"

# Confirm restore
read -p "Do you want to restore from this backup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled"
    exit 0
fi

# Backup current database
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "${DB_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Current database backed up"
fi

# Restore from backup
echo "🔄 Restoring database..."
sqlite3 "$DB_PATH" < "$LATEST_BACKUP"

# Verify restore
if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
    echo "✅ Database restored successfully"
    echo "📊 Records restored:"
    echo "   Students: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM students;")"
    echo "   Transactions: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM transactions;")"
    echo "   Towns: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM towns;")"
else
    echo "❌ Database restore failed - integrity check failed"
    exit 1
fi
```

---

## 🎯 Summary

Your Google Drive backup approach is excellent and will work perfectly! Here's what makes it effective:

### ✅ **Why Google Drive Works:**
- **Automatic Sync**: Files sync across devices
- **Version History**: Google Drive keeps file versions
- **Accessibility**: Available from anywhere
- **Reliability**: Google's infrastructure is highly reliable

### 🚀 **Enhanced Recommendations:**
1. **Use SQL exports** instead of just `.db` files (more portable)
2. **Automate daily backups** with the provided scripts
3. **Use multiple cloud providers** for redundancy
4. **Regular verification** of backup integrity
5. **Document your restore process** (this file!)

### 🔒 **Your Data Will Be Safe When You:**
- Keep multiple backup formats (SQL + DB file)
- Store in multiple locations (local + cloud)
- Test restore process regularly
- Use automated backup scripts
- Follow the emergency recovery plan

**Remember**: The best backup is the one you actually use consistently! 🎯
