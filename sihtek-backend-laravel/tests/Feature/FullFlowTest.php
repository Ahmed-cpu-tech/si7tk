<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Medication;
use App\Models\Pharmacy;
use App\Models\Prescription;
use App\Models\User;
use App\Notifications\AppointmentConfirmed;
use App\Notifications\NewAppointmentRequest;
use App\Notifications\PrescriptionDelivered;
use App\Notifications\PrescriptionDispensed;
use App\Notifications\PrescriptionSent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class FullFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $doctor;
    private User $pharmacyUser;
    private User $patient;
    private Pharmacy $pharmacy;
    private Medication $medication;

    protected function setUp(): void
    {
        parent::setUp();

        $this->doctor = User::create([
            'name' => 'Dr Test',
            'email' => 'doctor@test.ma',
            'phone' => '0600000001',
            'role' => 'doctor',
            'password' => 'password',
        ]);
        Doctor::create([
            'user_id' => $this->doctor->id,
            'specialty' => 'Cardiologie',
            'city' => 'Casablanca',
            'consultation_fee' => 250,
        ]);

        $this->pharmacyUser = User::create([
            'name' => 'Pharma Test',
            'email' => 'pharmacy@test.ma',
            'phone' => '0600000002',
            'role' => 'pharmacy',
            'password' => 'password',
        ]);
        $this->pharmacy = Pharmacy::create([
            'user_id' => $this->pharmacyUser->id,
            'name' => 'Pharmacie Test',
            'city' => 'Casablanca',
        ]);

        $this->patient = User::create([
            'name' => 'Patient Test',
            'email' => 'patient@test.ma',
            'phone' => '0600000003',
            'role' => 'patient',
            'password' => 'password',
        ]);

        $this->medication = Medication::create([
            'pharmacy_id' => $this->pharmacy->id,
            'name' => 'Doliprane 1000mg',
            'category' => 'Antalgique',
            'price' => 25,
            'stock_qty' => 10,
        ]);
    }

    public function test_complete_medical_flow_from_appointment_to_dispense(): void
    {
        Notification::fake();

        // ─── 1. Patient books an appointment ───
        $this->actingAs($this->patient, 'sanctum')
            ->postJson('/api/appointments', [
                'doctor_id' => $this->doctor->id,
                'scheduled_at' => now()->addDay()->setTime(10, 0)->format('Y-m-d H:i:s'),
                'reason' => 'Douleurs thoraciques',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('appointments', [
            'patient_id' => $this->patient->id,
            'doctor_id' => $this->doctor->id,
            'status' => 'pending',
        ]);

        Notification::assertSentTo($this->doctor, NewAppointmentRequest::class);

        // ─── 2. Doctor confirms ───
        $appointment = Appointment::first();
        $this->actingAs($this->doctor, 'sanctum')
            ->patchJson("/api/appointments/{$appointment->id}/confirm")
            ->assertOk();

        $this->assertEquals('confirmed', $appointment->fresh()->status);
        Notification::assertSentTo($this->patient, AppointmentConfirmed::class);

        // ─── 3. Doctor completes the consultation with a summary ───
        $this->actingAs($this->doctor, 'sanctum')
            ->patchJson("/api/appointments/{$appointment->id}/complete", [
                'consultation_summary' => 'Angine virale, repos recommandé.',
            ])
            ->assertOk();

        $this->assertEquals('completed', $appointment->fresh()->status);
        $this->assertEquals('Angine virale, repos recommandé.', $appointment->fresh()->consultation_summary);

        // ─── 4. Doctor writes the prescription and sends it to the pharmacy ───
        $this->actingAs($this->doctor, 'sanctum')
            ->postJson('/api/prescriptions', [
                'patient_id' => $this->patient->id,
                'pharmacy_id' => $this->pharmacy->id,
                'appointment_id' => $appointment->id,
                'medications' => [
                    [
                        'name' => 'Doliprane 1000mg',
                        'dosage' => '1000mg',
                        'duration' => '5 jours',
                        'quantity' => 2,
                        'instructions' => '1 comprimé matin et soir',
                    ],
                ],
            ])
            ->assertStatus(201);

        $prescription = Prescription::first();
        $this->assertNotNull($prescription);
        $this->assertEquals('sent', $prescription->status);
        $this->assertEquals($this->pharmacy->id, $prescription->pharmacy_id);
        $this->assertCount(1, $prescription->medications);

        Notification::assertSentTo($this->pharmacyUser, PrescriptionSent::class);

        // ─── 5. Pharmacy dispenses: stock decremented, doctor + patient notified ───
        $line = $prescription->medications->first();

        $this->actingAs($this->pharmacyUser, 'sanctum')
            ->postJson("/api/prescriptions/{$prescription->id}/dispense", [
                'lines' => [
                    ['id' => $line->id, 'status' => 'given', 'quantity' => 2],
                ],
            ])
            ->assertOk();

        $this->assertEquals('dispensed', $prescription->fresh()->status);
        $this->assertNotNull($prescription->fresh()->dispensed_at);
        $this->assertEquals('given', $line->fresh()->status);
        $this->assertEquals(8, $this->medication->fresh()->stock_qty);
        $this->assertEquals(2, $this->medication->fresh()->sold_count);

        Notification::assertSentTo($this->doctor, PrescriptionDispensed::class);
        Notification::assertSentTo($this->patient, PrescriptionDelivered::class);

        // ─── 6. Double dispense is blocked ───
        $this->actingAs($this->pharmacyUser, 'sanctum')
            ->postJson("/api/prescriptions/{$prescription->id}/dispense", [
                'lines' => [
                    ['id' => $line->id, 'status' => 'given', 'quantity' => 2],
                ],
            ])
            ->assertStatus(422);

        $this->assertEquals(8, $this->medication->fresh()->stock_qty);
    }

    public function test_roles_and_endpoints_are_protected(): void
    {
        // Guests get 401 JSON
        $this->getJson('/api/dashboard')->assertStatus(401);
        $this->postJson('/api/appointments', ['doctor_id' => $this->doctor->id])->assertStatus(401);

        // Public endpoints work for guests
        $this->getJson('/api/meta')->assertOk();
        $this->getJson('/api/doctors')->assertOk();
        $this->getJson('/api/doctors/'.$this->doctor->doctorProfile->id)->assertOk();

        $slots = $this->getJson('/api/doctors/'.$this->doctor->doctorProfile->id.'/slots?date='.today()->addDay()->format('Y-m-d'))
            ->assertOk()
            ->assertJsonStructure(['date', 'slots' => [['time', 'available']]]);
        $this->assertStringContainsString('09:00', $slots->getContent());
        $this->assertStringContainsString('17:30', $slots->getContent());

        // Role separation
        $this->actingAs($this->patient, 'sanctum')->getJson('/api/dashboard')->assertOk();
        $this->actingAs($this->patient, 'sanctum')->getJson('/api/medications')->assertForbidden();
        $this->actingAs($this->patient, 'sanctum')->getJson('/api/prescriptions/create-data')->assertForbidden();

        $this->actingAs($this->doctor, 'sanctum')->getJson('/api/dashboard')->assertOk();
        $this->actingAs($this->doctor, 'sanctum')->getJson('/api/appointments')->assertOk();
        $this->actingAs($this->doctor, 'sanctum')->getJson('/api/prescriptions')->assertOk();
        $this->actingAs($this->doctor, 'sanctum')->getJson('/api/prescriptions/create-data')->assertOk();
        $this->actingAs($this->doctor, 'sanctum')->getJson('/api/medications')->assertForbidden();

        $this->actingAs($this->pharmacyUser, 'sanctum')->getJson('/api/dashboard')->assertOk();
        $this->actingAs($this->pharmacyUser, 'sanctum')->getJson('/api/medications')->assertOk();
        $this->actingAs($this->pharmacyUser, 'sanctum')->postJson('/api/appointments', [])->assertForbidden();

        // Notifications feed
        $this->actingAs($this->patient, 'sanctum')
            ->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonStructure(['notifications', 'unread']);
    }

    public function test_patient_cannot_double_book_a_taken_slot(): void
    {
        Appointment::create([
            'patient_id' => $this->patient->id,
            'doctor_id' => $this->doctor->id,
            'scheduled_at' => now()->addDays(2)->setTime(10, 0),
            'status' => 'confirmed',
        ]);

        $otherPatient = User::create([
            'name' => 'Other Patient',
            'email' => 'other@test.ma',
            'phone' => '0600000004',
            'role' => 'patient',
            'password' => 'password',
        ]);

        $this->actingAs($otherPatient, 'sanctum')
            ->postJson('/api/appointments', [
                'doctor_id' => $this->doctor->id,
                'scheduled_at' => now()->addDays(2)->setTime(10, 0)->format('Y-m-d H:i:s'),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('scheduled_at');

        $this->assertEquals(1, Appointment::where('doctor_id', $this->doctor->id)->count());
    }

    public function test_register_login_and_logout_via_api(): void
    {
        $register = $this->postJson('/api/register', [
            'role' => 'patient',
            'name' => 'Nouveau Patient',
            'email' => 'new@test.ma',
            'phone' => '0611223344',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertStatus(201)->assertJsonStructure(['user', 'token']);

        $token = $register->json('token');

        // /me works with the token
        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.email', 'new@test.ma');

        // Wrong password is rejected
        $this->postJson('/api/login', ['email' => 'new@test.ma', 'password' => 'wrong'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');

        // Logout revokes the token (DB check: the RequestGuard caches the resolved
        // user within one test process, so a second HTTP-style request in the same
        // test would still "see" the user. Real HTTP requests are separate processes
        // and correctly return 401 — verified live with curl).
        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
