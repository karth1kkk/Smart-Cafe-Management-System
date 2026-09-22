# Use the official FrankenPHP image, which includes PHP 8.4 and a built-in HTTP server.
FROM dunglas/frankenphp

# Install required PHP extensions for Laravel and your database.
RUN install-php-extensions \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    intl \
    opcache

# Remove file capabilities so the binary works with Render's restricted environment.
RUN setcap -r /usr/local/bin/frankenphp

# Copy the Composer binary from the official Composer image.
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set the working directory inside the container.
WORKDIR /app

# Copy the Laravel application into the container.
COPY . /app

# Install Composer dependencies with optimizations for production.
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Run database migrations during the build
# The --force flag is required because the build environment is non-interactive
RUN php artisan migrate --force

# Set permissions for the storage and bootstrap/cache directories.
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Tell FrankenPHP to listen on all interfaces on port 80.
ENV SERVER_NAME=:80

# Expose port 80 to allow traffic from Render's load balancer.
EXPOSE 80