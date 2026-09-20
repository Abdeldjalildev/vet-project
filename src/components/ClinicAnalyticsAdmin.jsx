import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { localized } from '../lib/clinicData'
import { listAnalyticsAggregates } from '../lib/analytics'
import { listClinicServices } from '../lib/clinicServices'

const decodeDimension = (value) => {
  try {
    return decodeURIComponent(escape(window.atob(value.replace(/-/g, '+').replace(/_/g, '/'))))
  } catch {
    return value
  }
}

export default function ClinicAnalyticsAdmin({ clinicId }) {
  const { t, i18n } = useTranslation()
  const [aggregates, setAggregates] = useState([])
  const [services, setServices] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    Promise.all([listAnalyticsAggregates(clinicId, 30), listClinicServices(clinicId)])
      .then(([nextAggregates, nextServices]) => {
        if (cancelled) return
        setAggregates(nextAggregates)
        setServices(nextServices)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => { cancelled = true }
  }, [clinicId])

  const totals = useMemo(() => aggregates.reduce((result, day) => ({
    visitors: result.visitors + (day.uniqueVisitors || 0),
    pageViews: result.pageViews + (day.pageViews || 0),
    sessions: result.sessions + (day.sessions || 0),
    bookingsCompleted: result.bookingsCompleted + (day.bookingsCompleted || 0),
  }), { visitors: 0, pageViews: 0, sessions: 0, bookingsCompleted: 0 }), [aggregates])

  const conversion = totals.sessions > 0
    ? Math.round((totals.bookingsCompleted / totals.sessions) * 1000) / 10
    : 0

  const popularPages = useMemo(() => {
    const counts = {}
    aggregates.forEach((day) => Object.entries(day.pages || {}).forEach(([page, count]) => {
      counts[page] = (counts[page] || 0) + count
    }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [aggregates])

  const popularServices = useMemo(() => {
    const counts = {}
    aggregates.forEach((day) => Object.entries(day.services || {}).forEach(([encodedId, count]) => {
      const serviceId = decodeDimension(encodedId)
      counts[serviceId] = (counts[serviceId] || 0) + count
    }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([serviceId, count]) => ({
      serviceId,
      count,
      name: services.find((service) => service.serviceId === serviceId)?.name,
    }))
  }, [aggregates, services])

  if (status === 'loading') return <State message={t('analyticsLoading')} />
  if (status === 'error') return <State message={t('analyticsLoadError')} />

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-black">{t('analyticsTitle')}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t('analyticsLast30Days')}</p>
      </div>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label={t('analyticsVisitors')} value={totals.visitors} />
        <Metric label={t('analyticsPageViews')} value={totals.pageViews} />
        <Metric label={t('analyticsSessions')} value={totals.sessions} />
        <Metric label={t('analyticsBookings')} value={totals.bookingsCompleted} />
        <Metric label={t('analyticsConversion')} value={`${conversion}%`} />
      </section>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ListCard title={t('analyticsPopularPages')}>
          {popularPages.length === 0 ? <Empty text={t('analyticsNoData')} /> : popularPages.map(([page, count]) => (
            <Row key={page} label={t(`analyticsPage_${page}`)} value={count} />
          ))}
        </ListCard>
        <ListCard title={t('analyticsPopularServices')}>
          {popularServices.length === 0 ? <Empty text={t('analyticsNoData')} /> : popularServices.map((item) => (
            <Row key={item.serviceId} label={localized(item.name, i18n.language) || item.serviceId} value={item.count} />
          ))}
        </ListCard>
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"><p className="text-sm font-semibold text-slate-500 dark:text-gray-400">{label}</p><p className="mt-3 text-3xl font-black">{value}</p></article>
}
function ListCard({ title, children }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"><h4 className="text-lg font-black">{title}</h4><div className="mt-5 divide-y divide-slate-100 dark:divide-gray-800">{children}</div></section>
}
function Row({ label, value }) {
  return <div className="flex items-center justify-between gap-4 py-3"><span className="truncate text-sm font-semibold">{label}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black dark:bg-gray-800">{value}</span></div>
}
function Empty({ text }) { return <p className="py-8 text-center text-sm text-slate-500 dark:text-gray-400">{text}</p> }
function State({ message }) { return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">{message}</div> }
