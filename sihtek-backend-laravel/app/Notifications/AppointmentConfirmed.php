<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AppointmentConfirmed extends Notification
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
            'kind' => 'appointment.confirmed',
            'title' => 'Rendez-vous confirmé',
            'body' => 'Dr '.$this->appointment->doctor->name.' a confirmé votre rendez-vous du '
                .$this->appointment->scheduled_at->format('d/m/Y à H:i').'.',
            'link' => '/appointments',
            'doctor_name' => $this->appointment->doctor->name,
            'scheduled_at' => $this->appointment->scheduled_at->toISOString(),
        ];
    }
}
