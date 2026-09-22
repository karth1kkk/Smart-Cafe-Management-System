#!/usr/bin/env bash
set -e

# Run database migrations
php artisan migrate --force

# Seed the database with staff accounts
php artisan db:seed --force

# Clear and rebuild config cache to pick up environment variables
php artisan config:clear
php artisan config:cache

# Start FrankenPHP
exec frankenphp run --config /etc/frankenphp/Caddyfile