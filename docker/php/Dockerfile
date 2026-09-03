FROM php:8.5-fpm-alpine
# Node.js 20 untuk Vite + Wayfinder
RUN apk add --no-cache nodejs npm

# Dependensi sistem untuk ekstensi PHP yang dibutuhkan Laravel + PostgreSQL + Redis
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    autoconf \
    g++ \
    make \
    linux-headers \
    git \
    unzip

# Ekstensi PHP inti
RUN docker-php-ext-configure gd --with-jpeg --with-freetype \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_pgsql \
        pgsql \
        zip \
        gd \
        bcmath \
        intl \
        mbstring

# Ekstensi Redis via PECL (dibutuhkan untuk queue & cache driver redis)
RUN pecl install redis && docker-php-ext-enable redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Opcache production-friendly (aman untuk dev karena revalidate_freq masih dicek)
RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=10000'; \
    echo 'opcache.revalidate_freq=2'; \
    echo 'opcache.validate_timestamps=1'; \
    } > /usr/local/etc/php/conf.d/opcache-custom.ini

WORKDIR /var/www/html

# Composer dependencies di-cache lebih dulu sebelum copy seluruh source,
# supaya rebuild image lebih cepat saat cuma source code yang berubah.
COPY composer.json composer.lock* ./
RUN if [ -f composer.json ]; then composer install --no-interaction --no-scripts --no-autoloader || true; fi

COPY . .

RUN if [ -f composer.json ]; then composer dump-autoload --optimize; fi \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache 2>/dev/null || true

EXPOSE 9000

CMD ["php-fpm"]
