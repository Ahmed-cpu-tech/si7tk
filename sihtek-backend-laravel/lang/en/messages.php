<?php

/*
|--------------------------------------------------------------------------
| Sihtek API messages — English
|--------------------------------------------------------------------------
*/

return [
    'auth' => [
        'login_failed' => 'Incorrect email or password.',
        'logged_out' => 'Logged out successfully.',
        'forgot_password' => 'If this email exists, a reset link has been sent (see storage/logs/laravel.log locally).',
    ],

    'appointments' => [
        'booked' => 'Your appointment request has been sent. You will be notified once it is confirmed.',
        'slot_taken' => 'This slot has just been taken. Please choose another one.',
        'confirmed' => 'Appointment confirmed. The patient has been notified.',
        'cannot_confirm' => 'This appointment can no longer be confirmed.',
        'cancelled' => 'The appointment has been cancelled.',
        'cannot_cancel' => 'This appointment can no longer be cancelled.',
        'completed' => 'Consultation completed. You can now create the prescription.',
        'cannot_complete' => 'This appointment cannot be completed.',
    ],

    'prescriptions' => [
        'sent' => 'Prescription sent to the pharmacy. You will be notified when the medicines are picked up.',
        'delivered' => 'Prescription delivered. The doctor and the patient have been notified.',
        'already_processed' => 'This prescription has already been processed.',
    ],

    'medications' => [
        'added' => 'Medication ":name" added to stock.',
        'updated' => 'Medication updated.',
        'deleted' => 'Medication removed from stock.',
    ],

    'profile' => [
        'updated' => 'Profile updated successfully.',
    ],

    'notifications' => [
        'marked_read' => 'Notifications marked as read.',
    ],

    'role' => [
        'unauthorized' => 'Access not authorized for this role.',
    ],
];
