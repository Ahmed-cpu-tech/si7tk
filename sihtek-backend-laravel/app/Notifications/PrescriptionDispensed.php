<?php

namespace App\Notifications;

use App\Models\Prescription;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PrescriptionDispensed extends Notification
{
    use Queueable;

    public function __construct(public Prescription $prescription)
    {
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'kind' => 'prescription.dispensed',
            'title' => 'Médicaments récupérés',
            'body' => $this->prescription->patient->name.' a récupéré ses médicaments à la '
                .$this->prescription->pharmacy->name.' le '.$this->prescription->dispensed_at->format('d/m/Y à H:i').'.',
            'link' => '/prescriptions/'.$this->prescription->id,
            'patient_name' => $this->prescription->patient->name,
            'pharmacy_name' => $this->prescription->pharmacy->name,
            'dispensed_at' => $this->prescription->dispensed_at?->toISOString(),
        ];
    }
}
