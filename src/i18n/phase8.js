import i18n from './config'

const translations = {
  ar: {
    servicePrice: 'قيمة الخدمة',
    serviceCurrency: 'العملة',
    analyticsCompletedServices: 'الخدمات المكتملة',
    analyticsEstimatedRevenue: 'قيمة الخدمات المكتملة',
    analyticsEstimatedRevenueHint: 'قيمة تقديرية مبنية على أسعار الخدمات عند إكمال المواعيد، وليست إيرادات مدفوعات فعلية.',
    analyticsNoRevenue: 'لا توجد خدمات مكتملة ذات قيمة مسجلة بعد.',
  },
  en: {
    servicePrice: 'Service value',
    serviceCurrency: 'Currency',
    analyticsCompletedServices: 'Completed services',
    analyticsEstimatedRevenue: 'Completed service value',
    analyticsEstimatedRevenueHint: 'An estimate based on service values when appointments are completed, not actual payment revenue.',
    analyticsNoRevenue: 'No completed service value has been recorded yet.',
  },
  fr: {
    servicePrice: 'Valeur du service',
    serviceCurrency: 'Devise',
    analyticsCompletedServices: 'Services terminés',
    analyticsEstimatedRevenue: 'Valeur des services terminés',
    analyticsEstimatedRevenueHint: 'Une estimation basée sur la valeur du service lors de la clôture du rendez-vous, et non sur des paiements réels.',
    analyticsNoRevenue: 'Aucune valeur de service terminé n’est encore enregistrée.',
  },
}

for (const [language, values] of Object.entries(translations)) {
  i18n.addResourceBundle(language, 'translation', values, true, true)
}
