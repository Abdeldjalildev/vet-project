import React from 'react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-20 px-8 transition-colors duration-300 bg-slate-100/50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Right/Left Side: Content and Brand Mission */}
        <div className="space-y-6">
          <span className="text-sky-600 dark:text-sky-400 font-bold text-sm tracking-wider uppercase bg-sky-50 dark:bg-sky-950/40 px-4 py-1.5 rounded-full inline-block">
            {t('aboutBadge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
            {t('aboutTitle')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            {t('aboutDescStart')} <span className="text-emerald-600 dark:text-emerald-400 font-bold">VetLife</span>، {t('aboutDescEnd')}
          </p>
          
          {/* Quote container using logical properties (ps/border-s) to automatically respect RTL/LTR alignment */}
          <div className="pt-4">
            <div className="flex items-center gap-4 border-s-4 border-emerald-500 ps-4 bg-emerald-50/40 dark:bg-emerald-950/20 py-3 rounded-e-xl">
              <p className="text-slate-700 dark:text-slate-200 font-medium italic">
                {t('aboutQuote')}
              </p>
            </div>
          </div>
        </div>

        {/* Right/Left Side: Feature Cards Grid Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Emergency card */}
          <div className="p-6 rounded-2xl border transition-all duration-300 bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700/60 shadow-sm hover:shadow-md dark:hover:shadow-none">
            <div className="text-3xl mb-3">⏱️</div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('feature1Title')}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('feature1Desc')}</p>
          </div>

          {/* Doctors card */}
          <div className="p-6 rounded-2xl border transition-all duration-300 bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700/60 shadow-sm hover:shadow-md dark:hover:shadow-none">
            <div className="text-3xl mb-3">👨‍⚕️</div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('feature2Title')}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('feature2Desc')}</p>
          </div>

          {/* Tech card */}
          <div className="p-6 rounded-2xl border transition-all duration-300 bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700/60 shadow-sm hover:shadow-md dark:hover:shadow-none">
            <div className="text-3xl mb-3">💎</div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('feature3Title')}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('feature3Desc')}</p>
          </div>

          {/* Environment card */}
          <div className="p-6 rounded-2xl border transition-all duration-300 bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700/60 shadow-sm hover:shadow-md dark:hover:shadow-none">
            <div className="text-3xl mb-3">❤️</div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t('feature4Title')}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('feature4Desc')}</p>
          </div>

        </div>

      </div>
    </section>
  );
}