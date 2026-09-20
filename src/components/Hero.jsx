import { useTranslation } from 'react-i18next'
import { localized } from '../lib/clinicData'

export default function Hero({ clinic }) {
  const { t, i18n } = useTranslation()
  const hero = clinic.hero || {}

  return (
    <section id="hero" className="mx-auto flex max-w-4xl flex-col items-center justify-center px-6 py-20 text-center transition-colors duration-300">
      <span className="mb-6 inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        {localized(hero.badge, i18n.language) || t('heroBadge')}
      </span>

      <h1 className="mb-6 text-4xl font-black leading-tight text-slate-900 dark:text-white md:text-6xl">
        {localized(hero.title, i18n.language) || localized(clinic.name, i18n.language)}
      </h1>

      <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 md:text-xl">
        {localized(hero.description, i18n.language)}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <a
          href="#booking"
          className="rounded-2xl px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: 'var(--clinic-primary)' }}
        >
          {t('heroBtnBook')}
        </a>
        <a
          href="#services"
          className="inline-block rounded-2xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 transition-all hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-750"
        >
          {t('heroBtnDiscover')}
        </a>
      </div>
    </section>
  )
}
