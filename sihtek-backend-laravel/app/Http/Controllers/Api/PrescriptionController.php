<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Medication;
use App\Models\Pharmacy;
use App\Models\Prescription;
use App\Models\PrescriptionMedication;
use App\Models\User;
use App\Notifications\PrescriptionDelivered;
use App\Notifications\PrescriptionDispensed;
use App\Notifications\PrescriptionSent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PrescriptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = match (true) {
            $user->isDoctor() => Prescription::where('doctor_id', $user->id),
            $user->isPharmacy() => Prescription::where('pharmacy_id', $user->pharmacyProfile->id),
            default => Prescription::where('patient_id', $user->id),
        };

        $prescriptions = $query->with([
            'doctor:id,name', 'patient:id,name', 'pharmacy:id,name,city',
            'medications:id,prescription_id,name,status,quantity',
        ])->latest()->paginate(12);

        return response()->json([
            'role' => $user->role,
            'prescriptions' => $prescriptions,
        ]);
    }

    /**
     * Data needed by the "create prescription" form (doctor only).
     */
    public function createData(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isDoctor(), 403);

        $patients = User::where('role', 'patient')
            ->whereHas('patientAppointments', fn ($q) => $q->where('doctor_id', $user->id))
            ->orderBy('name')
            ->get(['id', 'name', 'phone']);

        $pharmacies = Pharmacy::with(['medications' => fn ($m) => $m->where('stock_qty', '>', 0)->orderBy('name')])
            ->get(['id', 'name', 'city', 'address'])
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'city' => $p->city,
                'address' => $p->address,
                'medication_names' => $p->medications->pluck('name')->take(100)->all(),
            ]);

        return response()->json([
            'patients' => $patients,
            'pharmacies' => $pharmacies,
            'prefill' => [
                'patient_id' => $request->integer('patient_id') ?: null,
                'appointment_id' => $request->integer('appointment_id') ?: null,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isDoctor(), 403);

        $validated = $request->validate([
            'patient_id' => ['required', Rule::exists('users', 'id')->where('role', 'patient')],
            'pharmacy_id' => ['required', 'exists:pharmacies,id'],
            'appointment_id' => ['nullable', Rule::exists('appointments', 'id')->where('doctor_id', $user->id)],
            'medications' => ['required', 'array', 'min:1', 'max:15'],
            'medications.*.name' => ['required', 'string', 'max:255'],
            'medications.*.dosage' => ['nullable', 'string', 'max:100'],
            'medications.*.duration' => ['nullable', 'string', 'max:100'],
            'medications.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
            'medications.*.instructions' => ['nullable', 'string', 'max:500'],
        ]);

        $prescription = Prescription::create([
            'patient_id' => $validated['patient_id'],
            'doctor_id' => $user->id,
            'pharmacy_id' => $validated['pharmacy_id'],
            'appointment_id' => $validated['appointment_id'] ?? null,
            'status' => 'sent',
        ]);

        foreach ($validated['medications'] as $med) {
            $prescription->medications()->create([
                'name' => $med['name'],
                'dosage' => $med['dosage'] ?? null,
                'duration' => $med['duration'] ?? null,
                'quantity' => $med['quantity'],
                'instructions' => $med['instructions'] ?? null,
                'status' => 'pending',
            ]);
        }

        $pharmacyUser = Pharmacy::find($validated['pharmacy_id'])->user;
        $pharmacyUser->notify(new PrescriptionSent($prescription->load('patient', 'doctor', 'medications')));

        return response()->json([
            'message' => __('messages.prescriptions.sent'),
            'prescription' => $prescription->load(['patient:id,name', 'pharmacy:id,name,city', 'medications']),
        ], 201);
    }

    public function show(Request $request, Prescription $prescription): JsonResponse
    {
        $user = $request->user();
        $this->authorizeAccess($user, $prescription);

        $prescription->load([
            'patient:id,name,phone', 'doctor:id,name',
            'doctor.doctorProfile:id,user_id,specialty,city',
            'pharmacy.user:id', 'medications',
        ]);

        $stock = [];
        if ($user->isPharmacy()) {
            $names = $prescription->medications->pluck('name')->map(fn ($n) => mb_strtolower($n));
            $stock = Medication::where('pharmacy_id', $user->pharmacyProfile->id)
                ->whereIn(\DB::raw('LOWER(name)'), $names)
                ->get(['id', 'name', 'stock_qty', 'price'])
                ->keyBy(fn ($m) => mb_strtolower($m->name))
                ->map(fn ($m) => ['id' => $m->id, 'stock_qty' => $m->stock_qty, 'price' => $m->price])
                ->all();
        }

        return response()->json([
            'role' => $user->role,
            'prescription' => $prescription,
            'stock' => $stock,
        ]);
    }

    /**
     * Pharmacy validates the prescription: marks each line as delivered or unavailable,
     * decrements the stock and notifies the doctor + patient.
     */
    public function dispense(Request $request, Prescription $prescription): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isPharmacy() && $prescription->pharmacy_id === $user->pharmacyProfile->id, 403);
        abort_unless($prescription->status === 'sent', 422, __('messages.prescriptions.already_processed'));

        $validated = $request->validate([
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.id' => ['required', Rule::exists('prescription_medications', 'id')->where('prescription_id', $prescription->id)],
            'lines.*.status' => ['required', 'in:given,unavailable'],
            'lines.*.quantity' => ['nullable', 'integer', 'min:0', 'max:999'],
        ]);

        foreach ($validated['lines'] as $lineData) {
            $line = PrescriptionMedication::find($lineData['id']);
            $qty = (int) ($lineData['quantity'] ?? $line->quantity);

            $line->update(['status' => $lineData['status']]);

            if ($lineData['status'] === 'given') {
                $med = Medication::where('pharmacy_id', $user->pharmacyProfile->id)
                    ->whereRaw('LOWER(name) = ?', [mb_strtolower($line->name)])
                    ->first();

                if ($med) {
                    $deducted = min($qty, $med->stock_qty);
                    $med->decrement('stock_qty', $deducted);
                    $med->increment('sold_count', $deducted);
                }
            }
        }

        $prescription->update([
            'status' => 'dispensed',
            'dispensed_at' => now(),
        ]);

        $prescription->doctor->notify(new PrescriptionDispensed($prescription->load('patient', 'pharmacy')));
        $prescription->patient->notify(new PrescriptionDelivered($prescription->load('pharmacy')));

        return response()->json([
            'message' => __('messages.prescriptions.delivered'),
            'prescription' => $prescription->fresh()->load('medications'),
        ]);
    }

    protected function authorizeAccess($user, Prescription $prescription): void
    {
        $allowed = $prescription->patient_id === $user->id
            || $prescription->doctor_id === $user->id
            || ($user->isPharmacy() && $prescription->pharmacy_id === $user->pharmacyProfile?->id);

        abort_unless($allowed, 403);
    }
}
