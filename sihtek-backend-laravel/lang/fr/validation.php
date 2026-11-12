<?php

/*
|--------------------------------------------------------------------------
| Validation — Français (couverture framework pour l'API)
|--------------------------------------------------------------------------
*/

return [
    'required' => 'Le champ :attribute est obligatoire.',
    'required_if' => 'Le champ :attribute est obligatoire quand :other vaut :value.',
    'email' => ':attribute doit être une adresse email valide.',
    'unique' => ':attribute est déjà utilisé.',
    'confirmed' => 'La confirmation de :attribute ne correspond pas.',
    'min' => [
        'numeric' => ':attribute doit être au moins :min.',
        'string' => ':attribute doit contenir au moins :min caractères.',
        'array' => ':attribute doit contenir au moins :min éléments.',
    ],
    'max' => [
        'numeric' => ':attribute ne peut pas dépasser :max.',
        'string' => ':attribute ne peut pas dépasser :max caractères.',
        'array' => ':attribute ne peut pas contenir plus de :max éléments.',
    ],
    'numeric' => ':attribute doit être un nombre.',
    'integer' => ':attribute doit être un nombre entier.',
    'date' => ':attribute doit être une date valide.',
    'date_format' => ':attribute ne correspond pas au format :format.',
    'after_or_equal' => ':attribute doit être une date postérieure ou égale au :date.',
    'in' => ':attribute sélectionné est invalide.',
    'string' => ':attribute doit être une chaîne de caractères.',
    'regex' => 'Le format de :attribute est invalide.',
    'exists' => ':attribute sélectionné est invalide.',
    'password' => 'Le mot de passe doit contenir au moins 8 caractères avec des lettres et des chiffres.',

    'attributes' => [
        'name' => 'le nom complet',
        'email' => 'l’email',
        'phone' => 'le téléphone',
        'password' => 'le mot de passe',
        'role' => 'le type de compte',
        'specialty' => 'la spécialité',
        'city' => 'la ville',
        'bio' => 'la bio',
        'consultation_fee' => 'le tarif de la consultation',
        'pharmacy_name' => 'le nom de la pharmacie',
        'address' => 'l’adresse',
        'reason' => 'le motif de la visite',
        'scheduled_at' => 'la date du rendez-vous',
        'consultation_summary' => 'le compte rendu',
        'doctor_id' => 'le médecin',
        'patient_id' => 'le patient',
        'pharmacy_id' => 'la pharmacie',
        'appointment_id' => 'le rendez-vous',
        'medications' => 'les médicaments',
        'dosage' => 'la posologie',
        'duration' => 'la durée',
        'quantity' => 'la quantité',
        'instructions' => 'les instructions',
        'price' => 'le prix',
        'stock_qty' => 'la quantité en stock',
        'category' => 'la catégorie',
        'lines' => 'les lignes',
        'status' => 'le statut',
        'date' => 'la date',
        'q' => 'la recherche',
    ],
];
