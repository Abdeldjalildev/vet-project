import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section id="hero" className="flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto transition-colors duration-300">
      {/* Highlighting badge with custom dynamic contrast for both themes */}
      <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 inline-block">
        {t('heroBadge')}
      </span>
      
      {/* Main typography showcasing smooth text-gradient integration */}
      <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
        {t('heroWelcome')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-emerald-500 dark:from-sky-400 dark:to-emerald-400">VetLife</span> {t('heroModern')}
      </h1>
      
      <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
        {t('heroDescription')}
      </p>

      {/* Responsive button cluster with human-optimized hover transitions */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <a 
          href="#booking"
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-sky-600/20 dark:shadow-none transition-all hover:-translate-y-0.5 text-center"
        >
          {t('heroBtnBook')}
        </a>
        <a 
          href="#services" 
          className="bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-gray-700 font-bold px-8 py-4 rounded-2xl transition-all inline-block"
        >
          {t('heroBtnDiscover')}
        </a>
      </div>
    </section>
  );
}