# Phase 2 — Public Firestore Data Contract

This document defines the minimum Firestore shape required to exercise the Phase 2 public interface during the later local/Firebase verification pass.

## Clinic

Path:

`clinics/{clinicId}`

Example:

```json
{
  "slug": "demo-clinic",
  "public": true,
  "active": true,
  "name": {
    "ar": "عيادة بيطرية تجريبية",
    "en": "Demo Veterinary Clinic",
    "fr": "Clinique vétérinaire de démonstration"
  },
  "logoUrl": "",
  "branding": {
    "primaryColor": "#0284c7",
    "accentColor": "#10b981"
  },
  "contact": {
    "phone": "+213000000000",
    "email": "clinic@example.com",
    "address": {
      "ar": "العنوان التجريبي",
      "en": "Demo address",
      "fr": "Adresse de démonstration"
    }
  },
  "openingHours": {
    "monday": {
      "ar": "09:00 - 18:00",
      "en": "09:00 - 18:00",
      "fr": "09:00 - 18:00"
    }
  },
  "socialLinks": {
    "facebook": "",
    "instagram": "",
    "tiktok": "",
    "youtube": "",
    "whatsapp": "",
    "website": ""
  },
  "hero": {
    "badge": {
      "ar": "رعاية بيطرية موثوقة",
      "en": "Trusted veterinary care",
      "fr": "Soins vétérinaires de confiance"
    },
    "title": {
      "ar": "عيادتك البيطرية",
      "en": "Your veterinary clinic",
      "fr": "Votre clinique vétérinaire"
    },
    "description": {
      "ar": "وصف العيادة",
      "en": "Clinic description",
      "fr": "Description de la clinique"
    }
  },
  "about": {
    "title": {
      "ar": "من نحن",
      "en": "About us",
      "fr": "À propos"
    },
    "description": {
      "ar": "وصف مختصر عن العيادة.",
      "en": "A short clinic description.",
      "fr": "Une courte description de la clinique."
    },
    "quote": {
      "ar": "رعاية تستحقها الحيوانات.",
      "en": "Care pets deserve.",
      "fr": "Les soins que les animaux méritent."
    },
    "features": []
  },
  "footer": {
    "about": {
      "ar": "نبذة العيادة.",
      "en": "Clinic footer description.",
      "fr": "Description du pied de page."
    },
    "copyright": {
      "ar": "جميع الحقوق محفوظة.",
      "en": "All rights reserved.",
      "fr": "Tous droits réservés."
    }
  }
}
```

## Service

Path:

`clinics/{clinicId}/services/{serviceId}`

Minimum public fields:

```json
{
  "name": {
    "ar": "الفحص العام",
    "en": "General Checkup",
    "fr": "Examen général"
  },
  "description": {
    "ar": "وصف الخدمة.",
    "en": "Service description.",
    "fr": "Description du service."
  },
  "icon": "🩺",
  "active": true,
  "order": 1
}
```

## FAQ

Path:

`clinics/{clinicId}/faqs/{faqId}`

```json
{
  "question": {
    "ar": "هل أحتاج إلى موعد؟",
    "en": "Do I need an appointment?",
    "fr": "Ai-je besoin d'un rendez-vous ?"
  },
  "answer": {
    "ar": "يفضل الحجز مسبقاً.",
    "en": "Booking in advance is recommended.",
    "fr": "Il est recommandé de réserver à l'avance."
  },
  "active": true,
  "order": 1
}
```

## Appointment

Created by the public booking flow under:

`clinics/{clinicId}/appointments/{appointmentId}`

The browser submits the approved Phase 2 fields; Firestore Rules enforce the public-create contract and assign no client-controlled timestamp/status semantics beyond the allowed `pending` state.

Appointment conflict protection and lifecycle transitions remain Phase 3.
