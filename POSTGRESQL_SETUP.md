# PostgreSQL Setup Guide for LaborTrack

This guide provides PostgreSQL-specific setup instructions for your deployment.

## 📋 Prerequisites

Your VPS needs:
- Ubuntu/Debian or similar Linux distribution
- PostgreSQL 12+ installed
- PHP with PostgreSQL extensions (`pdo_pgsql`, `pgsql`)

## 🚀 PostgreSQL Installation

### On Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PHP PostgreSQL extensions
sudo apt install php8.4-pgsql -y

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
psql --version
```

### On CentOS/RHEL

```bash
# Install PostgreSQL
sudo dnf install postgresql-server postgresql-contrib -y

# Initialize database
sudo postgresql-setup --initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install PHP PostgreSQL extensions
sudo dnf install php-pgsql -y
```

## 🔧 Database Setup

### Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL prompt:
CREATE DATABASE labortrack;
CREATE USER labortrack_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE labortrack TO labortrack_user;

# Grant additional privileges (PostgreSQL 15+)
\c labortrack
GRANT ALL ON SCHEMA public TO labortrack_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO labortrack_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO labortrack_user;

# Exit
\q
```

### Test Connection

```bash
# Test connection
psql -h 127.0.0.1 -U labortrack_user -d labortrack

# You should be able to connect
# Exit with: \q
```

## 🔐 PostgreSQL Configuration

### Allow Password Authentication

Edit PostgreSQL configuration:

```bash
# Find your pg_hba.conf location
sudo -u postgres psql -c "SHOW hba_file;"

# Common locations:
# Ubuntu/Debian: /etc/postgresql/*/main/pg_hba.conf
# CentOS/RHEL: /var/lib/pgsql/data/pg_hba.conf

# Edit the file
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Add or modify this line (before other rules):

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   labortrack      labortrack_user                         md5
host    labortrack      labortrack_user 127.0.0.1/32           md5
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### Optional: Performance Tuning

Edit `postgresql.conf`:

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Recommended settings for small-medium apps:

```conf
# Memory
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Connections
max_connections = 100

# Logging (useful for debugging)
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'all'  # Change to 'ddl' or 'none' in production
log_duration = on
```

Restart after changes:

```bash
sudo systemctl restart postgresql
```

## 📝 Laravel .env Configuration

Create or edit `~/labortrack/shared/.env`:

```env
# Database Configuration - PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=labortrack
DB_USERNAME=labortrack_user
DB_PASSWORD=your_secure_password_here

# Use database for sessions and cache
SESSION_DRIVER=database
CACHE_STORE=database
CACHE_PREFIX=labortrack_
```

## 🔄 Database Backup & Restore

### Automated Daily Backup

Create a backup script:

```bash
nano ~/labortrack/backup-database.sh
```

Add this content:

```bash
#!/bin/bash

# Configuration
DB_NAME="labortrack"
DB_USER="labortrack_user"
BACKUP_DIR="$HOME/labortrack/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/labortrack_$DATE.sql.gz"
KEEP_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup
pg_dump -h 127.0.0.1 -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_FILE"
    
    # Remove old backups
    find "$BACKUP_DIR" -name "labortrack_*.sql.gz" -mtime +$KEEP_DAYS -delete
    echo "Old backups removed (older than $KEEP_DAYS days)"
else
    echo "Backup failed!"
    exit 1
fi
```

Make it executable:

```bash
chmod +x ~/labortrack/backup-database.sh
```

### Setup Cron Job for Automated Backups

```bash
# Edit crontab
crontab -e

# Add this line (backup daily at 2 AM)
0 2 * * * /home/yourusername/labortrack/backup-database.sh >> /home/yourusername/labortrack/backups/backup.log 2>&1
```

### Manual Backup

```bash
# Simple backup
pg_dump -h 127.0.0.1 -U labortrack_user labortrack > backup.sql

# Compressed backup
pg_dump -h 127.0.0.1 -U labortrack_user labortrack | gzip > backup.sql.gz

# Custom format (allows parallel restore)
pg_dump -h 127.0.0.1 -U labortrack_user -Fc labortrack > backup.dump
```

### Restore Database

```bash
# From SQL file
psql -h 127.0.0.1 -U labortrack_user labortrack < backup.sql

# From compressed file
gunzip -c backup.sql.gz | psql -h 127.0.0.1 -U labortrack_user labortrack

# From custom format
pg_restore -h 127.0.0.1 -U labortrack_user -d labortrack backup.dump

# If you need to drop and recreate first:
dropdb -h 127.0.0.1 -U labortrack_user labortrack
createdb -h 127.0.0.1 -U labortrack_user labortrack
psql -h 127.0.0.1 -U labortrack_user labortrack < backup.sql
```

## 🔍 Useful PostgreSQL Commands

### Connect to Database

```bash
# As labortrack_user
psql -h 127.0.0.1 -U labortrack_user -d labortrack

# As postgres superuser
sudo -u postgres psql
```

### Inside psql:

```sql
-- List all databases
\l

-- Connect to database
\c labortrack

-- List all tables
\dt

-- Describe table
\d table_name

-- Show table size
SELECT pg_size_pretty(pg_total_relation_size('table_name'));

-- Show database size
SELECT pg_size_pretty(pg_database_size('labortrack'));

-- List all users
\du

-- Show current user
SELECT current_user;

-- Show active connections
SELECT * FROM pg_stat_activity WHERE datname = 'labortrack';

-- Kill a connection (if needed)
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = 12345;

-- Exit
\q
```

### Monitoring

```bash
# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Check active connections
psql -h 127.0.0.1 -U labortrack_user -d labortrack -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'labortrack';"

# Check database size
psql -h 127.0.0.1 -U labortrack_user -d labortrack -c "SELECT pg_size_pretty(pg_database_size('labortrack'));"
```

## 🐛 Troubleshooting

### Connection Refused

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if it's listening
sudo netstat -plnt | grep 5432

# Start if not running
sudo systemctl start postgresql
```

### Authentication Failed

1. Check `pg_hba.conf` configuration
2. Verify user exists:
   ```bash
   sudo -u postgres psql -c "\du"
   ```
3. Reset password if needed:
   ```bash
   sudo -u postgres psql
   ALTER USER labortrack_user WITH PASSWORD 'new_password';
   ```

### Permission Denied

```bash
# Grant all privileges
sudo -u postgres psql
\c labortrack
GRANT ALL ON SCHEMA public TO labortrack_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO labortrack_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO labortrack_user;
```

### Laravel Migration Errors

```bash
# Check if database exists
psql -h 127.0.0.1 -U labortrack_user -l | grep labortrack

# Test connection from Laravel
cd ~/labortrack/current
php artisan tinker
# Inside tinker:
DB::connection()->getPdo();
```

## 📊 Performance Monitoring

### Check Slow Queries

Enable slow query logging in `postgresql.conf`:

```conf
log_min_duration_statement = 1000  # Log queries slower than 1 second
```

View slow queries:

```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log | grep "duration:"
```

### Analyze Table Performance

```sql
-- Inside psql
ANALYZE VERBOSE table_name;

-- Get query plan
EXPLAIN ANALYZE SELECT * FROM table_name WHERE condition;
```

## 🔒 Security Best Practices

1. **Use strong passwords**
   ```bash
   # Generate strong password
   openssl rand -base64 32
   ```

2. **Limit network access** in `pg_hba.conf`:
   ```
   host    labortrack    labortrack_user    127.0.0.1/32    md5
   ```

3. **Regular updates**:
   ```bash
   sudo apt update
   sudo apt upgrade postgresql
   ```

4. **Regular backups** (see backup section above)

5. **Monitor logs**:
   ```bash
   sudo tail -f /var/log/postgresql/postgresql-14-main.log
   ```

## 📚 Additional Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [Laravel Database Documentation](https://laravel.com/docs/database)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [PgTune - PostgreSQL Configuration Calculator](https://pgtune.leopard.in.ua/)

## ✅ Quick Setup Checklist

- [ ] PostgreSQL installed and running
- [ ] PHP PostgreSQL extensions installed
- [ ] Database `labortrack` created
- [ ] User `labortrack_user` created with password
- [ ] Privileges granted to user
- [ ] `pg_hba.conf` configured for password authentication
- [ ] Connection tested successfully
- [ ] `.env` file configured with PostgreSQL credentials
- [ ] Backup script created and tested
- [ ] Cron job for automated backups configured

---

Once you complete this setup, your PostgreSQL database will be ready for the LaborTrack deployment! 🎉
