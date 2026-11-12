<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrescriptionMedication extends Model
{
    protected $fillable = [
        'prescription_id',
        'name',
        'dosage',
        'duration',
        'quantity',
        'instructions',
        'status',
    ];

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }
}
