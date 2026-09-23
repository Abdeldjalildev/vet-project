import { useTranslation } from 'react-i18next'
import { localized } from '../lib/clinicData'

export default function Hero({ clinic }) {
  const { t, i18n } = useTranslation()
  const hero = clinic?.hero || {}
  const clinicName = localized(clinic?.name, i18n.language) || 'VetLife'
  const title = localized(hero.title, i18n.language) || clinicName
  const description = localized(hero.description, i18n.language) || localized(clinic?.description, i18n.language)
  const badge = localized(hero.badge, i18n.language) || t('heroBadge')

  return (
    <section id="hero" className="relative overflow-hidden px-6 py-24 text-center transition-colors duration-300 md:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.13),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_36%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_36%)]" />
      <div className="mx-auto max-w-4xl">
        <span className="mb-6 inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          {badge}
        </span>

        <h1 className="mb-6 text-4xl font-black leading-tight text-slate-900 dark:text-white md:text-6xl">
          {title === clinicName ? (
            <>
              {t('heroWelcome')} <span className="bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent dark:from-sky-400 dark:to-emerald-400">VetLife</span> {t('heroModern')}
            </>
          ) : (
            <span className="bg-gradient-to-r from-sky-600 to-emerald-500 bg-clip-text text-transparent dark:from-sky-400 dark:to-emerald-400">{title}</span>
          )}
        </h1>

        {description && (
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300 md:text-xl">
            {description}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="#booking" className="rounded-2xl px-8 py-4 text-center font-bold text-white shadow-lg shadow-sky-600/20 transition-all hover:-translate-y-0.5 dark:shadow-none" style={{ backgroundColor: 'var(--clinic-primary)' }}">
            {t('heroBtnBook')}
          </a>
          <a href="#services" className="inline-block rounded-2xl border border-slate-200 bg-white px-8 py-4 font-bold text-slate-700 transition-all hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-750">
            {t('heroBtnDiscover')}
          </a>
        </div>
      </div>
    </section>
  )
}
