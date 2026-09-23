import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { localized } from '../lib/clinicData'
import { trackPublicEvent } from '../lib/analytics'

const CARD_STYLES = [
  {
    icon: '🩺',
    wrapper: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
    iconClass: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 dark:bg-emerald-900/40 dark:text-emerald-400',
    accent: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    icon: '💉',
    wrapper: 'hover:bg-sky-50/50 dark:hover:bg-sky-950/20',
    iconClass: 'bg-sky-100 text-sky-600 group-hover:bg-sky-500 dark:bg-sky-900/40 dark:text-sky-400',
    accent: 'text-sky-700 dark:text-sky-400',
  },
  {
    icon: '✂️',
    wrapper: 'hover:bg-amber-50/50 dark:hover:bg-amber-950/20',
    iconClass: 'bg-amber-100 text-amber-600 group-hover:bg-amber-500 dark:bg-amber-900/40 dark:text-amber-400',
    accent: 'text-amber-700 dark:text-amber-400',
  },
  {
    icon: '🔬',
    wrapper: 'hover:bg-rose-50/50 dark:hover:bg-rose-950/20',
    iconClass: 'bg-rose-100 text-rose-600 group-hover:bg-rose-500 dark:bg-rose-900/40 dark:text-rose-400',
    accent: 'text-rose-700 dark:text-rose-400',
  },
]

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
    <section id="services" className="border-y border-slate-100 bg-white px-6 py-20 transition-colors duration-300 dark:border-gray-800/60 dark:bg-gray-950 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-extrabold text-slate-900 dark:text-white md:text-4xl">{t('servicesTitle')}</h2>
          <p className="mx-auto max-w-xl text-lg text-slate-500 dark:text-slate-400">{t('servicesSubtitle')}</p>
        </div>

        {services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center dark:border-gray-700 dark:bg-gray-900/40">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noServices')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => {
              const style = CARD_STYLES[index % CARD_STYLES.length]
              const icon = service.icon || style.icon
              return (
                <article
                  key={service.serviceId}
                  data-analytics-service-id={service.serviceId}
                  data-analytics-clinic-id={clinicId}
                  className={`group rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-sm transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-none ${style.wrapper} hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white transition-colors ${style.iconClass}`}>{icon}</div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">{localized(service.name, i18n.language) || t('serviceFallbackName')}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{localized(service.description, i18n.language) || t('serviceFallbackDescription')}</p>
                  <p className={`mt-4 text-sm font-black ${style.accent}`}>
                    {service.price ?? 0} {service.currency || 'DZD'}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
