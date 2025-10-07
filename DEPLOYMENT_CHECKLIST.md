# 🚀 Deployment Checklist

Use this checklist to track your CI/CD setup progress.

## 📦 VPS Setup

### Initial Configuration
- [ ] VPS is accessible via SSH
- [ ] PHP 8.4+ installed (`php -v`)
- [ ] Composer installed (`composer -V`)
- [ ] Web server installed (Nginx/Apache)
- [ ] PostgreSQL installed and running (`sudo systemctl status postgresql`)
- [ ] Required PHP extensions installed:
  - [ ] pdo
  - [ ] pdo_pgsql
  - [ ] pgsql
  - [ ] mbstring
  - [ ] zip
  - [ ] exif
  - [ ] pcntl
  - [ ] bcmath

### Directory Structure
- [ ] Created deployment directory: `~/labortrack`
- [ ] Created releases directory: `~/labortrack/releases`
- [ ] Created shared directory: `~/labortrack/shared`
- [ ] Created storage directories:
  - [ ] `~/labortrack/shared/storage/app`
  - [ ] `~/labortrack/shared/storage/framework/cache`
  - [ ] `~/labortrack/shared/storage/framework/sessions`
  - [ ] `~/labortrack/shared/storage/framework/views`
  - [ ] `~/labortrack/shared/storage/logs`
- [ ] Set correct permissions on storage: `chown -R www-data:www-data ~/labortrack/shared/storage`

### Environment Configuration
- [ ] Created PostgreSQL database and user:
  ```bash
  sudo -u postgres psql
  CREATE DATABASE labortrack;
  CREATE USER labortrack_user WITH PASSWORD 'your_secure_password';
  GRANT ALL PRIVILEGES ON DATABASE labortrack TO labortrack_user;
  \q
  ```
- [ ] Created `.env` file: `~/labortrack/shared/.env`
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Generated `APP_KEY` (or will be generated on first deployment)
- [ ] Set `APP_URL` to your domain
- [ ] Configured PostgreSQL database credentials:
  - [ ] `DB_CONNECTION=pgsql`
  - [ ] `DB_HOST=127.0.0.1`
  - [ ] `DB_PORT=5432`
  - [ ] `DB_DATABASE=labortrack`
  - [ ] `DB_USERNAME=labortrack_user`
  - [ ] `DB_PASSWORD=your_secure_password`
- [ ] Configured mail settings (if using)
- [ ] Set `SANCTUM_STATEFUL_DOMAINS`

### Web Server Configuration
- [ ] Created virtual host/server block
- [ ] Document root points to: `~/labortrack/current/public`
- [ ] Configured PHP-FPM
- [ ] SSL certificate installed (recommended)
- [ ] Tested configuration
- [ ] Restarted web server

### Deployment Script
- [ ] Uploaded `deploy.sh` to `~/labortrack/`
- [ ] Made script executable: `chmod +x ~/labortrack/deploy.sh`
- [ ] Updated `DEPLOY_PATH` in script if needed
- [ ] Configured sudo for service reload (optional)

## 🔑 SSH Key Setup

- [ ] Generated new SSH key pair for GitHub Actions
  ```bash
  ssh-keygen -t ed25519 -C "github-actions-labortrack" -f ~/.ssh/github_actions_labortrack
  ```
- [ ] Added public key to VPS authorized_keys:
  ```bash
  ssh-copy-id -i ~/.ssh/github_actions_labortrack.pub user@your-vps-ip
  ```
- [ ] Tested SSH connection:
  ```bash
  ssh -i ~/.ssh/github_actions_labortrack user@your-vps-ip
  ```
- [ ] Saved private key content for GitHub Secrets

## 🔐 GitHub Secrets

Go to: **Repository Settings** → **Secrets and variables** → **Actions** → **New repository secret**

- [ ] `VPS_HOST` = Your VPS IP or domain
- [ ] `VPS_USERNAME` = SSH username (e.g., ubuntu, root)
- [ ] `VPS_SSH_KEY` = Full private key content (including BEGIN/END lines)
- [ ] `VPS_PORT` = SSH port (usually 22)
- [ ] `VPS_DEPLOY_PATH` = Full path (e.g., /home/ubuntu/labortrack)

### Verify Secrets
- [ ] All 5 secrets are created
- [ ] Secret names match exactly (case-sensitive)
- [ ] SSH key includes header and footer lines
- [ ] Path doesn't end with trailing slash

## 🧪 Testing

### Local Testing
- [ ] Tests pass locally: `composer test`
- [ ] Lint passes: `yarn lint`
- [ ] TypeScript checks: `yarn types`
- [ ] Build succeeds: `yarn build`

### GitHub Actions Testing
- [ ] Workflow files are committed:
  - [ ] `.github/workflows/deploy.yml`
  - [ ] `.github/workflows/test.yml`
- [ ] Push a test commit to a feature branch
- [ ] Verify test workflow runs on PR
- [ ] Check Actions tab for results

### First Deployment
- [ ] Merge to `main` or push directly to `main`
- [ ] Monitor GitHub Actions deployment
- [ ] Check VPS for new release directory
- [ ] Verify `current` symlink is created
- [ ] Test website in browser
- [ ] Check logs for errors:
  - [ ] `~/labortrack/shared/storage/logs/laravel.log`
  - [ ] Web server error logs

## 🔍 Post-Deployment Verification

### Application
- [ ] Website loads without errors
- [ ] Login page accessible
- [ ] Can log in as admin
- [ ] API endpoints respond correctly
- [ ] File uploads work (test attendance photo)
- [ ] Database migrations ran successfully
- [ ] PostgreSQL connection working (check logs)

### Infrastructure
- [ ] PHP-FPM is running
- [ ] Web server is running
- [ ] Queue workers running (if using queues)
- [ ] Cron jobs configured (if needed)
- [ ] Log rotation configured

### Security
- [ ] Firewall is enabled and configured
- [ ] SSH key authentication only (disable password auth)
- [ ] SSL certificate is valid
- [ ] File permissions are correct
- [ ] `.env` file is not publicly accessible
- [ ] Debug mode is disabled

## 📊 Monitoring Setup (Optional)

- [ ] Application monitoring (e.g., Laravel Telescope, Sentry)
- [ ] Server monitoring (e.g., New Relic, Datadog)
- [ ] Uptime monitoring (e.g., UptimeRobot, Pingdom)
- [ ] Log aggregation (e.g., Papertrail, Loggly)
- [ ] Backup strategy configured
- [ ] Database backups automated

## 🎯 Performance Optimization (Recommended)

- [ ] Opcache enabled
- [ ] Redis/Memcached for caching (optional)
- [ ] Queue workers for background jobs
- [ ] CDN for static assets (optional)
- [ ] Database query optimization
- [ ] Configured Laravel Horizon (if using Redis queues)

## 📝 Documentation

- [ ] Team members have access to VPS
- [ ] Deployment procedures documented
- [ ] Rollback procedures tested
- [ ] Emergency contacts defined
- [ ] Backup/restore procedures documented

## ✅ Final Checks

- [ ] Deployment works automatically on push to `main`
- [ ] Rollback procedure tested
- [ ] Team notified of deployment process
- [ ] Monitor first few deployments closely
- [ ] Document any issues and solutions

---

## 🆘 Troubleshooting

If something doesn't work:

1. **Check GitHub Actions logs** (Actions tab)
2. **SSH into VPS** and check:
   ```bash
   # Check Laravel logs
   tail -f ~/labortrack/shared/storage/logs/laravel.log
   
   # Check web server logs
   sudo tail -f /var/log/nginx/error.log
   
   # Check PHP-FPM
   sudo systemctl status php8.4-fpm
   
   # Manual deployment test
   cd ~/labortrack
   bash -x deploy.sh  # -x for debug output
   ```
3. **Verify permissions**:
   ```bash
   ls -la ~/labortrack/current
   ls -la ~/labortrack/shared/storage
   ```
4. **Check .env file**: `cat ~/labortrack/shared/.env`
5. **Review DEPLOYMENT.md** for detailed troubleshooting

---

**Once all items are checked, your CI/CD pipeline is complete! 🎉**

Every push to `main` will now automatically deploy to your VPS with zero downtime.

