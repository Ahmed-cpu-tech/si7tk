<?php

/*
|--------------------------------------------------------------------------
| Sihtek API messages — Français
|--------------------------------------------------------------------------
*/

return [
    'auth' => [
        'login_failed' => 'Email ou mot de passe incorrect.',
        'logged_out' => 'Déconnexion réussie.',
        'forgot_password' => 'Si cet email existe, un lien de réinitialisation a été envoyé (voir storage/logs/laravel.log en local).',
    ],

    'appointments' => [
        'booked' => 'Votre demande de rendez-vous a été envoyée. Vous serez notifié dès sa confirmation.',
        'slot_taken' => 'Ce créneau vient d’être pris. Veuillez en choisir un autre.',
        'confirmed' => 'Rendez-vous confirmé. Le patient a été notifié.',
        'cannot_confirm' => 'Ce rendez-vous ne peut plus être confirmé.',
        'cancelled' => 'Le rendez-vous a été annulé.',
        'cannot_cancel' => 'Ce rendez-vous ne peut plus être annulé.',
        'completed' => 'Consultation terminée. Vous pouvez maintenant créer l’ordonnance.',
        'cannot_complete' => 'Ce rendez-vous ne peut plus être terminé.',
    ],

    'prescriptions' => [
        'sent' => 'Ordonnance envoyée à la pharmacie. Vous serez notifié du retrait des médicaments.',
        'delivered' => 'Ordonnance délivrée. Le médecin et le patient ont été notifiés.',
        'already_processed' => 'Cette ordonnance a déjà été traitée.',
    ],

    'medications' => [
        'added' => 'Médicament « :name » ajouté au stock.',
        'updated' => 'Médicament mis à jour.',
        'deleted' => 'Médicament supprimé du stock.',
    ],

    'profile' => [
        'updated' => 'Profil mis à jour avec succès.',
    ],

    'notifications' => [
        'marked_read' => 'Notifications marquées comme lues.',
    ],

    'role' => [
        'unauthorized' => 'Accès non autorisé pour ce rôle.',
    ],
];
