<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Form option lists (specialties / cities) used by register & profile pages.
     */
    public function meta(): JsonResponse
    {
        return response()->json([
            'specialties' => config('sihtek.specialties'),
            'cities' => config('sihtek.cities'),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+\s-]{8,20}$/'],
            'specialty' => ['required_if:role,doctor', 'nullable', 'string', 'max:100'],
            'city' => ['required_if:role,doctor,pharmacy', 'nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'pharmacy_name' => ['required_if:role,pharmacy', 'nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
        ]);

        if ($user->isDoctor() && $user->doctorProfile) {
            $user->doctorProfile->update([
                'specialty' => $validated['specialty'],
                'city' => $validated['city'],
                'bio' => $validated['bio'] ?? null,
                'consultation_fee' => $validated['consultation_fee'] ?? $user->doctorProfile->consultation_fee,
            ]);
        }

        if ($user->isPharmacy() && $user->pharmacyProfile) {
            $user->pharmacyProfile->update([
                'name' => $validated['pharmacy_name'],
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'],
            ]);
        }

        return response()->json([
            'message' => __('messages.profile.updated'),
            'user' => $user->fresh()->load('doctorProfile', 'pharmacyProfile'),
        ]);
    }
}
