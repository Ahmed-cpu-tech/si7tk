<?php

namespace App\Notifications;

use App\Models\Prescription;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PrescriptionDelivered extends Notification
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
            'kind' => 'prescription.delivered',
            'title' => 'Ordonnance prête / délivrée',
            'body' => 'Vos médicaments ont été délivrés par la '.$this->prescription->pharmacy->name
                .' le '.$this->prescription->dispensed_at->format('d/m/Y à H:i').'.',
            'link' => '/prescriptions/'.$this->prescription->id,
            'pharmacy_name' => $this->prescription->pharmacy->name,
            'dispensed_at' => $this->prescription->dispensed_at?->toISOString(),
        ];
    }
}
