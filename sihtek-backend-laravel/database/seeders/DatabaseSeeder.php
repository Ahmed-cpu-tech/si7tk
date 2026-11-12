<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Medication;
use App\Models\Pharmacy;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $password = 'password';

        /*
        | Pharmacies
        */
        $pharmacyUser1 = User::create([
            'name' => 'Rachid Ouazzani',
            'email' => 'pharmacie@demo.ma',
            'phone' => '0522445566',
            'role' => 'pharmacy',
            'password' => $password,
        ]);
        $pharmacy1 = Pharmacy::create([
            'user_id' => $pharmacyUser1->id,
            'name' => 'Pharmacie Al Madina',
            'address' => '12, Rue Al Madina, Maârif',
            'city' => 'Casablanca',
            'phone' => '0522445566',
        ]);

        $pharmacyUser2 = User::create([
            'name' => 'Hind El Fassi',
            'email' => 'pharmacie2@demo.ma',
            'phone' => '0537112233',
            'role' => 'pharmacy',
            'password' => $password,
        ]);
        $pharmacy2 = Pharmacy::create([
            'user_id' => $pharmacyUser2->id,
            'name' => 'Pharmacie Centrale Agdal',
            'address' => 'Avenue Fal Ould Oumeir, Agdal',
            'city' => 'Rabat',
            'phone' => '0537112233',
        ]);

        /*
        | Doctors
        */
        $doctorsData = [
            ['name' => 'Ahmed Bennani', 'email' => 'doctor@demo.ma', 'phone' => '0661223344', 'specialty' => 'Cardiologie', 'city' => 'Casablanca', 'fee' => 300, 'bio' => 'Cardiologue avec 15 ans d\'expérience, ancien chef de service au CHU Ibn Rochd.'],
            ['name' => 'Fatima Zahra Alaoui', 'email' => 'doctor2@demo.ma', 'phone' => '0662334455', 'specialty' => 'Médecine générale', 'city' => 'Casablanca', 'fee' => 150, 'bio' => 'Médecin généraliste, spécialisée en médecine préventive et suivi de famille.'],
            ['name' => 'Youssef El Idrissi', 'email' => 'doctor3@demo.ma', 'phone' => '0663445566', 'specialty' => 'Pédiatrie', 'city' => 'Rabat', 'fee' => 200, 'bio' => 'Pédiatre au CHU de Rabat, suivi du nouveau-né à l\'adolescent.'],
            ['name' => 'Salma Bennis', 'email' => 'doctor4@demo.ma', 'phone' => '0664556677', 'specialty' => 'Dermatologie', 'city' => 'Marrakech', 'fee' => 250, 'bio' => 'Dermatologue, experte en dermatologie clinique et esthétique.'],
            ['name' => 'Karim Tazi', 'email' => 'doctor5@demo.ma', 'phone' => '0665667788', 'specialty' => 'Chirurgie dentaire', 'city' => 'Casablanca', 'fee' => 350, 'bio' => 'Chirurgien-dentiste, implantologie et orthodontie.'],
            ['name' => 'Nadia Chraibi', 'email' => 'doctor6@demo.ma', 'phone' => '0666778899', 'specialty' => 'Ophtalmologie', 'city' => 'Tanger', 'fee' => 250, 'bio' => 'Ophtalmologue, chirurgie de la cataracte et vision.'],
        ];

        $doctorUsers = [];
        foreach ($doctorsData as $d) {
            $user = User::create([
                'name' => $d['name'],
                'email' => $d['email'],
                'phone' => $d['phone'],
                'role' => 'doctor',
                'password' => $password,
            ]);
            Doctor::create([
                'user_id' => $user->id,
                'specialty' => $d['specialty'],
                'city' => $d['city'],
                'consultation_fee' => $d['fee'],
                'bio' => $d['bio'],
            ]);
            $doctorUsers[$d['email']] = $user;
        }

        /*
        | Patients
        */
        $patient1 = User::create([
            'name' => 'Mehdi Amrani',
            'email' => 'patient@demo.ma',
            'phone' => '0700112233',
            'role' => 'patient',
            'password' => $password,
        ]);
        $patient2 = User::create([
            'name' => 'Aicha Berrada',
            'email' => 'patient2@demo.ma',
            'phone' => '0700223344',
            'role' => 'patient',
            'password' => $password,
        ]);

        /*
        | Medications stock (Pharmacie Al Madina)
        */
        $medications = [
            ['name' => 'Doliprane 1000mg', 'category' => 'Antalgique', 'price' => 25.00, 'stock_qty' => 120],
            ['name' => 'Amoxicilline 500mg', 'category' => 'Antibiotique', 'price' => 45.00, 'stock_qty' => 80],
            ['name' => 'Augmentin 1g', 'category' => 'Antibiotique', 'price' => 95.00, 'stock_qty' => 40],
            ['name' => 'Ibuprofène 400mg', 'category' => 'Anti-inflammatoire', 'price' => 30.00, 'stock_qty' => 60],
            ['name' => 'Oméprazole 20mg', 'category' => 'Gastro-entérologie', 'price' => 55.00, 'stock_qty' => 30],
            ['name' => 'Ventoline', 'category' => 'Respiratoire', 'price' => 70.00, 'stock_qty' => 15],
            ['name' => 'Metformine 850mg', 'category' => 'Diabète', 'price' => 40.00, 'stock_qty' => 50],
            ['name' => 'Amlodipine 5mg', 'category' => 'Cardiologie', 'price' => 35.00, 'stock_qty' => 25],
            ['name' => 'Loratadine 10mg', 'category' => 'Antihistaminique', 'price' => 28.00, 'stock_qty' => 45],
            ['name' => 'Spasfon', 'category' => 'Antispasmodique', 'price' => 48.00, 'stock_qty' => 3],
            ['name' => 'Efferalgan', 'category' => 'Antalgique', 'price' => 22.00, 'stock_qty' => 90],
            ['name' => 'Bétadine 10%', 'category' => 'Antiseptique', 'price' => 38.00, 'stock_qty' => 0],
        ];
        foreach ($medications as $m) {
            Medication::create($m + ['pharmacy_id' => $pharmacy1->id, 'sold_count' => 0]);
        }

        /*
        | Appointments
        */
        // Completed last week + dispensed prescription
        $appointment1 = Appointment::create([
            'patient_id' => $patient1->id,
            'doctor_id' => $doctorUsers['doctor2@demo.ma']->id,
            'scheduled_at' => today()->subDays(7)->setTime(15, 0),
            'status' => 'completed',
            'reason' => 'Fièvre et maux de gorge depuis 3 jours',
            'consultation_summary' => 'Angine virale. Repos recommandé, hydratation et traitement antibiotique selon l\'ordonnance.',
        ]);

        Appointment::create([
            'patient_id' => $patient1->id,
            'doctor_id' => $doctorUsers['doctor@demo.ma']->id,
            'scheduled_at' => today()->setTime(10, 0),
            'status' => 'confirmed',
            'reason' => 'Contrôle de tension artérielle',
        ]);

        Appointment::create([
            'patient_id' => $patient2->id,
            'doctor_id' => $doctorUsers['doctor3@demo.ma']->id,
            'scheduled_at' => today()->addDay()->setTime(11, 0),
            'status' => 'pending',
            'reason' => 'Consultation pédiatrique pour mon fils de 4 ans',
        ]);

        Appointment::create([
            'patient_id' => $patient1->id,
            'doctor_id' => $doctorUsers['doctor4@demo.ma']->id,
            'scheduled_at' => today()->addDays(3)->setTime(14, 30),
            'status' => 'confirmed',
            'reason' => 'Allergies cutanées récurrentes',
        ]);

        /*
        | Prescriptions
        */
        $prescription1 = Prescription::create([
            'patient_id' => $patient1->id,
            'doctor_id' => $doctorUsers['doctor2@demo.ma']->id,
            'pharmacy_id' => $pharmacy1->id,
            'appointment_id' => $appointment1->id,
            'status' => 'dispensed',
            'dispensed_at' => today()->subDays(2)->setTime(18, 30),
            'created_at' => today()->subDays(7)->setTime(16, 0),
        ]);
        $prescription1->medications()->createMany([
            ['name' => 'Doliprane 1000mg', 'dosage' => '1000mg', 'duration' => '5 jours', 'quantity' => 2, 'instructions' => '1 comprimé matin et soir après repas', 'status' => 'given'],
            ['name' => 'Amoxicilline 500mg', 'dosage' => '500mg', 'duration' => '7 jours', 'quantity' => 1, 'instructions' => '1 gélule 3 fois par jour', 'status' => 'given'],
        ]);

        $prescription2 = Prescription::create([
            'patient_id' => $patient1->id,
            'doctor_id' => $doctorUsers['doctor@demo.ma']->id,
            'pharmacy_id' => $pharmacy1->id,
            'status' => 'sent',
            'created_at' => today()->subHours(2),
        ]);
        $prescription2->medications()->createMany([
            ['name' => 'Augmentin 1g', 'dosage' => '1g', 'duration' => '10 jours', 'quantity' => 2, 'instructions' => '1 comprimé matin et soir', 'status' => 'pending'],
            ['name' => 'Oméprazole 20mg', 'dosage' => '20mg', 'duration' => '1 mois', 'quantity' => 1, 'instructions' => '1 gélule à jeun le matin', 'status' => 'pending'],
        ]);

        $this->command->info('');
        $this->command->info('════════════════════════════════════════════════════');
        $this->command->info('  Comptes de démonstration (mot de passe : password)');
        $this->command->info('────────────────────────────────────────────────────');
        $this->command->info('  Patient   : patient@demo.ma  /  password');
        $this->command->info('  Médecin   : doctor@demo.ma   /  password');
        $this->command->info('  Pharmacie : pharmacie@demo.ma /  password');
        $this->command->info('════════════════════════════════════════════════════');
    }
}
