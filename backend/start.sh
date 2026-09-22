#!/usr/bin/env bash
set -e

# Run database migrations
php artisan migrate --force

# Seed the database
php artisan db:seed --force

# Clear any stale config cache and rebuild it with current environment variables
php artisan config:clear
php artisan config:cache

# Start FrankenPHP
exec frankenphp run --config /etc/frankenphp/Caddyfile