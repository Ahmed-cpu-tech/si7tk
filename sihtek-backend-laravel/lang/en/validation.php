<?php

/*
|--------------------------------------------------------------------------
| Validation — English (framework default coverage for the API)
|--------------------------------------------------------------------------
*/

return [
    'required' => 'The :attribute field is required.',
    'required_if' => 'The :attribute field is required when :other is :value.',
    'email' => 'The :attribute must be a valid email address.',
    'unique' => 'The :attribute has already been taken.',
    'confirmed' => 'The :attribute confirmation does not match.',
    'min' => [
        'numeric' => 'The :attribute must be at least :min.',
        'string' => 'The :attribute must be at least :min characters.',
        'array' => 'The :attribute must have at least :min items.',
    ],
    'max' => [
        'numeric' => 'The :attribute may not be greater than :max.',
        'string' => 'The :attribute may not be greater than :max characters.',
        'array' => 'The :attribute may not have more than :max items.',
    ],
    'numeric' => 'The :attribute must be a number.',
    'integer' => 'The :attribute must be an integer.',
    'date' => 'The :attribute must be a valid date.',
    'date_format' => 'The :attribute does not match the format :format.',
    'after_or_equal' => 'The :attribute must be a date after or equal to :date.',
    'in' => 'The selected :attribute is invalid.',
    'string' => 'The :attribute must be a string.',
    'regex' => 'The :attribute format is invalid.',
    'exists' => 'The selected :attribute is invalid.',
    'password' => 'The password must be at least 8 characters and contain letters and numbers.',

    'attributes' => [
        'name' => 'name',
        'email' => 'email',
        'phone' => 'phone',
        'password' => 'password',
        'role' => 'role',
        'specialty' => 'specialty',
        'city' => 'city',
        'bio' => 'bio',
        'consultation_fee' => 'consultation fee',
        'pharmacy_name' => 'pharmacy name',
        'address' => 'address',
        'reason' => 'reason',
        'scheduled_at' => 'appointment time',
        'consultation_summary' => 'consultation summary',
        'doctor_id' => 'doctor',
        'patient_id' => 'patient',
        'pharmacy_id' => 'pharmacy',
        'appointment_id' => 'appointment',
        'medications' => 'medications',
        'dosage' => 'dosage',
        'duration' => 'duration',
        'quantity' => 'quantity',
        'instructions' => 'instructions',
        'price' => 'price',
        'stock_qty' => 'stock quantity',
        'category' => 'category',
        'lines' => 'lines',
        'status' => 'status',
        'date' => 'date',
        'q' => 'search',
    ],
];
