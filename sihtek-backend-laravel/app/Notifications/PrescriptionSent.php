<?php

namespace App\Notifications;

use App\Models\Prescription;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PrescriptionSent extends Notification
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
            'kind' => 'prescription.sent',
            'title' => 'Nouvelle ordonnance reçue',
            'body' => 'Dr '.$this->prescription->doctor->name.' a envoyé une ordonnance pour '
                .$this->prescription->patient->name.' ('.$this->prescription->medications->count().' médicament(s)).',
            'link' => '/prescriptions/'.$this->prescription->id,
            'doctor_name' => $this->prescription->doctor->name,
            'patient_name' => $this->prescription->patient->name,
            'medications_count' => $this->prescription->medications->count(),
        ];
    }
}
