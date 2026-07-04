import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Services() {
  const { t } = useTranslation();

  return (
    <section id="services" className="py-20 px-8 border-t border-b transition-colors duration-300 bg-white dark:bg-gray-950 border-slate-100 dark:border-gray-800/60">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            {t('servicesTitle')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
            {t('servicesSubtitle')}
          </p>
        </div>

        {/* Services Grid Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Card 1: General Checkup */}
          <div className="p-6 rounded-2xl border transition-all duration-300 group bg-slate-50 dark:bg-gray-900 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 border-slate-100 dark:border-gray-800 hover:shadow-xl dark:hover:shadow-none">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-emerald-500 group-hover:text-white dark:group-hover:text-white transition-colors">🩺</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('service1Title')}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{t('service1Desc')}</p>
          </div>

          {/* Card 2: Vaccinations */}
          <div className="p-6 rounded-2xl border transition-all duration-300 group bg-slate-50 dark:bg-gray-900 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 border-slate-100 dark:border-gray-800 hover:shadow-xl dark:hover:shadow-none">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-sky-500 group-hover:text-white dark:group-hover:text-white transition-colors">💉</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('service2Title')}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{t('service2Desc')}</p>
          </div>

          {/* Card 3: Grooming */}
          <div className="p-6 rounded-2xl border transition-all duration-300 group bg-slate-50 dark:bg-gray-900 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 border-slate-100 dark:border-gray-800 hover:shadow-xl dark:hover:shadow-none">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-amber-500 group-hover:text-white dark:group-hover:text-white transition-colors">✂️</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('service3Title')}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{t('service3Desc')}</p>
          </div>

          {/* Card 4: Surgery */}
          <div className="p-6 rounded-2xl border transition-all duration-300 group bg-slate-50 dark:bg-gray-900 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 border-slate-100 dark:border-gray-800 hover:shadow-xl dark:hover:shadow-none">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-rose-500 group-hover:text-white dark:group-hover:text-white transition-colors">🔬</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('service4Title')}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{t('service4Desc')}</p>
          </div>

        </div>
      </div>
    </section>
  );
}