# Sihtek — Backend API (Laravel 12)

API REST du projet **Sihtek** : plateforme de rendez-vous médicaux & d'ordonnances numériques.
Ce backend est **consommé par le frontend React** qui se trouve dans le dossier séparé `sihtek-frontend/`.

## Stack

- **Laravel 12** (PHP 8.2+)
- **MySQL** (XAMPP / phpMyAdmin) — SQLite possible pour tester vite
- **Laravel Sanctum** — authentification par tokens Bearer
- Notifications en base de données (confirmations RDV, ordonnances, retraits)

## Installation avec XAMPP

1. **Placez le dossier** `sihtek-backend` dans `C:\xampp\htdocs\` (Windows) ou `/Applications/XAMPP/htdocs` (Mac).

2. **Créez la base de données** : ouvrez phpMyAdmin (`http://localhost/phpmyadmin`) → *Nouvelle base* → nom : `sihtek` → interclassement : `utf8mb4_unicode_ci`.

3. **Configurez `.env`** (copiez `.env.example` vers `.env` si besoin) :

   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=sihtek
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Installez et lancez** (depuis le dossier `sihtek-backend`) :

   ```bash
   composer install
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```

   L'API tourne sur **http://127.0.0.1:8000** (les routes commencent par `/api/...`).

> ⚠️ `composer install` nécessite PHP 8.2+ activé en CLI. Avec XAMPP sous Windows, ajoutez `C:\xampp\php` au PATH ou utilisez `C:\xampp\php\php.exe` avec `composer.phar`.

## Démarrage complet (XAMPP)

| Élément | Commande | URL |
|---|---|---|
| Apache + MySQL | Panneau XAMPP | http://localhost/phpmyadmin |
| API Laravel | `php artisan serve` | http://127.0.0.1:8000 |
| Frontend React | `npm run dev` (dossier `sihtek-frontend`) | http://localhost:5173 |

## Comptes de démonstration (seed)

Mot de passe pour tous : **password**

| Rôle | Email |
|---|---|
| Patient | patient@demo.ma |
| Médecin | doctor@demo.ma |
| Pharmacie | pharmacie@demo.ma |

(La seed crée aussi 5 autres médecins, une 2ᵉ pharmacie à Rabat, un stock de 12 médicaments, des RDV et ordonnances d'exemple.)

## 🌍 Bilingue : العربية / English

Le backend est **multilingue** : il lit l'en-tête `Accept-Language` envoyé par le SPA (middleware `SetLocale`) et répond dans la langue demandée :

- **Messages métier** (erreurs de connexion, confirmations, livraisons…) → `lang/ar/messages.php` + `lang/en/messages.php`
- **Erreurs de validation** (champs requis, formats…) → `lang/ar/validation.php` + `lang/en/validation.php`
- **Notifications** : payloads **structurés** (`kind`, noms, dates ISO) — le SPA compose le texte dans la langue active.
- Langue par défaut : `APP_LOCALE=ar` (modifiable dans `.env`). Sans header → langue par défaut.

```bash
# Exemple
curl -H "Accept-Language: ar" -d '{"email":"...","password":"faux"}' http://127.0.0.1:8000/api/login
# → {"message":"البريد الإلكتروني أو كلمة المرور غير صحيحة.", ...}
```

## Endpoints principaux

### Public
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/register` | Inscription (role: patient / doctor / pharmacy) |
| POST | `/api/login` | Connexion → token Bearer |
| POST | `/api/forgot-password` | Lien de réinitialisation (mail log en local) |
| GET | `/api/meta` | Spécialités & villes (listes de formulaires) |
| GET | `/api/doctors` | Annuaire médecins (filtres q, specialty, city, page) |
| GET | `/api/doctors/{id}` | Fiche médecin |
| GET | `/api/doctors/{id}/slots?date=Y-m-d` | Créneaux disponibles |

### Authentifié (Authorization: Bearer {token})
| Méthode | Route | Rôle | Description |
|---|---|---|---|
| POST | `/api/logout` | tous | Révoque le token |
| GET | `/api/me` | tous | Profil + profils liés |
| GET | `/api/dashboard` | tous | Statistiques selon le rôle |
| PATCH | `/api/profile` | tous | Mise à jour du profil |
| PATCH | `/api/doctor-profile` | médecin | Spécialité, ville, bio, tarif |
| GET | `/api/notifications` | tous | Flux notifications + compteur non-lues |
| POST | `/api/notifications/mark-read` | tous | Tout marquer lu |
| GET | `/api/appointments` | tous | RDV (patient: les siens / médecin: reçus) |
| POST | `/api/appointments` | patient | Réserver un créneau |
| PATCH | `/api/appointments/{id}/confirm` | médecin | Confirmer |
| PATCH | `/api/appointments/{id}/cancel` | propriétaire | Annuler |
| PATCH | `/api/appointments/{id}/complete` | médecin | Terminer + compte-rendu |
| GET | `/api/prescriptions` | tous | Ordonnances selon le rôle |
| GET | `/api/prescriptions/create-data` | médecin | Patients + pharmacies (formulaire) |
| POST | `/api/prescriptions` | médecin | Créer et envoyer à la pharmacie |
| GET | `/api/prescriptions/{id}` | concernés | Détail (+ stock pharmacie) |
| POST | `/api/prescriptions/{id}/dispense` | pharmacie | Délivrer (stock −, notifications) |
| GET/POST/PATCH/DELETE | `/api/medications` | pharmacie | Gestion du stock |

## Cycle de vie métier

```
Patient réserve  →  pending    →  Médecin confirme  →  confirmed
                 →  Médecin termine (compte-rendu) →  completed
Médecin crée l'ordonnance → sent → Pharmacie délivre → dispensed
                 (stock décrémenté, médecin + patient notifiés)
```

## Tests

```bash
php artisan test
```

5 tests couvrant : le flux complet (réservation → confirmation → consultation → ordonnance → délivrance → stock), la protection des rôles, la double réservation, et register/login/logout.
