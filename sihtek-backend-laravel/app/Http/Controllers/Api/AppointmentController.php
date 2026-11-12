<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use App\Notifications\AppointmentCancelled;
use App\Notifications\AppointmentConfirmed;
use App\Notifications\NewAppointmentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = $user->isDoctor()
            ? $user->doctorAppointments()->with('patient:id,name,phone')
            : $user->patientAppointments()->with(['patient:id,name', 'doctor:id,name', 'doctor.doctorProfile:id,user_id,specialty,city']);

        $status = $request->string('status')->toString();
        if (in_array($status, Appointment::STATUSES, true)) {
            $query->where('status', $status);
        }

        $appointments = $query->orderBy('scheduled_at', 'desc')->paginate(15)->withQueryString();

        return response()->json([
            'role' => $user->role,
            'status_filter' => $status,
            'appointments' => $appointments,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless($request->user()->isPatient(), 403);

        $validated = $request->validate([
            'doctor_id' => ['required', 'exists:users,id,role,doctor'],
            'scheduled_at' => ['required', 'date', 'after_or_equal:now'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $slot = \Carbon\Carbon::parse($validated['scheduled_at'])->startOfMinute();

        $conflict = Appointment::where('doctor_id', $validated['doctor_id'])
            ->where('scheduled_at', $slot)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($conflict) {
            throw ValidationException::withMessages([
                'scheduled_at' => __('messages.appointments.slot_taken'),
            ]);
        }

        $appointment = Appointment::create([
            'patient_id' => $request->user()->id,
            'doctor_id' => $validated['doctor_id'],
            'scheduled_at' => $slot,
            'reason' => $validated['reason'] ?? null,
            'status' => 'pending',
        ]);

        User::find($validated['doctor_id'])->notify(new NewAppointmentRequest($appointment));

        return response()->json([
            'message' => __('messages.appointments.booked'),
            'appointment' => $appointment->load('doctor:id,name', 'doctor.doctorProfile:id,user_id,specialty,city'),
        ], 201);
    }

    public function confirm(Request $request, Appointment $appointment): JsonResponse
    {
        $this->authorizeDoctor($request, $appointment);
        abort_unless($appointment->status === 'pending', 422, __('messages.appointments.cannot_confirm'));

        $appointment->update(['status' => 'confirmed']);
        $appointment->patient->notify(new AppointmentConfirmed($appointment));

        return response()->json([
            'message' => __('messages.appointments.confirmed'),
            'appointment' => $appointment->fresh()->load('patient:id,name,phone'),
        ]);
    }

    public function cancel(Request $request, Appointment $appointment): JsonResponse
    {
        $user = $request->user();

        $allowed = $appointment->doctor_id === $user->id || $appointment->patient_id === $user->id;
        abort_unless($allowed, 403);
        abort_unless(in_array($appointment->status, ['pending', 'confirmed']), 422, __('messages.appointments.cannot_cancel'));

        $appointment->update(['status' => 'cancelled']);

        $by = $user->isDoctor() ? 'doctor' : 'patient';
        $other = $user->isDoctor() ? $appointment->patient : $appointment->doctor;
        $other->notify(new AppointmentCancelled($appointment, $by));

        return response()->json([
            'message' => __('messages.appointments.cancelled'),
            'appointment' => $appointment->fresh(),
        ]);
    }

    public function complete(Request $request, Appointment $appointment): JsonResponse
    {
        $this->authorizeDoctor($request, $appointment);
        abort_unless(in_array($appointment->status, ['pending', 'confirmed']), 422, __('messages.appointments.cannot_complete'));

        $validated = $request->validate([
            'consultation_summary' => ['nullable', 'string', 'max:3000'],
        ]);

        $appointment->update([
            'status' => 'completed',
            'consultation_summary' => $validated['consultation_summary'] ?? null,
        ]);

        return response()->json([
            'message' => __('messages.appointments.completed'),
            'appointment' => $appointment->fresh()->load('patient:id,name,phone'),
        ]);
    }

    protected function authorizeDoctor(Request $request, Appointment $appointment): void
    {
        abort_unless($request->user()->isDoctor() && $appointment->doctor_id === $request->user()->id, 403);
    }
}
