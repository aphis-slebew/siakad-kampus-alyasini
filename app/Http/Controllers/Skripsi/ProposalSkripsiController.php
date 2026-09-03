<?php

namespace App\Http\Controllers\Skripsi;

use App\Http\Controllers\Controller;
use App\Models\BimbinganProposal;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\ProposalSkripsi;
use App\Services\SkripsiService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProposalSkripsiController extends Controller
{
    /**
     * Display proposal skripsi list & submission portal.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        if ($user->hasRole('mahasiswa')) {
            $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();
            $proposal = $mahasiswa
                ? ProposalSkripsi::with(['dosenPembimbing', 'bimbinganProposals'])
                    ->where('mahasiswa_id', $mahasiswa->id)
                    ->first()
                : null;
            $dosens = Dosen::all();

            return Inertia::render('skripsi/proposal', [
                'proposal' => $proposal,
                'dosens' => $dosens,
                'role' => 'mahasiswa',
            ]);
        }

        if ($user->hasRole('dosen')) {
            $dosen = Dosen::where('user_id', $user->id)->first();
            $proposals = $dosen
                ? ProposalSkripsi::with(['mahasiswa', 'dosenPembimbing', 'bimbinganProposals'])
                    ->where('dosen_pembimbing_id', $dosen->id)
                    ->get()
                : collect();

            return Inertia::render('skripsi/proposal', [
                'proposals' => $proposals,
                'role' => 'dosen',
            ]);
        }

        // Admin / Superadmin
        $proposals = ProposalSkripsi::with(['mahasiswa.programStudi', 'dosenPembimbing', 'bimbinganProposals'])->latest()->get();
        $dosens = Dosen::all();

        return Inertia::render('skripsi/proposal', [
            'proposals' => $proposals,
            'dosens' => $dosens,
            'role' => 'admin',
        ]);
    }

    /**
     * Submit Proposal Skripsi.
     */
    public function store(Request $request, SkripsiService $skripsiService): RedirectResponse
    {
        $request->validate([
            'judul' => 'required|string|min:10',
            'dosen_pembimbing_id' => 'nullable|exists:dosens,id',
        ]);

        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();

        try {
            $skripsiService->submitProposal($mahasiswa, $request->judul, $request->dosen_pembimbing_id);

            return back()->with('success', 'Proposal Skripsi berhasil diajukan.');
        } catch (Exception $e) {
            return back()->withErrors(['proposal' => $e->getMessage()]);
        }
    }

    /**
     * Approve Proposal Skripsi & assign Dosen Pembimbing (Admin).
     */
    public function approve(Request $request, ProposalSkripsi $proposal, SkripsiService $skripsiService): RedirectResponse
    {
        $request->validate([
            'dosen_pembimbing_id' => 'required|exists:dosens,id',
        ]);

        try {
            $skripsiService->approveProposal($proposal, $request->dosen_pembimbing_id);

            return back()->with('success', 'Proposal Skripsi berhasil disetujui.');
        } catch (Exception $e) {
            return back()->withErrors(['proposal' => $e->getMessage()]);
        }
    }

    /**
     * Mahasiswa adds guidance log for proposal.
     */
    public function storeBimbingan(Request $request, ProposalSkripsi $proposal, SkripsiService $skripsiService): RedirectResponse
    {
        $user = auth()->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();

        // IDOR Protection: Mahasiswa can only add guidance to their own proposal
        if ($proposal->mahasiswa_id !== $mahasiswa->id) {
            abort(403, 'Akses Ditolak: Anda tidak berhak menambahkan bimbingan untuk proposal ini.');
        }

        $request->validate([
            'tanggal' => 'required|date',
            'catatan' => 'required|string|min:5',
        ]);

        try {
            $skripsiService->addBimbinganProposal($proposal, $request->tanggal, $request->catatan);

            return back()->with('success', 'Log bimbingan proposal berhasil ditambahkan.');
        } catch (Exception $e) {
            return back()->withErrors(['bimbingan' => $e->getMessage()]);
        }
    }

    /**
     * Dosen validates guidance log for proposal.
     */
    public function validateBimbingan(Request $request, BimbinganProposal $bimbingan, SkripsiService $skripsiService): RedirectResponse
    {
        $user = auth()->user();
        $dosen = Dosen::where('user_id', $user->id)->firstOrFail();

        try {
            $skripsiService->validateBimbinganProposal($bimbingan, $dosen->id);

            return back()->with('success', 'Catatan bimbingan berhasil divalidasi.');
        } catch (Exception $e) {
            return back()->withErrors(['bimbingan' => $e->getMessage()]);
        }
    }

    /**
     * Admin/Kaprodi schedules Ujian Proposal.
     */
    public function scheduleUjian(Request $request, ProposalSkripsi $proposal, SkripsiService $skripsiService): RedirectResponse
    {
        $request->validate([
            'tanggal_ujian' => 'required|date',
        ]);

        try {
            $skripsiService->scheduleUjianProposal($proposal, $request->tanggal_ujian);

            return back()->with('success', 'Jadwal Ujian Proposal berhasil ditetapkan.');
        } catch (Exception $e) {
            return back()->withErrors(['ujian' => $e->getMessage()]);
        }
    }

    /**
     * Admin/Penguji passes Ujian Proposal.
     */
    public function passUjian(Request $request, ProposalSkripsi $proposal, SkripsiService $skripsiService): RedirectResponse
    {
        try {
            $skripsiService->passUjianProposal($proposal);

            return back()->with('success', 'Mahasiswa dinyatakan LULUS UJIAN PROPOSAL.');
        } catch (Exception $e) {
            return back()->withErrors(['ujian' => $e->getMessage()]);
        }
    }
}
