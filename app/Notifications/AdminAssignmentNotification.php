<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminAssignmentNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public $assignmentRequest)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New Admin Assignment Request',
            'message' => $this->assignmentRequest->user->name . ' has requested you as their admin.',
            'action_url' => route('dashboard', ['admin_request_id' => $this->assignmentRequest->id]),
            'assignment_request_id' => $this->assignmentRequest->id,
            'user_id' => $this->assignmentRequest->user_id,
            'user_name' => $this->assignmentRequest->user->name,
        ];
    }
}
