# 🛠️ Deployment Commands Quick Reference

Common commands you'll need for managing your deployment.

## 🚀 Deployment

### Trigger Deployment
```bash
# Automatic: Push to main branch
git push origin main

# Manual: SSH into VPS and run
ssh user@your-vps-ip
cd ~/labortrack
bash deploy.sh
```

### Watch Deployment Progress
```bash
# On GitHub: Go to Actions tab
# https://github.com/your-username/your-repo/actions

# On VPS: Watch logs in real-time
ssh user@your-vps-ip
tail -f ~/labortrack/shared/storage/logs/laravel.log
```

## 🔄 Rollback

### Automatic Rollback
- Happens automatically if deployment fails
- Previous release is restored

### Manual Rollback
```bash
ssh user@your-vps-ip
cd ~/labortrack

# List available releases
ls -lt releases/

# Rollback to specific release
ln -sfn releases/YYYYMMDDHHMMSS current

# Reload services
sudo systemctl reload php8.4-fpm
cd current && php artisan queue:restart
```

## 📋 Maintenance

### View Logs
```bash
# Laravel application logs
tail -f ~/labortrack/shared/storage/logs/laravel.log

# Last 100 lines
tail -n 100 ~/labortrack/shared/storage/logs/laravel.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# PHP-FPM logs
sudo tail -f /var/log/php8.4-fpm.log
```

### Clear Cache
```bash
cd ~/labortrack/current
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Run Migrations
```bash
cd ~/labortrack/current
php artisan migrate --force

# With seeding
php artisan migrate:fresh --seed --force
```

### Optimize Application
```bash
cd ~/labortrack/current
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🔍 Diagnostics

### Check Application Status
```bash
# Check if site is up
curl -I https://your-domain.com

# Check specific endpoint
curl https://your-domain.com/api/health

# PHP version
php -v

# Laravel version
cd ~/labortrack/current
php artisan --version
```

### Check Services
```bash
# PHP-FPM status
sudo systemctl status php8.4-fpm

# Nginx status
sudo systemctl status nginx

# Restart services if needed
sudo systemctl restart php8.4-fpm
sudo systemctl restart nginx
```

### Check Disk Space
```bash
# Overall disk usage
df -h

# Directory size
du -sh ~/labortrack/*
du -sh ~/labortrack/releases/*

# Find large files
find ~/labortrack -type f -size +50M -exec ls -lh {} \;
```

### Check Permissions
```bash
# Storage permissions
ls -la ~/labortrack/shared/storage

# Fix permissions if needed
sudo chown -R www-data:www-data ~/labortrack/current
sudo chown -R www-data:www-data ~/labortrack/shared/storage
chmod -R 775 ~/labortrack/shared/storage
```

## 🗑️ Cleanup

### Clean Old Releases
```bash
# Automatic: deploy.sh keeps last 5 releases
# Manual: Remove specific release
cd ~/labortrack/releases
rm -rf YYYYMMDDHHMMSS

# Remove all but last 3 releases
cd ~/labortrack/releases
ls -t | tail -n +4 | xargs rm -rf
```

### Clean Logs
```bash
# Clear old logs (keeps last 7 days)
find ~/labortrack/shared/storage/logs -name "*.log" -mtime +7 -delete

# Truncate current log
> ~/labortrack/shared/storage/logs/laravel.log
```

### Clean Cache
```bash
cd ~/labortrack/current

# Clear all Laravel caches
php artisan optimize:clear

# Clear specific caches
php artisan cache:forget key_name
```

## 🔐 Environment Management

### Update Environment Variables
```bash
# Edit .env
nano ~/labortrack/shared/.env

# After changes, recache config
cd ~/labortrack/current
php artisan config:cache

# Restart services
sudo systemctl reload php8.4-fpm
```

### Backup .env
```bash
cp ~/labortrack/shared/.env ~/labortrack/shared/.env.backup.$(date +%Y%m%d)
```

## 🗄️ Database

### Backup Database (PostgreSQL)
```bash
# Create backup
pg_dump -h 127.0.0.1 -U labortrack_user labortrack > ~/labortrack/backups/labortrack_$(date +%Y%m%d_%H%M%S).sql

# Or with compression
pg_dump -h 127.0.0.1 -U labortrack_user labortrack | gzip > ~/labortrack/backups/labortrack_$(date +%Y%m%d_%H%M%S).sql.gz

# Create backup directory if needed
mkdir -p ~/labortrack/backups
```

### Restore Database (PostgreSQL)
```bash
# From SQL file
psql -h 127.0.0.1 -U labortrack_user labortrack < ~/labortrack/backups/labortrack_YYYYMMDD_HHMMSS.sql

# From compressed file
gunzip -c ~/labortrack/backups/labortrack_YYYYMMDD_HHMMSS.sql.gz | psql -h 127.0.0.1 -U labortrack_user labortrack

# Drop and recreate database first (careful!)
dropdb -h 127.0.0.1 -U labortrack_user labortrack
createdb -h 127.0.0.1 -U labortrack_user labortrack
psql -h 127.0.0.1 -U labortrack_user labortrack < backup.sql
```

### Check Database Status
```bash
# PostgreSQL service status
sudo systemctl status postgresql

# Connect to database
psql -h 127.0.0.1 -U labortrack_user -d labortrack

# List databases
psql -h 127.0.0.1 -U labortrack_user -d labortrack -c "\l"

# List tables
psql -h 127.0.0.1 -U labortrack_user -d labortrack -c "\dt"

# Check database size
psql -h 127.0.0.1 -U labortrack_user -d labortrack -c "SELECT pg_size_pretty(pg_database_size('labortrack'));"
```

### Database Commands
```bash
cd ~/labortrack/current

# Run specific migration
php artisan migrate --path=/database/migrations/specific_migration.php --force

# Rollback last migration
php artisan migrate:rollback --force

# Seed database
php artisan db:seed --force
```

## 📊 Queue Management

### Check Queue Status
```bash
cd ~/labortrack/current

# List failed jobs
php artisan queue:failed

# Restart queue workers
php artisan queue:restart

# Clear all queued jobs
php artisan queue:clear
```

### Process Queue (Manual)
```bash
cd ~/labortrack/current

# Process once
php artisan queue:work --once

# Process continuously
php artisan queue:work --daemon
```

## 🔧 Composer & Dependencies

### Update Dependencies
```bash
cd ~/labortrack/current

# Update all
composer update --no-dev --optimize-autoloader

# Update specific package
composer update vendor/package --no-dev

# Install new package
composer require vendor/package
```

## 🌐 Nginx/Apache

### Test Configuration
```bash
# Nginx
sudo nginx -t

# Apache
sudo apache2ctl configtest
```

### Reload Configuration
```bash
# Nginx
sudo systemctl reload nginx

# Apache
sudo systemctl reload apache2
```

### View Configuration
```bash
# Nginx
cat /etc/nginx/sites-available/labortrack
cat /etc/nginx/sites-enabled/labortrack

# Apache
cat /etc/apache2/sites-available/labortrack.conf
```

## 🔒 Security

### Update SSH Keys
```bash
# View authorized keys
cat ~/.ssh/authorized_keys

# Add new key
cat new_key.pub >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
```

### Check Firewall
```bash
# UFW status
sudo ufw status verbose

# Allow/deny ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 📈 Monitoring

### Real-time Process Monitoring
```bash
# Monitor PHP-FPM processes
watch -n 1 'ps aux | grep php-fpm'

# Monitor Nginx connections
watch -n 1 'netstat -an | grep :80 | wc -l'

# System resources
htop
```

### Application Metrics
```bash
cd ~/labortrack/current

# Route list
php artisan route:list

# Check scheduled tasks
php artisan schedule:list

# Run scheduled tasks manually
php artisan schedule:run
```

## 🆘 Emergency Commands

### Put Site in Maintenance Mode
```bash
cd ~/labortrack/current
php artisan down --secret="your-secret-token"

# Access with: https://your-domain.com/your-secret-token
```

### Bring Site Back Up
```bash
cd ~/labortrack/current
php artisan up
```

### Quick Health Check
```bash
#!/bin/bash
echo "=== Health Check ==="
echo "Site Status:"
curl -I https://your-domain.com | head -n 1

echo -e "\nPHP-FPM:"
systemctl is-active php8.4-fpm

echo -e "\nNginx:"
systemctl is-active nginx

echo -e "\nPostgreSQL:"
systemctl is-active postgresql

echo -e "\nDatabase Connection:"
cd ~/labortrack/current && php artisan tinker --execute="DB::connection()->getPdo(); echo 'Connected!';"

echo -e "\nDisk Space:"
df -h / | grep "/$"

echo -e "\nCurrent Release:"
ls -l ~/labortrack/current

echo -e "\nRecent Errors:"
tail -n 5 ~/labortrack/shared/storage/logs/laravel.log
```

## 📞 Get Help

### Artisan Help
```bash
cd ~/labortrack/current

# List all commands
php artisan list

# Help for specific command
php artisan help migrate
```

### System Information
```bash
# PHP info
php -i

# PHP modules
php -m

# Check PostgreSQL extensions
php -m | grep -i pgsql

# PostgreSQL version
psql --version

# Server info
uname -a
cat /etc/os-release
```

---

## 💡 Tips

1. **Always test commands in staging first**
2. **Create backups before major changes**
3. **Monitor logs after deployments**
4. **Keep old releases for quick rollback**
5. **Document any manual changes you make**

## 📚 More Resources

- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Setup checklist
- [Laravel Docs](https://laravel.com/docs) - Official documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions) - CI/CD reference

