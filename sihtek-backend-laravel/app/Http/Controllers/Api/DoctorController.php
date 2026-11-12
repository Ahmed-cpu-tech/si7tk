<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    /**
     * Public doctors directory with search & filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Doctor::query()->with('user:id,name');

        if ($search = $request->string('q')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('specialty', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        if ($specialty = $request->string('specialty')->toString()) {
            $query->where('specialty', $specialty);
        }

        if ($city = $request->string('city')->toString()) {
            $query->where('city', $city);
        }

        $doctors = $query->orderBy('city')->paginate(9)->withQueryString();

        return response()->json([
            'doctors' => [
                'data' => collect($doctors->items())->map(fn ($d) => [
                    'id' => $d->id,
                    'user_id' => $d->user_id,
                    'name' => $d->user->name,
                    'specialty' => $d->specialty,
                    'city' => $d->city,
                    'bio' => $d->bio,
                    'consultation_fee' => (float) $d->consultation_fee,
                ])->all(),
                'current_page' => $doctors->currentPage(),
                'last_page' => $doctors->lastPage(),
                'per_page' => $doctors->perPage(),
                'total' => $doctors->total(),
            ],
            'filters' => $request->only(['q', 'specialty', 'city']),
            'specialties' => config('sihtek.specialties'),
            'cities' => config('sihtek.cities'),
        ]);
    }

    public function show(Doctor $doctor): JsonResponse
    {
        $doctor->load('user:id,name');

        $completed = Appointment::where('doctor_id', $doctor->user_id)->where('status', 'completed')->count();

        return response()->json([
            'doctor' => [
                'id' => $doctor->id,
                'user_id' => $doctor->user_id,
                'name' => $doctor->user->name,
                'specialty' => $doctor->specialty,
                'city' => $doctor->city,
                'bio' => $doctor->bio,
                'consultation_fee' => (float) $doctor->consultation_fee,
                'completed_appointments' => $completed,
            ],
        ]);
    }

    /**
     * Available slots for a doctor on a given date.
     */
    public function slots(Doctor $doctor, Request $request): JsonResponse
    {
        $request->validate(['date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today']]);

        $date = $request->date('date');
        $config = config('sihtek.appointment');
        $minutes = $config['slot_minutes'];

        $taken = Appointment::where('doctor_id', $doctor->user_id)
            ->whereDate('scheduled_at', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->pluck('scheduled_at')
            ->map(fn ($dt) => $dt->format('H:i'))
            ->all();

        $slots = [];
        $cursor = $date->copy()->setTime($config['start_hour'], 0);
        $end = $date->copy()->setTime($config['end_hour'], 0);

        while ($cursor->lt($end)) {
            $time = $cursor->format('H:i');
            $slots[] = [
                'time' => $time,
                'available' => ! in_array($time, $taken, true) && $cursor->gt(now()),
            ];
            $cursor->addMinutes($minutes);
        }

        return response()->json(['date' => $date->format('Y-m-d'), 'slots' => $slots]);
    }

    /**
     * Doctor updates his own professional profile.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user->isDoctor(), 403);

        $validated = $request->validate([
            'specialty' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'bio' => 'nullable|string|max:2000',
            'consultation_fee' => 'required|numeric|min:0|max:10000',
        ]);

        $user->doctorProfile->update($validated);

        return response()->json([
            'message' => __('messages.profile.updated'),
            'doctor_profile' => $user->doctorProfile->fresh(),
        ]);
    }
}
