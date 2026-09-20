import i18n from './config'

const translations = {
  ar: {
    unexpectedErrorTitle: 'حدث خطأ غير متوقع',
    unexpectedErrorMessage: 'تعذر إكمال عرض هذه الصفحة. يمكنك إعادة تحميلها والمحاولة مرة أخرى.',
    reloadPage: 'إعادة تحميل الصفحة',
    clinicLoading: 'جارٍ تحميل بيانات العيادة…',
    clinicNotFound: 'هذه العيادة غير متاحة.',
    clinicLoadError: 'تعذر تحميل العيادة حالياً.',
    retry: 'إعادة المحاولة',
    bookingSlotUnavailable: 'هذا الموعد لم يعد متاحاً. اختر وقتاً آخر.',
    appointmentTransitionError: 'تعذر تحديث حالة الموعد. قد تكون حالته تغيرت، حاول تحديث القائمة.',
    appointmentUpdateError: 'تعذر تحديث الموعد. حاول مرة أخرى.',
    openMenu: 'فتح قائمة التنقل',
    closeMenu: 'إغلاق قائمة التنقل',
    publicNavigation: 'التنقل العام',
    checkingClinicSession: 'جارٍ التحقق من جلسة العيادة…',
    publicSlugRequired: 'أضف معرّف العيادة العام إلى الرابط باستخدام /c/<clinicSlug>.',
  },
  en: {
    unexpectedErrorTitle: 'Something went wrong',
    unexpectedErrorMessage: 'This page could not be displayed correctly. Reload it and try again.',
    reloadPage: 'Reload page',
    clinicLoading: 'Loading clinic data…',
    clinicNotFound: 'This clinic is not available.',
    clinicLoadError: 'We could not load this clinic right now.',
    retry: 'Try again',
    bookingSlotUnavailable: 'That appointment slot is no longer available. Choose another time.',
    appointmentTransitionError: 'The appointment could not be updated. Its status may have changed; refresh and try again.',
    appointmentUpdateError: 'The appointment could not be updated. Please try again.',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    publicNavigation: 'Public navigation',
    checkingClinicSession: 'Checking clinic session…',
    publicSlugRequired: 'Add a public clinic slug to the URL using /c/<clinicSlug>.',
  },
  fr: {
    unexpectedErrorTitle: 'Une erreur est survenue',
    unexpectedErrorMessage: 'Cette page ne peut pas être affichée correctement. Rechargez-la et réessayez.',
    reloadPage: 'Recharger la page',
    clinicLoading: 'Chargement des données de la clinique…',
    clinicNotFound: 'Cette clinique n’est pas disponible.',
    clinicLoadError: 'Impossible de charger la clinique pour le moment.',
    retry: 'Réessayer',
    bookingSlotUnavailable: 'Ce créneau n’est plus disponible. Choisissez une autre heure.',
    appointmentTransitionError: 'Impossible de mettre à jour le rendez-vous. Son état a peut-être changé ; actualisez puis réessayez.',
    appointmentUpdateError: 'Impossible de mettre à jour le rendez-vous. Réessayez.',
    openMenu: 'Ouvrir le menu de navigation',
    closeMenu: 'Fermer le menu de navigation',
    publicNavigation: 'Navigation publique',
    checkingClinicSession: 'Vérification de la session de la clinique…',
    publicSlugRequired: 'Ajoutez le slug public de la clinique à l’URL avec /c/<clinicSlug>.'
  },
}

for (const [language, values] of Object.entries(translations)) {
  i18n.addResourceBundle(language, 'translation', values, true, true)
}
