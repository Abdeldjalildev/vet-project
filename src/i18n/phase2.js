import i18n from './config'

const phase2Translations = {
  ar: {
    language: 'اللغة',
    toggleTheme: 'تبديل المظهر',
    noServices: 'لا توجد خدمات متاحة حالياً.',
    noFaqs: 'لا توجد أسئلة شائعة متاحة حالياً.',
    labelOwnerName: 'اسم صاحب الحيوان',
    labelOwnerPhone: 'رقم الهاتف',
    labelOwnerEmail: 'البريد الإلكتروني',
    labelTime: 'وقت الموعد',
    labelNotes: 'ملاحظات',
    submitting: 'جارٍ إرسال الحجز…',
    bookingError: 'تعذر إرسال الحجز. يرجى المحاولة مرة أخرى.',
    poweredByVetLife: 'مدعوم بواسطة VetLife',
    socialLinks: 'روابط التواصل',
  },
  en: {
    language: 'Language',
    toggleTheme: 'Toggle theme',
    noServices: 'No services are currently available.',
    noFaqs: 'No FAQs are currently available.',
    labelOwnerName: 'Owner name',
    labelOwnerPhone: 'Phone number',
    labelOwnerEmail: 'Email',
    labelTime: 'Appointment time',
    labelNotes: 'Notes',
    submitting: 'Submitting booking…',
    bookingError: 'We could not submit the booking. Please try again.',
    poweredByVetLife: 'Powered by VetLife',
    socialLinks: 'Social links',
  },
  fr: {
    language: 'Langue',
    toggleTheme: 'Changer le thème',
    noServices: 'Aucun service disponible pour le moment.',
    noFaqs: 'Aucune FAQ disponible pour le moment.',
    labelOwnerName: 'Nom du propriétaire',
    labelOwnerPhone: 'Numéro de téléphone',
    labelOwnerEmail: 'E-mail',
    labelTime: 'Heure du rendez-vous',
    labelNotes: 'Notes',
    submitting: 'Envoi du rendez-vous…',
    bookingError: 'Impossible d’envoyer le rendez-vous. Veuillez réessayer.',
    poweredByVetLife: 'Propulsé par VetLife',
    socialLinks: 'Réseaux sociaux',
  },
}

for (const [language, translations] of Object.entries(phase2Translations)) {
  i18n.addResourceBundle(language, 'translation', translations, true, true)
}
