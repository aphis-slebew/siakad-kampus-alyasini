<?php

namespace App\Services;

use Illuminate\Hashing\Argon2IdHasher as BaseArgon2IdHasher;

/**
 * MIGRASI SEMENTARA: Hasher transisi untuk mendukung verifikasi password Bcrypt ($2y$) lama
 * sekaligus mengaktifkan rehash otomatis ke Argon2id ($argon2id$) saat user login (04-Security.md §1).
 *
 * PEMELIHARAAN / PEMBERSIHAN KODE DILAKUKAN NANTI:
 * Class adapter ini bersifat SEMENTARA selama masa transisi migrasi password. Setelah beberapa bulan
 * sistem berjalan di produksi dan mayoritas/semua pengguna aktif sudah login minimal 1x (sehingga password
 * mereka ter-rehash ke $argon2id$), class ini dan pendaftarannya di AppServiceProvider dapat dihapus.
 *
 * CARA CEK AKUN DENGAN HASH LAMA DI PRODUKSI:
 * php artisan tinker --execute="echo User::where('password', 'LIKE', '\$2y\$%')->orWhere('password', 'LIKE', '\$2a\$%')->count();"
 */
class FallbackArgon2IdHasher extends BaseArgon2IdHasher
{
    /**
     * Check the given plain value against a hash with legacy Bcrypt fallback support.
     *
     * @param  string  $value
     * @param  string  $hashedValue
     * @return bool
     */
    public function check(#[\SensitiveParameter] $value, $hashedValue, array $options = [])
    {
        if (is_null($hashedValue) || (string) $hashedValue === '') {
            return false;
        }

        // If legacy bcrypt hash ($2y$ or $2a$), verify using PHP password_verify directly
        if (str_starts_with($hashedValue, '$2y$') || str_starts_with($hashedValue, '$2a$')) {
            return password_verify($value, $hashedValue);
        }

        return parent::check($value, $hashedValue, $options);
    }

    /**
     * Verifies that the configuration is valid, allowing legacy Bcrypt hashes to pass configuration check
     * so that rehash_on_login can rehash them to Argon2id upon user login.
     *
     * @param  string  $value
     * @return bool
     */
    public function verifyConfiguration($value)
    {
        if (str_starts_with($value, '$2y$') || str_starts_with($value, '$2a$')) {
            return true;
        }

        return parent::verifyConfiguration($value);
    }
}
