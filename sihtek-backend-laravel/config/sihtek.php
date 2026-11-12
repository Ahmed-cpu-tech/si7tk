<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Sihtek configuration
    |--------------------------------------------------------------------------
    */

    'specialties' => [
        'Médecine générale',
        'Cardiologie',
        'Dermatologie',
        'Pédiatrie',
        'Chirurgie dentaire',
        'Ophtalmologie',
        'Gynécologie',
        'Orthopédie',
        'ORL',
        'Neurologie',
        'Psychiatrie',
        'Urologie',
    ],

    'cities' => [
        'Casablanca',
        'Rabat',
        'Marrakech',
        'Fès',
        'Tanger',
        'Agadir',
        'Meknès',
        'Oujda',
        'Kénitra',
        'Tétouan',
    ],

    'appointment' => [
        // Consultation slots: from 09:00 to 17:30, every 30 minutes
        'start_hour' => 9,
        'end_hour' => 18,
        'slot_minutes' => 30,
    ],

];
