import { useTranslation } from 'react-i18next'
import { localized } from '../lib/clinicData'

export default function About({ clinic }) {
  const { t, i18n } = useTranslation()
  const about = clinic.about || {}
  const features = about.features || []

  return (
    <section id="about" className="bg-slate-100/50 px-8 py-20 transition-colors duration-300 dark:bg-gray-900">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-block rounded-full bg-sky-50 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
            {t('aboutBadge')}
          </span>
          <h2 className="text-3xl font-black leading-tight text-slate-900 dark:text-white md:text-4xl">
            {localized(about.title, i18n.language)}
          </h2>
          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {localized(about.description, i18n.language)}
          </p>
          {localized(about.quote, i18n.language) && (
            <div className="border-s-4 border-emerald-500 bg-emerald-50/40 py-3 ps-4 dark:bg-emerald-950/20">
              <p className="font-medium italic text-slate-700 dark:text-slate-200">
                {localized(about.quote, i18n.language)}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((feature, index) => (
            <div key={feature.id || index} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
              <div className="mb-3 text-3xl">{feature.icon || '🐾'}</div>
              <h4 className="mb-1 font-bold text-slate-900 dark:text-white">
                {localized(feature.title, i18n.language)}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {localized(feature.description, i18n.language)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
