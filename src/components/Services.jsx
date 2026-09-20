import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { localized } from '../lib/clinicData'
import { trackPublicEvent } from '../lib/analytics'

export default function Services({ services = [], clinicId }) {
  const { t, i18n } = useTranslation()
  const viewedServices = useRef(new Set())

  useEffect(() => {
    const elements = document.querySelectorAll('[data-analytics-service-id]')
    if (!('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const serviceId = entry.target.dataset.analyticsServiceId
        if (!serviceId || viewedServices.current.has(serviceId)) return
        viewedServices.current.add(serviceId)
        trackPublicEvent({ clinicId: entry.target.dataset.analyticsClinicId, eventType: 'service_view', page: 'services', serviceId })
      })
    }, { threshold: 0.35 })
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [services])

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
                data-analytics-service-id={service.serviceId}
                data-analytics-clinic-id={clinicId}
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
                <p className="mt-4 text-sm font-black text-emerald-700 dark:text-emerald-400">
                  {service.price ?? 0} {service.currency || 'DZD'}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
