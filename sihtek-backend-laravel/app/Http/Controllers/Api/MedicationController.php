<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MedicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->pharmacyProfile;

        $query = Medication::where('pharmacy_id', $profile->id);

        if ($search = $request->string('q')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $medications = $query->orderBy('name')->paginate(12)->withQueryString();

        return response()->json([
            'pharmacy' => $profile,
            'medications' => $medications,
            'filters' => $request->only(['q']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $profile = $request->user()->pharmacyProfile;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('medications')->where('pharmacy_id', $profile->id)],
            'category' => ['nullable', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999'],
            'stock_qty' => ['required', 'integer', 'min:0', 'max:100000'],
        ]);

        $medication = $profile->medications()->create($validated);

        return response()->json([
            'message' => __('messages.medications.added', ['name' => $validated['name']]),
            'medication' => $medication,
        ], 201);
    }

    public function update(Request $request, Medication $medication): JsonResponse
    {
        $profile = $request->user()->pharmacyProfile;
        abort_unless($medication->pharmacy_id === $profile->id, 403);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('medications')->ignore($medication->id)->where('pharmacy_id', $profile->id)],
            'category' => ['sometimes', 'nullable', 'string', 'max:100'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0', 'max:99999'],
            'stock_qty' => ['sometimes', 'required', 'integer', 'min:0', 'max:100000'],
        ]);

        $medication->update($validated);

        return response()->json([
            'message' => __('messages.medications.updated'),
            'medication' => $medication->fresh(),
        ]);
    }

    public function destroy(Request $request, Medication $medication): JsonResponse
    {
        $profile = $request->user()->pharmacyProfile;
        abort_unless($medication->pharmacy_id === $profile->id, 403);

        $medication->delete();

        return response()->json(['message' => __('messages.medications.deleted')]);
    }
}
