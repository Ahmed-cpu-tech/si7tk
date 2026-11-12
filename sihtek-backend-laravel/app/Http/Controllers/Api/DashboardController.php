<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medication;
use App\Models\Prescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json(
            match (true) {
                $user->isDoctor() => $this->doctor($user),
                $user->isPharmacy() => $this->pharmacy($user),
                default => $this->patient($user),
            }
        );
    }

    protected function patient($user): array
    {
        return [
            'role' => 'patient',
            'stats' => [
                'upcoming' => $user->patientAppointments()->upcoming()->count(),
                'appointments' => $user->patientAppointments()->count(),
                'prescriptions' => Prescription::where('patient_id', $user->id)->count(),
                'doctors' => $user->patientAppointments()->where('status', 'completed')->distinct('doctor_id')->count('doctor_id'),
            ],
            'upcoming_appointments' => $user->patientAppointments()
                ->with(['doctor.doctorProfile:id,user_id,specialty,city'])
                ->upcoming()
                ->orderBy('scheduled_at')
                ->take(4)
                ->get(),
            'latest_prescriptions' => Prescription::where('patient_id', $user->id)
                ->with(['doctor:id,name', 'pharmacy:id,name,city', 'medications:id,prescription_id,name,status'])
                ->latest()
                ->take(4)
                ->get(),
        ];
    }

    protected function doctor($user): array
    {
        $stats = [
            'today' => $user->doctorAppointments()->whereDate('scheduled_at', today())->whereIn('status', ['pending', 'confirmed'])->count(),
            'pending' => $user->doctorAppointments()->where('status', 'pending')->count(),
            'patients' => $user->doctorAppointments()->where('status', 'completed')->distinct('patient_id')->count('patient_id'),
            'prescriptions' => Prescription::where('doctor_id', $user->id)->count(),
            'dispensed' => Prescription::where('doctor_id', $user->id)->where('status', 'dispensed')->count(),
        ];

        $week = collect();
        for ($i = 6; $i >= 0; $i--) {
            $day = today()->subDays($i);
            $week->push([
                'label' => $day->translatedFormat('D'),
                'date' => $day->format('d/m'),
                'count' => $user->doctorAppointments()
                    ->whereDate('scheduled_at', $day)
                    ->whereIn('status', ['pending', 'confirmed', 'completed'])
                    ->count(),
            ]);
        }

        return [
            'role' => 'doctor',
            'stats' => $stats,
            'week_chart' => $week,
            'today_appointments' => $user->doctorAppointments()
                ->with('patient:id,name,phone')
                ->whereDate('scheduled_at', today())
                ->whereIn('status', ['pending', 'confirmed'])
                ->orderBy('scheduled_at')
                ->get(),
            'pending_requests' => $user->doctorAppointments()
                ->with('patient:id,name,phone')
                ->where('status', 'pending')
                ->orderBy('scheduled_at')
                ->take(5)
                ->get(),
            'recent_dispensed' => Prescription::where('doctor_id', $user->id)
                ->where('status', 'dispensed')
                ->with(['patient:id,name', 'pharmacy:id,name'])
                ->latest('dispensed_at')
                ->take(5)
                ->get(),
        ];
    }

    protected function pharmacy($user): array
    {
        $profile = $user->pharmacyProfile;

        $stats = [
            'pending' => Prescription::where('pharmacy_id', $profile->id)->where('status', 'sent')->count(),
            'dispensed' => Prescription::where('pharmacy_id', $profile->id)->where('status', 'dispensed')->count(),
            'references' => Medication::where('pharmacy_id', $profile->id)->count(),
            'low_stock' => Medication::where('pharmacy_id', $profile->id)->where('stock_qty', '>', 0)->where('stock_qty', '<=', 5)->count(),
            'out_of_stock' => Medication::where('pharmacy_id', $profile->id)->where('stock_qty', '<=', 0)->count(),
            'units_sold' => Medication::where('pharmacy_id', $profile->id)->sum('sold_count'),
        ];

        $week = collect();
        for ($i = 6; $i >= 0; $i--) {
            $day = today()->subDays($i);
            $week->push([
                'label' => $day->translatedFormat('D'),
                'date' => $day->format('d/m'),
                'count' => Prescription::where('pharmacy_id', $profile->id)
                    ->where('status', 'dispensed')
                    ->whereDate('dispensed_at', $day)
                    ->count(),
            ]);
        }

        return [
            'role' => 'pharmacy',
            'stats' => $stats,
            'week_chart' => $week,
            'pharmacy' => $profile,
            'pending_prescriptions' => Prescription::where('pharmacy_id', $profile->id)
                ->where('status', 'sent')
                ->with(['doctor:id,name', 'patient:id,name', 'medications:id,prescription_id,name,quantity'])
                ->latest()
                ->take(5)
                ->get(),
            'low_stock_meds' => Medication::where('pharmacy_id', $profile->id)
                ->where('stock_qty', '<=', 5)
                ->orderBy('stock_qty')
                ->take(6)
                ->get(),
        ];
    }
}
