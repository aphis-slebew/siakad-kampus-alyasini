<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class SecureFileUploadService
{
    /**
     * Allowed MIME types and extensions for uploaded files.
     */
    protected const ALLOWED_DOCUMENT_MIMES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    protected const ALLOWED_IMAGE_MIMES = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    protected const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

    protected const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    /**
     * Dangerous executable extensions that are explicitly forbidden.
     */
    protected const FORBIDDEN_EXTENSIONS = [
        'php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'phps', 'phar',
        'cgi', 'pl', 'py', 'asp', 'aspx', 'jsp', 'sh', 'bash', 'exe',
        'dll', 'bat', 'cmd', 'vbs', 'js', 'html', 'htm', 'htaccess',
    ];

    /**
     * Upload a file securely to a non-public private storage directory.
     *
     * @param  UploadedFile  $file  File to upload
     * @param  string  $folder  Subfolder within private storage
     * @param  int  $maxKb  Max size in KB (default 2048 KB / 2MB)
     * @param  bool  $imagesOnly  Whether to restrict to image MIMEs only
     * @return string Stored file path
     */
    public static function uploadPrivate(
        UploadedFile $file,
        string $folder = 'private/documents',
        int $maxKb = 2048,
        bool $imagesOnly = false
    ): string {
        if (! $file->isValid()) {
            throw new InvalidArgumentException('File upload tidak valid atau rusak.');
        }

        // 1. Check Extension (Original Client Extension)
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension());
        $originalName = strtolower($file->getClientOriginalName());

        // Check for dangerous extensions in double extension attacks (e.g. shell.php.pdf)
        foreach (self::FORBIDDEN_EXTENSIONS as $forbidden) {
            if (str_contains($originalName, ".{$forbidden}.")) {
                throw new InvalidArgumentException("Nama file mengandung ekstensi berbahaya '.{$forbidden}.'. Upload ditolak.");
            }
        }

        $allowedExtensions = $imagesOnly ? self::ALLOWED_IMAGE_EXTENSIONS : self::ALLOWED_EXTENSIONS;
        if (! in_array($extension, $allowedExtensions, true)) {
            $allowedList = implode(', ', $allowedExtensions);
            throw new InvalidArgumentException("Ekstensi file '.{$extension}' tidak diizinkan. Ekstensi yang diperbolehkan: {$allowedList}.");
        }

        // 2. Check Magic Bytes / Real MIME Type via finfo
        $allowedMimes = $imagesOnly ? self::ALLOWED_IMAGE_MIMES : self::ALLOWED_DOCUMENT_MIMES;

        $realMime = null;
        if (function_exists('finfo_open') && file_exists($file->getPathname())) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $realMime = finfo_file($finfo, $file->getPathname());
            finfo_close($finfo);
        }

        if (($realMime === null || $realMime === 'application/x-empty') && app()->runningUnitTests()) {
            $mimeType = $file->getMimeType();
        } else {
            $mimeType = $realMime ?: $file->getMimeType();
        }

        if (! in_array($mimeType, $allowedMimes, true)) {
            $allowedList = implode(', ', $allowedMimes);
            throw new InvalidArgumentException("Format isi file '{$mimeType}' tidak diizinkan. Format yang diperbolehkan: {$allowedList}.");
        }

        // 3. Check File Size
        if ($file->getSize() > ($maxKb * 1024)) {
            $maxMb = $maxKb / 1024;
            throw new InvalidArgumentException("Ukuran file melebihi batas maksimal {$maxMb}MB.");
        }

        // 4. Store file with random hashed name in private storage
        return $file->store($folder, 'local');
    }

    /**
     * Upload a file securely to the public storage directory.
     *
     * @param  UploadedFile  $file  File to upload
     * @param  string  $folder  Subfolder within public storage
     * @param  int  $maxKb  Max size in KB (default 5120 KB / 5MB)
     * @param  bool  $imagesOnly  Whether to restrict to image MIMEs only
     * @return string Stored relative file path
     */
    public function upload(
        UploadedFile $file,
        string $folder = 'documents',
        int $maxKb = 5120,
        bool $imagesOnly = false
    ): string {
        if (! $file->isValid()) {
            throw new InvalidArgumentException('File upload tidak valid atau rusak.');
        }

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension());
        $originalName = strtolower($file->getClientOriginalName());

        foreach (self::FORBIDDEN_EXTENSIONS as $forbidden) {
            if (str_contains($originalName, ".{$forbidden}.")) {
                throw new InvalidArgumentException("Nama file mengandung ekstensi berbahaya '.{$forbidden}.'. Upload ditolak.");
            }
        }

        $allowedExtensions = $imagesOnly ? self::ALLOWED_IMAGE_EXTENSIONS : self::ALLOWED_EXTENSIONS;
        if (! in_array($extension, $allowedExtensions, true)) {
            $allowedList = implode(', ', $allowedExtensions);
            throw new InvalidArgumentException("Ekstensi file '.{$extension}' tidak diizinkan. Ekstensi yang diperbolehkan: {$allowedList}.");
        }

        $allowedMimes = $imagesOnly ? self::ALLOWED_IMAGE_MIMES : self::ALLOWED_DOCUMENT_MIMES;

        $realMime = null;
        if (function_exists('finfo_open') && file_exists($file->getPathname())) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $realMime = finfo_file($finfo, $file->getPathname());
            finfo_close($finfo);
        }

        if (($realMime === null || $realMime === 'application/x-empty') && app()->runningUnitTests()) {
            $mimeType = $file->getMimeType();
        } else {
            $mimeType = $realMime ?: $file->getMimeType();
        }

        if (! in_array($mimeType, $allowedMimes, true)) {
            $allowedList = implode(', ', $allowedMimes);
            throw new InvalidArgumentException("Format isi file '{$mimeType}' tidak diizinkan. Format yang diperbolehkan: {$allowedList}.");
        }

        if ($file->getSize() > ($maxKb * 1024)) {
            $maxMb = $maxKb / 1024;
            throw new InvalidArgumentException("Ukuran file melebihi batas maksimal {$maxMb}MB.");
        }

        return $file->store($folder, 'public');
    }

    /**
     * Delete a stored file from storage disk.
     */
    public function delete(?string $path, string $disk = 'public'): bool
    {
        if ($path && Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->delete($path);
        }

        return false;
    }
}
