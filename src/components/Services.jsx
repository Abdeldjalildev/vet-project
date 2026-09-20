import { useTranslation } from 'react-i18next'
import { localized } from '../lib/clinicData'

export default function Services({ services = [] }) {
  const { t, i18n } = useTranslation()

  return (
    <section id="services" className="border-y border-slate-100 bg-white px-8 py-20 transition-colors duration-300 dark:border-gray-800/60 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-slate-900 dark:text-white md:text-4xl">
            {t('servicesTitle')}
          </h2>
          <p className="mx-auto max-w-xl text-lg text-slate-500 dark:text-slate-400">
            {t('servicesSubtitle')}
          </p>
        </div>

        {services.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-gray-700 dark:text-slate-400">
            {t('noServices')}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.serviceId}
                className="group rounded-2xl border border-slate-100 bg-slate-50 p-6 transition-all duration-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-none"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-xl font-bold text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                  {service.icon || '🩺'}
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                  {localized(service.name, i18n.language)}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {localized(service.description, i18n.language)}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
