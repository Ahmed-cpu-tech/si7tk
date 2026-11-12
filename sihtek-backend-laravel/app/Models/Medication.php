<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medication extends Model
{
    protected $fillable = [
        'pharmacy_id',
        'name',
        'category',
        'price',
        'stock_qty',
        'sold_count',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function pharmacy(): BelongsTo
    {
        return $this->belongsTo(Pharmacy::class);
    }

    public function isLowStock(): bool
    {
        return $this->stock_qty > 0 && $this->stock_qty <= 5;
    }

    public function isOutOfStock(): bool
    {
        return $this->stock_qty <= 0;
    }
}
