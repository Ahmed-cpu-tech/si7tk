<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AppointmentCancelled extends Notification
{
    use Queueable;

    public function __construct(public Appointment $appointment, public string $cancelledBy = 'patient')
    {
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $by = $this->cancelledBy === 'doctor'
            ? 'Dr '.$this->appointment->doctor->name
            : $this->appointment->patient->name;

        return [
            'kind' => 'appointment.cancelled',
            'title' => 'Rendez-vous annulé',
            'body' => 'Le rendez-vous du '.$this->appointment->scheduled_at->format('d/m/Y à H:i')
                .' a été annulé par '.$by.'.',
            'link' => '/appointments',
            'cancelled_by' => $this->cancelledBy,
            'cancelled_by_name' => $by,
            'scheduled_at' => $this->appointment->scheduled_at->toISOString(),
        ];
    }
}
