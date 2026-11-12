<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewAppointmentRequest extends Notification
{
    use Queueable;

    public function __construct(public Appointment $appointment)
    {
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'kind' => 'appointment.request',
            'title' => 'Nouveau rendez-vous',
            'body' => $this->appointment->patient->name.' demande une consultation le '
                .$this->appointment->scheduled_at->format('d/m/Y à H:i').'.',
            'link' => '/appointments',
            'patient_name' => $this->appointment->patient->name,
            'scheduled_at' => $this->appointment->scheduled_at->toISOString(),
        ];
    }
}
