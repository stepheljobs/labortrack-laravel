#!/bin/bash

###############################################################################
# LaborTrack Deployment Script
# 
# This script handles zero-downtime deployment with rollback capability
###############################################################################

set -e  # Exit on any error

# Configuration
APP_NAME="labortrack"
DEPLOY_PATH="${HOME}/labortrack"  # Adjust this to your actual path
RELEASES_PATH="${DEPLOY_PATH}/releases"
CURRENT_PATH="${DEPLOY_PATH}/current"
SHARED_PATH="${DEPLOY_PATH}/shared"
ARTIFACT_PATH="/tmp/labortrack-deployment/deployment/app.tar.gz"
KEEP_RELEASES=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create directory structure if it doesn't exist
initialize_structure() {
    log_info "Initializing deployment structure..."
    
    mkdir -p "${RELEASES_PATH}"
    mkdir -p "${SHARED_PATH}/storage/app"
    mkdir -p "${SHARED_PATH}/storage/framework/cache"
    mkdir -p "${SHARED_PATH}/storage/framework/sessions"
    mkdir -p "${SHARED_PATH}/storage/framework/views"
    mkdir -p "${SHARED_PATH}/storage/logs"
    
    # Create .env if it doesn't exist
    if [ ! -f "${SHARED_PATH}/.env" ]; then
        log_warning ".env file not found in shared directory. Please create it manually!"
        log_warning "Path: ${SHARED_PATH}/.env"
    fi
}

# Create new release
create_release() {
    RELEASE_DATE=$(date +%Y%m%d%H%M%S)
    RELEASE_PATH="${RELEASES_PATH}/${RELEASE_DATE}"
    
    log_info "Creating new release: ${RELEASE_DATE}"
    mkdir -p "${RELEASE_PATH}"
    
    # Extract artifact
    log_info "Extracting application files..."
    tar -xzf "${ARTIFACT_PATH}" -C "${RELEASE_PATH}"
    
    # Link shared directories
    log_info "Linking shared resources..."
    rm -rf "${RELEASE_PATH}/storage"
    ln -sf "${SHARED_PATH}/storage" "${RELEASE_PATH}/storage"
    ln -sf "${SHARED_PATH}/.env" "${RELEASE_PATH}/.env"
    ln -sf "${SHARED_PATH}/.infrastructure" "${RELEASE_PATH}/.infrastructure"
    
    # Set permissions
    log_info "Setting permissions..."
    chmod -R 755 "${RELEASE_PATH}"
    chmod -R 775 "${SHARED_PATH}/storage"
}

# Install dependencies
install_dependencies() {
    log_info "Installing Composer dependencies..."
    cd "${RELEASE_PATH}"
    
    # Check if composer is available
    if command -v composer &> /dev/null; then
        composer install --no-dev --optimize-autoloader --no-interaction
    else
        log_warning "Composer not found. Skipping dependency installation."
        log_warning "Make sure to install composer or deploy vendor folder."
    fi
    
    # Install Node.js dependencies and build frontend
    log_info "Installing Node.js dependencies..."
    if command -v yarn &> /dev/null; then
        yarn install --frozen-lockfile --production=false
        yarn build
    elif command -v npm &> /dev/null; then
        npm install
        npm run build
    else
        log_warning "Neither Yarn nor npm found. Frontend assets may not be built."
        log_warning "Make sure to install Node.js, Yarn/npm or deploy built assets."
    fi
}

# Optimize Laravel
optimize_laravel() {
    log_info "Optimizing Laravel application..."
    cd "${RELEASE_PATH}"
    
    # Clear all caches
    php artisan config:clear
    php artisan cache:clear
    php artisan view:clear
    php artisan route:clear
    
    # Optimize
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    # Optimize autoloader
    php artisan optimize
}

# Run migrations
run_migrations() {
    log_info "Running database migrations..."
    cd "${RELEASE_PATH}"
    php artisan migrate --force
}

# Switch to new release
switch_release() {
    log_info "Switching to new release..."
    
    # Backup current symlink
    if [ -L "${CURRENT_PATH}" ]; then
        PREVIOUS_RELEASE=$(readlink "${CURRENT_PATH}")
        cp -P "${CURRENT_PATH}" "${CURRENT_PATH}.backup"
    fi
    
    # Update symlink
    ln -sfn "${RELEASE_PATH}" "${CURRENT_PATH}"
    
    log_info "Successfully switched to new release!"
}

# Reload PHP-FPM and services
reload_services() {
    log_info "Reloading services..."
    
    # Reload PHP-FPM (adjust based on your setup)
    if command -v systemctl &> /dev/null; then
        if systemctl list-units --full -all | grep -q "php8.4-fpm.service"; then
            sudo systemctl reload php8.4-fpm || log_warning "Could not reload PHP-FPM"
        elif systemctl list-units --full -all | grep -q "php-fpm.service"; then
            sudo systemctl reload php-fpm || log_warning "Could not reload PHP-FPM"
        fi
    fi
    
    # Restart queue workers if using queues
    cd "${CURRENT_PATH}"
    php artisan queue:restart || log_warning "Could not restart queue workers"
}

# Clean old releases
cleanup_old_releases() {
    log_info "Cleaning up old releases..."
    
    cd "${RELEASES_PATH}"
    RELEASES=($(ls -t))
    COUNT=${#RELEASES[@]}
    
    if [ $COUNT -gt $KEEP_RELEASES ]; then
        log_info "Keeping latest ${KEEP_RELEASES} releases, removing $(($COUNT - $KEEP_RELEASES)) old releases..."
        for ((i=$KEEP_RELEASES; i<$COUNT; i++)); do
            log_info "Removing ${RELEASES[$i]}"
            rm -rf "${RELEASES_PATH}/${RELEASES[$i]}"
        done
    fi
}

# Rollback to previous release
rollback() {
    log_error "Deployment failed! Rolling back..."
    
    if [ -f "${CURRENT_PATH}.backup" ]; then
        mv "${CURRENT_PATH}.backup" "${CURRENT_PATH}"
        reload_services
        log_info "Rollback completed successfully"
    else
        log_error "No backup found. Manual intervention required!"
    fi
    
    # Remove failed release
    if [ -d "${RELEASE_PATH}" ]; then
        rm -rf "${RELEASE_PATH}"
    fi
    
    exit 1
}

# Health check
health_check() {
    log_info "Running health check..."
    
    # Simple HTTP check (adjust URL as needed)
    # Uncomment and adjust if you want to add health check
    # HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
    # if [ "$HTTP_CODE" != "200" ]; then
    #     log_error "Health check failed! HTTP code: ${HTTP_CODE}"
    #     return 1
    # fi
    
    log_info "Health check passed!"
    return 0
}

# Main deployment flow
main() {
    log_info "=========================================="
    log_info "Starting deployment of ${APP_NAME}"
    log_info "=========================================="
    
    # Set trap to rollback on error
    trap rollback ERR
    
    # Check if artifact exists
    if [ ! -f "${ARTIFACT_PATH}" ]; then
        log_error "Deployment artifact not found at ${ARTIFACT_PATH}"
        exit 1
    fi
    
    # Execute deployment steps
    initialize_structure
    create_release
    install_dependencies
    run_migrations
    optimize_laravel
    switch_release
    reload_services
    
    # Run health check
    if ! health_check; then
        rollback
    fi
    
    # Cleanup
    cleanup_old_releases
    rm -f "${CURRENT_PATH}.backup"
    rm -f "${ARTIFACT_PATH}"
    
    log_info "=========================================="
    log_info "Deployment completed successfully! 🎉"
    log_info "Release: ${RELEASE_DATE}"
    log_info "=========================================="
}

# Run main function
main

