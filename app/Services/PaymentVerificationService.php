<?php

namespace App\Services;

use App\Models\Pembayaran;
use App\Models\SystemConfig;
use App\Models\Tagihan;
use App\Notifications\KeuanganPembayaranNotification;
use Carbon\Carbon;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentVerificationService
{
    /**
     * Verify or reject a manual payment upload with Overpayment Protection & Audit Logging.
     * ATURAN KERAS (02-Database-Schema.md §7 & Edge Case Finansial):
     * 1. Status tagihan HANYA boleh berubah menjadi 'lunas' jika terdapat baris pembayarans
     *    dengan status_verifikasi = 'diverifikasi' yang total nominalnya menutupi nominal tagihan.
     * 2. PENCEGAHAN & AUDIT OVERPAYMENT:
     *    - Jika tagihan SUDAH lunas dan staf memverifikasi pembayaran tambahan, atau jika pembayaran baru
     *      menyebabkan total melebihi nominal tagihan, sistem akan:
     *      a. Memvalidasi dan menolak verifikasi tidak disengaja jika pembayaran tersebut murni duplikat.
     *      b. Mencatat log audit 'keuangan.overpayment_detected' dengan rincian nominal kelebihan bayar
     *         sehingga uang tidak hilang tanpa jejak (dapat diaudit untuk refund/deposit semester depan).
     */
    public function verifyPayment(Pembayaran $pembayaran, string $statusVerifikasi, ?int $verifierUserId = null, bool $allowOverpayment = false): Tagihan
    {
        if (! in_array($statusVerifikasi, ['diverifikasi', 'ditolak'], true)) {
            throw new DomainException("Status verifikasi harus 'diverifikasi' atau 'ditolak'.");
        }

        return DB::transaction(function () use ($pembayaran, $statusVerifikasi, $verifierUserId, $allowOverpayment) {
            $tagihan = $pembayaran->tagihan;

            if ($statusVerifikasi === 'diverifikasi') {
                $totalVerifiedExisting = Pembayaran::where('tagihan_id', $tagihan->id)
                    ->where('status_verifikasi', 'diverifikasi')
                    ->where('id', '!=', $pembayaran->id)
                    ->sum('nominal_dibayar');

                $newTotal = (float) $totalVerifiedExisting + (float) $pembayaran->nominal_dibayar;
                $nominalTagihan = (float) $tagihan->nominal;

                // 1. Preventive Validation: Detect duplicate/excess payment attempts
                if ($newTotal > $nominalTagihan && ! $allowOverpayment) {
                    $excess = $newTotal - $nominalTagihan;

                    // If tagihan is already fully paid, prevent duplicate verification from staff
                    if ((float) $totalVerifiedExisting >= $nominalTagihan) {
                        throw new DomainException(
                            'PENCEGAHAN OVERPAYMENT: Tagihan ini SUDAH LUNAS (Total Terverifikasi: Rp '.number_format($totalVerifiedExisting, 0, ',', '.').'). Pembayaran ini terdeteksi sebagai transfer duplikat/kelebihan. Tolak pembayaran ini jika duplikat.'
                        );
                    }
                }
            }

            $oldStatus = $pembayaran->status_verifikasi;

            $pembayaran->update([
                'status_verifikasi' => $statusVerifikasi,
                'diverifikasi_oleh_user_id' => $verifierUserId ?? auth()->id(),
                'diverifikasi_at' => now(),
            ]);

            ActivityLogger::log('keuangan.verify_pembayaran', 'Pembayaran', $pembayaran->id, [
                'status_verifikasi' => $oldStatus,
            ], [
                'status_verifikasi' => $statusVerifikasi,
                'nominal_dibayar' => $pembayaran->nominal_dibayar,
                'diverifikasi_oleh_user_id' => $pembayaran->diverifikasi_oleh_user_id,
            ]);

            // Recalculate parent Tagihan status based on strictly verified payments
            $this->recalculateTagihanStatus($tagihan);

            // Notify Student User
            $studentUser = $tagihan->mahasiswa->user ?? null;
            if ($studentUser) {
                try {
                    $studentUser->notify(new KeuanganPembayaranNotification(
                        $statusVerifikasi,
                        (float) $pembayaran->nominal_dibayar,
                        $pembayaran->catatan
                    ));
                } catch (\Throwable $e) {
                    Log::error('Gagal mengirim notification Keuangan: '.$e->getMessage());
                }
            }

            // Audit Overpayment if excess occurs
            $totalPaidFinal = Pembayaran::where('tagihan_id', $tagihan->id)->where('status_verifikasi', 'diverifikasi')->sum('nominal_dibayar');
            if ((float) $totalPaidFinal > (float) $tagihan->nominal) {
                $kelebihan = (float) $totalPaidFinal - (float) $tagihan->nominal;

                ActivityLogger::log('keuangan.overpayment_detected', 'Tagihan', $tagihan->id, null, [
                    'mahasiswa_id' => $tagihan->mahasiswa_id,
                    'nominal_tagihan' => (float) $tagihan->nominal,
                    'total_terverifikasi' => (float) $totalPaidFinal,
                    'nominal_kelebihan_bayar' => $kelebihan,
                    'catatan' => 'Kelebihan bayar terdeteksi dan tercatat dalam sistem audit finansial untuk penelusuran refund/deposit.',
                ]);
            }

            return $tagihan->fresh();
        });
    }

    /**
     * Recalculate and update tagihan status strictly based on verified payments.
     */
    public function recalculateTagihanStatus(Tagihan $tagihan): Tagihan
    {
        $totalVerifiedPayments = Pembayaran::where('tagihan_id', $tagihan->id)
            ->where('status_verifikasi', 'diverifikasi')
            ->sum('nominal_dibayar');

        $totalVerifiedCicilan = DB::table('cicilan_tagihans')
            ->where('tagihan_id', $tagihan->id)
            ->where('status', 'lunas')
            ->sum('nominal');

        $totalPaid = (float) $totalVerifiedPayments + (float) $totalVerifiedCicilan;
        $nominalTagihan = (float) $tagihan->nominal;

        if ($totalPaid >= $nominalTagihan) {
            $newStatus = 'lunas';
        } elseif ($totalPaid > 0) {
            $newStatus = 'dicicil';
        } else {
            $newStatus = (now()->greaterThan($tagihan->jatuh_tempo)) ? 'terlambat' : 'belum_bayar';
        }

        $tagihan->update(['status' => $newStatus]);

        return $tagihan;
    }

    /**
     * Get exact overpayment amount for a tagihan if any.
     */
    public function getOverpaymentAmount(Tagihan $tagihan): float
    {
        $totalVerified = Pembayaran::where('tagihan_id', $tagihan->id)
            ->where('status_verifikasi', 'diverifikasi')
            ->sum('nominal_dibayar');

        return max(0.0, (float) $totalVerified - (float) $tagihan->nominal);
    }

    /**
     * Prevent manual status update of Tagihan to 'lunas' without verified payments.
     */
    public function enforceStrictTagihanStatusUpdate(Tagihan $tagihan, string $targetStatus): void
    {
        if ($targetStatus === 'lunas') {
            $totalVerified = Pembayaran::where('tagihan_id', $tagihan->id)
                ->where('status_verifikasi', 'diverifikasi')
                ->sum('nominal_dibayar');

            if ((float) $totalVerified < (float) $tagihan->nominal) {
                throw new DomainException(
                    "ATURAN KERAS: Status tagihan tidak dapat diubah menjadi 'lunas' secara manual tanpa bukti pembayaran terverifikasi yang mencukupi nominal tagihan (Total Terverifikasi: Rp ".number_format($totalVerified, 0, ',', '.').' / Nominal Tagihan: Rp '.number_format($tagihan->nominal, 0, ',', '.').').'
                );
            }
        }
    }

    /**
     * Calculate late penalty fee for overdue UKT bill based on SystemConfig.
     */
    public function calculateDendaLateFee(Tagihan $tagihan): float
    {
        if ($tagihan->status === 'lunas' || ! $tagihan->jatuh_tempo || now()->lessThanOrEqualTo($tagihan->jatuh_tempo)) {
            return 0.0;
        }

        $dendaPerHari = (float) SystemConfig::getValue('DENDA_UKT_PER_HARI', '5000.00');
        $daysLate = now()->diffInDays(Carbon::parse($tagihan->jatuh_tempo));

        return round($daysLate * $dendaPerHari, 2);
    }
}
