<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['required', Rule::in(User::ROLES)],
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+\s-]{8,20}$/'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            // Doctor fields
            'specialty' => ['required_if:role,doctor', 'nullable', 'string', 'max:100'],
            'city' => ['required_if:role,doctor,pharmacy', 'nullable', 'string', 'max:100'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            // Pharmacy fields
            'pharmacy_name' => ['required_if:role,pharmacy', 'nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(), // local app: no email verification needed
        ]);

        if ($user->isDoctor()) {
            Doctor::create([
                'user_id' => $user->id,
                'specialty' => $validated['specialty'],
                'city' => $validated['city'],
                'consultation_fee' => $validated['consultation_fee'] ?? 200,
                'bio' => null,
            ]);
        }

        if ($user->isPharmacy()) {
            Pharmacy::create([
                'user_id' => $user->id,
                'name' => $validated['pharmacy_name'],
                'address' => $validated['address'] ?? null,
                'city' => $validated['city'],
                'phone' => $validated['phone'],
            ]);
        }

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'user' => $user->load('doctorProfile', 'pharmacyProfile'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('messages.auth.login_failed'),
            ]);
        }

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'user' => $user->load('doctorProfile', 'pharmacyProfile'),
            'token' => $token,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('doctorProfile', 'pharmacyProfile'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => __('messages.auth.logged_out')]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => __('messages.auth.forgot_password'),
        ]);
    }
}
