import i18n from './config'

const translations = {
  ar: {
    serviceFallbackName: 'خدمة بيطرية',
    serviceFallbackDescription: 'تتوفر تفاصيل الخدمة من العيادة.',
    aboutFallbackDescription: 'رعاية بيطرية حديثة ومتكاملة مصممة لاحتياجات حيواناتك الأليفة.',
    noAboutFeatures: 'لم تتم إضافة مزايا العيادة بعد.',
    featureFallbackTitle: 'ميزة العيادة',
    featureFallbackDescription: 'التفاصيل ستظهر هنا عند إضافتها من إدارة العيادة.',
    faqFallbackQuestion: 'سؤال شائع',
    faqFallbackAnswer: 'ستظهر إجابة العيادة هنا عند توفرها.',
    footerAboutFallback: 'VetLife — تجربة عيادة بيطرية حديثة وآمنة.',
    footerCopyrightFallback: 'جميع الحقوق محفوظة.',
    noSocialLinks: 'لا توجد روابط اجتماعية منشورة بعد.',
  },
  en: {
    serviceFallbackName: 'Veterinary service',
    serviceFallbackDescription: 'Service details will appear here when provided by the clinic.',
    aboutFallbackDescription: 'Modern, caring veterinary support designed around the needs of your pets.',
    noAboutFeatures: 'The clinic has not published feature highlights yet.',
    featureFallbackTitle: 'Clinic feature',
    featureFallbackDescription: 'Details will appear here when the clinic adds them.',
    faqFallbackQuestion: 'Frequently asked question',
    faqFallbackAnswer: 'The clinic answer will appear here when it is available.',
    footerAboutFallback: 'VetLife — a modern, secure veterinary clinic experience.',
    footerCopyrightFallback: 'All rights reserved.',
    noSocialLinks: 'No social links have been published yet.',
  },
  fr: {
    serviceFallbackName: 'Service vétérinaire',
    serviceFallbackDescription: 'Les détails du service apparaîtront lorsqu’ils seront fournis par la clinique.',
    aboutFallbackDescription: 'Des soins vétérinaires modernes et attentionnés, adaptés aux besoins de vos animaux.',
    noAboutFeatures: 'La clinique n’a pas encore publié de points forts.',
    featureFallbackTitle: 'Atout de la clinique',
    featureFallbackDescription: 'Les détails apparaîtront lorsque la clinique les ajoutera.',
    faqFallbackQuestion: 'Question fréquente',
    faqFallbackAnswer: 'La réponse de la clinique apparaîtra lorsqu’elle sera disponible.',
    footerAboutFallback: 'VetLife — une expérience vétérinaire moderne et sécurisée.',
    footerCopyrightFallback: 'Tous droits réservés.',
    noSocialLinks: 'Aucun lien social n’a encore été publié.',
  },
}

for (const [language, values] of Object.entries(translations)) {
  i18n.addResourceBundle(language, 'translation', values, true, true)
}
