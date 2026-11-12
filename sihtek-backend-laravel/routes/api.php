<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\MedicationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Sihtek API — consumed by the React SPA (sihtek-frontend)
|--------------------------------------------------------------------------
*/

/*
| Public routes
*/
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');

Route::get('/meta', [ProfileController::class, 'meta']);

Route::get('/doctors', [DoctorController::class, 'index']);
Route::get('/doctors/{doctor}', [DoctorController::class, 'show']);
Route::get('/doctors/{doctor}/slots', [DoctorController::class, 'slots']);

/*
| Authenticated routes (Sanctum bearer token)
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::patch('/doctor-profile', [DoctorController::class, 'update'])->middleware('role:doctor');
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/mark-read', [NotificationController::class, 'markAllRead']);

    // Appointments
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store'])->middleware('role:patient');
    Route::patch('/appointments/{appointment}/confirm', [AppointmentController::class, 'confirm'])->middleware('role:doctor');
    Route::patch('/appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']);
    Route::patch('/appointments/{appointment}/complete', [AppointmentController::class, 'complete'])->middleware('role:doctor');

    // Prescriptions
    Route::get('/prescriptions/create-data', [PrescriptionController::class, 'createData'])->middleware('role:doctor');
    Route::get('/prescriptions', [PrescriptionController::class, 'index']);
    Route::post('/prescriptions', [PrescriptionController::class, 'store'])->middleware('role:doctor');
    Route::get('/prescriptions/{prescription}', [PrescriptionController::class, 'show']);
    Route::post('/prescriptions/{prescription}/dispense', [PrescriptionController::class, 'dispense'])->middleware('role:pharmacy');

    // Pharmacy inventory
    Route::get('/medications', [MedicationController::class, 'index'])->middleware('role:pharmacy');
    Route::post('/medications', [MedicationController::class, 'store'])->middleware('role:pharmacy');
    Route::patch('/medications/{medication}', [MedicationController::class, 'update'])->middleware('role:pharmacy');
    Route::delete('/medications/{medication}', [MedicationController::class, 'destroy'])->middleware('role:pharmacy');
});
