# CI/CD Deployment Guide

This guide explains how to set up automated deployment from GitHub to your VPS using GitHub Actions.

## 🚀 Quick Overview

When you push to the `main` branch:
1. GitHub Actions runs your tests
2. Builds frontend assets (Vite)
3. Packages the application
4. Deploys to your VPS via SSH
5. Runs migrations and optimizations
6. Zero-downtime deployment with rollback capability

## 📋 Prerequisites

- A VPS with SSH access
- PHP 8.4+ installed on VPS
- Composer installed on VPS
- Nginx or Apache configured
- GitHub repository access

## 🔧 Setup Instructions

### 1. Prepare Your VPS

SSH into your VPS and create the deployment directory structure:

```bash
# Create main deployment directory
mkdir -p ~/labortrack/{releases,shared}
cd ~/labortrack

# Create shared storage directories
mkdir -p shared/storage/{app,framework/{cache,sessions,views},logs}

# Set permissions (adjust www-data to your web server user)
chown -R www-data:www-data shared/storage
chmod -R 775 shared/storage

# Create .env file
nano shared/.env
```

Copy your production `.env` configuration into `shared/.env`. Make sure to set:
- `APP_ENV=production`
- `APP_DEBUG=false`
- PostgreSQL database credentials:
  - `DB_CONNECTION=pgsql`
  - `DB_HOST=127.0.0.1` (or your database server)
  - `DB_PORT=5432`
  - `DB_DATABASE=labortrack`
  - `DB_USERNAME=your_db_user`
  - `DB_PASSWORD=your_secure_password`
- API keys
- Other production-specific settings

```bash
# Upload the deployment script
# (Either copy deploy.sh manually or it will come with first deployment)
chmod +x deploy.sh

# Test PHP and Composer
php -v
composer -V
```

### 2. Configure Your Web Server

Point your web server to the `current/public` directory:

**For Nginx:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /home/yourusername/labortrack/current/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

**For Apache:**

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /home/yourusername/labortrack/current/public

    <Directory /home/yourusername/labortrack/current/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Restart your web server:
```bash
# Nginx
sudo systemctl restart nginx

# Apache
sudo systemctl restart apache2
```

### 3. Generate SSH Key for GitHub Actions

On your local machine or GitHub:

```bash
# Generate a new SSH key pair (no passphrase)
ssh-keygen -t ed25519 -C "github-actions-labortrack" -f ~/.ssh/github_actions_labortrack

# Copy the public key to your VPS
ssh-copy-id -i ~/.ssh/github_actions_labortrack.pub user@your-vps-ip

# Test the connection
ssh -i ~/.ssh/github_actions_labortrack user@your-vps-ip

# Display private key (you'll need this for GitHub Secrets)
cat ~/.ssh/github_actions_labortrack
```

### 4. Configure GitHub Secrets

Go to your GitHub repository:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

Add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_HOST` | Your VPS IP address or domain | `123.456.789.0` or `vps.example.com` |
| `VPS_USERNAME` | SSH username | `ubuntu` or `root` |
| `VPS_SSH_KEY` | Private SSH key (entire content) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_PORT` | SSH port (usually 22) | `22` |
| `VPS_DEPLOY_PATH` | Full path to deployment directory | `/home/ubuntu/labortrack` |

**Important:** For `VPS_SSH_KEY`, copy the **entire** private key including the header and footer:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...entire key content...
-----END OPENSSH PRIVATE KEY-----
```

### 5. Update Deployment Script Path

Edit `deploy.sh` if needed to match your actual VPS path:

```bash
# Line 13 in deploy.sh
DEPLOY_PATH="${HOME}/labortrack"  # Change this to your actual path
```

### 6. Optional: Configure Sudo for Service Reload

If you want the deployment script to reload PHP-FPM without password:

```bash
# On your VPS, edit sudoers
sudo visudo

# Add this line (replace 'ubuntu' with your username)
ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl reload php8.4-fpm
ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl reload php-fpm
```

### 7. Test Your Setup

1. Make a small change to your codebase
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "test: trigger deployment"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub to watch the deployment
4. Check your VPS to verify deployment worked

## 📁 Directory Structure on VPS

After deployment, your VPS will have this structure:

```
~/labortrack/
├── current -> releases/20250107120000  # Symlink to active release
├── releases/
│   ├── 20250107120000/                 # Release 1
│   ├── 20250107130000/                 # Release 2
│   └── 20250107140000/                 # Release 3
├── shared/
│   ├── .env                            # Production environment
│   ├── .infrastructure/
│   │   └── volume_data/
│   │       └── sqlite/                 # SQLite database (if using)
│   └── storage/                        # Laravel storage
│       ├── app/
│       ├── framework/
│       └── logs/
└── deploy.sh                           # Deployment script
```

## 🔄 Deployment Process

1. **Tests Run** - GitHub Actions runs your test suite
2. **Build Assets** - Vite builds your React frontend
3. **Package** - Create deployment artifact (tarball)
4. **Transfer** - SCP artifact to VPS
5. **Extract** - Create new release directory
6. **Dependencies** - Install Composer packages
7. **Migrate** - Run database migrations
8. **Optimize** - Cache configs, routes, views
9. **Switch** - Update symlink to new release
10. **Reload** - Restart PHP-FPM and queue workers
11. **Cleanup** - Remove old releases (keeps 5 most recent)

## 🛟 Rollback

If deployment fails, the script automatically rolls back to the previous release.

Manual rollback:
```bash
cd ~/labortrack
# List releases
ls -la releases/

# Update symlink to previous release
ln -sfn releases/PREVIOUS_RELEASE_DATE current

# Reload services
sudo systemctl reload php8.4-fpm
cd current && php artisan queue:restart
```

## 🔍 Troubleshooting

### Deployment fails at "Installing Composer dependencies"

**Solution:** Install Composer on your VPS or include `vendor/` in your deployment by removing it from `.gitignore` (not recommended for large projects).

### Permission denied errors

**Solution:** 
```bash
# Fix ownership
sudo chown -R www-data:www-data ~/labortrack/current
sudo chown -R www-data:www-data ~/labortrack/shared/storage

# Fix permissions
chmod -R 755 ~/labortrack/current
chmod -R 775 ~/labortrack/shared/storage
```

### Database errors

**Solution:** 
- Make sure your `.env` in `shared/.env` has correct database credentials
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Test database connection:
  ```bash
  psql -h 127.0.0.1 -U your_db_user -d labortrack
  ```
- Make sure the database exists:
  ```bash
  sudo -u postgres psql
  CREATE DATABASE labortrack;
  CREATE USER labortrack_user WITH PASSWORD 'your_password';
  GRANT ALL PRIVILEGES ON DATABASE labortrack TO labortrack_user;
  \q
  ```

### 502 Bad Gateway

**Solution:**
```bash
# Check PHP-FPM status
sudo systemctl status php8.4-fpm

# Check logs
sudo tail -f /var/log/nginx/error.log
tail -f ~/labortrack/shared/storage/logs/laravel.log
```

### SSH connection fails in GitHub Actions

**Solution:**
- Verify SSH key is correct (includes BEGIN/END lines)
- Test SSH connection manually
- Check firewall allows connections from GitHub IPs
- Verify VPS_HOST, VPS_USERNAME, VPS_PORT are correct

## 🔒 Security Best Practices

1. **Use dedicated SSH key** - Don't reuse your personal SSH key
2. **Restrict SSH key** - In `~/.ssh/authorized_keys`, prefix the key with:
   ```
   from="140.82.112.0/20,143.55.64.0/20" ssh-ed25519 AAAA...
   ```
   (GitHub's IP ranges - check [GitHub's meta API](https://api.github.com/meta))

3. **Use strong .env values** - Generate strong keys:
   ```bash
   php artisan key:generate
   ```

4. **Keep secrets secret** - Never commit `.env` or private keys

5. **Enable firewall** - Only allow necessary ports:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

## 📝 Customization

### Deploy to Different Branches

Edit `.github/workflows/deploy.yml`:
```yaml
on:
  push:
    branches:
      - main
      - staging  # Add staging branch
```

### Skip Tests (Not Recommended)

Remove the `test` job and update `needs:` in the deploy job.

### Add More Build Steps

Add steps in `.github/workflows/deploy.yml` after "Build frontend assets":
```yaml
- name: Run additional build command
  run: yarn custom-build-command
```

### Change Releases to Keep

Edit `deploy.sh`:
```bash
KEEP_RELEASES=10  # Keep 10 instead of 5
```

## 🎉 That's It!

Your CI/CD pipeline is now set up! Every push to `main` will automatically deploy to your VPS.

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Zero-Downtime Deployments](https://www.digitalocean.com/community/tutorials/how-to-automate-zero-downtime-deployments)

## 🆘 Need Help?

If you encounter issues:
1. Check GitHub Actions logs (Actions tab in GitHub)
2. Check VPS logs: `tail -f ~/labortrack/shared/storage/logs/laravel.log`
3. Check web server logs: `sudo tail -f /var/log/nginx/error.log`
4. SSH into VPS and run `deploy.sh` manually to see detailed output

