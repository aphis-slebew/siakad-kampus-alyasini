<?php

namespace App\Services;

use App\Models\KalenderAkademik;
use App\Models\SystemConfig;
use Carbon\Carbon;
use DomainException;

class AcademicTimelineService
{
    /**
     * Get the latest published calendar event for a specific academic year and activity type.
     */
    public static function getEvent(int $tahunAjaranId, string $tipeKegiatan): ?KalenderAkademik
    {
        return KalenderAkademik::where('tahun_ajaran_id', $tahunAjaranId)
            ->where('tipe_kegiatan', $tipeKegiatan)
            ->where('is_published', true)
            ->latest('id')
            ->first();
    }

    /**
     * Determine whether an academic milestone/window is currently open.
     */
    public static function isEventOpen(int $tahunAjaranId, string $tipeKegiatan, ?Carbon $date = null): bool
    {
        $status = self::getTimelineStatus($tahunAjaranId, $tipeKegiatan, $date);

        return $status['is_open'];
    }

    /**
     * Get comprehensive timeline evaluation for a specific academic event.
     *
     * @return array{
     *     is_configured: bool,
     *     is_open: bool,
     *     status: 'upcoming'|'active'|'closed'|'unrestricted',
     *     mulai: ?string,
     *     selesai: ?string,
     *     event: ?KalenderAkademik,
     *     message: string
     * }
     */
    public static function getTimelineStatus(int $tahunAjaranId, string $tipeKegiatan, ?Carbon $date = null): array
    {
        $checkDate = ($date ?? Carbon::today())->toDateString();
        $event = self::getEvent($tahunAjaranId, $tipeKegiatan);

        if ($event) {
            $startDate = $event->mulai?->toDateString();
            $endDate = $event->selesai?->toDateString();
            $tahunAjaranNama = $event->tahunAjaran?->nama ?? 'Semester Terkait';

            if ($startDate && $checkDate < $startDate) {
                return [
                    'is_configured' => true,
                    'is_open' => false,
                    'status' => 'upcoming',
                    'mulai' => $startDate,
                    'selesai' => $endDate,
                    'event' => $event,
                    'message' => "Jadwal '{$event->kegiatan}' untuk {$tahunAjaranNama} belum dibuka (Jadwal: {$startDate} s/d {$endDate}).",
                ];
            }

            if ($endDate && $checkDate > $endDate) {
                return [
                    'is_configured' => true,
                    'is_open' => false,
                    'status' => 'closed',
                    'mulai' => $startDate,
                    'selesai' => $endDate,
                    'event' => $event,
                    'message' => "Jadwal '{$event->kegiatan}' untuk {$tahunAjaranNama} telah berakhir pada {$endDate}.",
                ];
            }

            return [
                'is_configured' => true,
                'is_open' => true,
                'status' => 'active',
                'mulai' => $startDate,
                'selesai' => $endDate,
                'event' => $event,
                'message' => "Jadwal '{$event->kegiatan}' sedang berlangsung hingga {$endDate}.",
            ];
        }

        // Backward compatibility fallback for KRS if not configured in calendar
        if ($tipeKegiatan === KalenderAkademik::TIPE_KRS) {
            $openDate = SystemConfig::getValue('KRS_OPENING_DATE', '');
            $closeDate = SystemConfig::getValue('KRS_CLOSING_DATE', '');

            if ($openDate && $checkDate < $openDate) {
                return [
                    'is_configured' => true,
                    'is_open' => false,
                    'status' => 'upcoming',
                    'mulai' => $openDate,
                    'selesai' => $closeDate ?: null,
                    'event' => null,
                    'message' => "Pengajuan KRS belum dibuka (Jadwal Pembukaan: {$openDate}).",
                ];
            }

            if ($closeDate && $checkDate > $closeDate) {
                return [
                    'is_configured' => true,
                    'is_open' => false,
                    'status' => 'closed',
                    'mulai' => $openDate ?: null,
                    'selesai' => $closeDate,
                    'event' => null,
                    'message' => "Pengajuan KRS telah ditutup (Batas Akhir: {$closeDate}).",
                ];
            }
        }

        // Default: If no specific event is configured in calendar, treat as unrestricted
        return [
            'is_configured' => false,
            'is_open' => true,
            'status' => 'unrestricted',
            'mulai' => null,
            'selesai' => null,
            'event' => null,
            'message' => 'Jadwal operasional belum dibatasi oleh kalender akademik.',
        ];
    }

    /**
     * Assert that an academic milestone is open, or throw a DomainException.
     *
     * @throws DomainException
     */
    public static function assertEventOpen(int $tahunAjaranId, string $tipeKegiatan, ?string $customMessage = null): void
    {
        $status = self::getTimelineStatus($tahunAjaranId, $tipeKegiatan);

        if (! $status['is_open']) {
            throw new DomainException($customMessage ?: $status['message']);
        }
    }
}
