# Sihtek — Frontend React (JavaScript + Vite + Tailwind CSS)

Interface utilisateur (SPA) du projet **Sihtek** : rendez-vous médicaux & ordonnances numériques.
Cette SPA appelle l'API **Laravel** située dans le dossier séparé `sihtek-backend/`.

## Stack

- **React 18** en **JavaScript** (pas de TypeScript)
- **Vite** (dev server + build)
- **Tailwind CSS 3** (+ police **Cairo** pour l'arabe)
- **React Router 6** (navigation SPA)
- **Axios** (client API avec token Sanctum Bearer + header `Accept-Language`)
- **lucide-react** (icônes)

## 🌍 Trilingue : العربية / Français / English

- Sélecteur de langue **ع / FR / EN** (en-tête des pages publiques, connexion, inscription et de l'application).
- **Arabe par défaut** avec mise en page **RTL complète** (`dir="rtl"`) : sidebar, icônes de sens (flèches retournées), paddings logiques (`ps/pe/ms/me/start/end`).
- **Français** et **anglais** en LTR — la spécialité et la ville sont stockées en français en base : elles s'affichent telles quelles en français et sont traduites en arabe/anglais.
- Préférence sauvegardée dans `localStorage` (`sihtek_lang`).
- La langue est envoyée au backend via `Accept-Language` → **les messages d'erreur et les notifications sont aussi traduits** (fichiers `lang/ar`, `lang/fr`, `lang/en` du backend).
- Dictionnaire central : `src/i18n/translations.js` (~300 clés AR/FR/EN).

## Installation

```bash
# 1. installer les dépendances
npm install

# 2. configurer l'URL de l'API (optionnel)
cp .env.example .env        # Windows: copy .env.example .env
# .env → VITE_API_URL=http://localhost:8000/api

# 3. lancer le serveur de développement
npm run dev
```

L'application est disponible sur **http://localhost:5173**.
Le backend Laravel doit tourner sur http://127.0.0.1:8000 (`php artisan serve` dans `sihtek-backend`).

## Build de production

```bash
npm run build      # génère dist/
npm run preview    # sert dist/ en local
```

## Structure

```
src/
├── api/client.js              # Axios + token Sanctum + Accept-Language + erreurs
├── i18n/
│   ├── translations.js        # Dictionnaire AR/FR/EN complet (+ spécialités, villes)
│   └── index.js               # getLang(), translate(), localize()
├── context/
│   ├── AuthContext.jsx        # Session globale (login, register, logout, rôles)
│   └── LanguageContext.jsx    # Langue courante, t(), loc(), dir RTL/LTR
├── components/
│   ├── Layout.jsx             # Sidebar RTL-aware + header + cloche notifications
│   ├── LanguageSwitcher.jsx   # Bouton ع / FR / EN
│   └── ui.jsx                 # StatCard, StatusBadge, Modal, Toast, Pagination, dates localisées
├── pages/
│   ├── Landing.jsx            # Page publique + flux métier
│   ├── Login.jsx              # Connexion
│   ├── Register.jsx           # Inscription 3 rôles (patient/médecin/pharmacie)
│   ├── Dashboard.jsx          # Tableau de bord différent par rôle
│   ├── Doctors.jsx            # Annuaire (recherche, spécialité, ville)
│   ├── DoctorDetail.jsx       # Fiche + réservation créneaux
│   ├── Appointments.jsx       # RDV patient/médecin (confirmer, annuler, terminer)
│   ├── Prescriptions.jsx      # Liste ordonnances selon rôle
│   ├── PrescriptionCreate.jsx # Rédaction ordonnance (médecin)
│   ├── PrescriptionShow.jsx   # Ordonnance imprimable + délivrance (pharmacie)
│   ├── Inventory.jsx          # Stock médicaments (pharmacie)
│   ├── Notifications.jsx      # Centre de notifications (rendu traduit par kind)
│   └── Profile.jsx            # Profil + infos professionnelles
└── index.css                  # Tailwind + composants (btn, card, input…)
```

## Fonctionnalités par rôle

**Patient** — annuaire médecins, réservation de créneaux en temps réel, suivi des RDV, consultation des ordonnances, notifications.

**Médecin** — demandes de RDV (confirmer/refuser), consultations du jour, rédaction d'ordonnance multi-médicaments envoyée à la pharmacie choisie, **suivi des retraits de médicaments**, profil professionnel.

**Pharmacie** — ordonnances reçues, délivrance ligne par ligne (délivré / indisponible) avec décrément du stock, gestion du stock (ajout, édition, rupture), tableau de bord d'activité.
