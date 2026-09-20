import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { listClinicAppointments } from '../lib/appointments'

export default function ClinicOverview({ clinicId }) {
  const { t } = useTranslation()
  const [appointments, setAppointments] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    listClinicAppointments(clinicId)
      .then((items) => {
        if (cancelled) return
        setAppointments(items)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [clinicId])

  const counts = appointments.reduce(
    (result, appointment) => {
      result.total += 1
      result[appointment.status] = (result[appointment.status] || 0) + 1
      return result
    },
    { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
  )

  if (status === 'loading') return <State message={t('adminLoading')} />
  if (status === 'error') return <State message={t('adminOverviewError')} />

  const upcoming = appointments
    .filter((item) => ['pending', 'confirmed'].includes(item.status))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label={t('metricTotalAppointments')} value={counts.total} />
        <Metric label={t('metricPending')} value={counts.pending} />
        <Metric label={t('metricConfirmed')} value={counts.confirmed} />
        <Metric label={t('metricCompleted')} value={counts.completed} />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black">{t('upcomingAppointments')}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t('upcomingAppointmentsSubtitle')}</p>
          </div>
          <a href="/clinic/appointments" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-gray-900">
            {t('viewAllAppointments')}
          </a>
        </div>

        {upcoming.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-gray-700 dark:text-gray-400">
            {t('noAppointments')}
          </p>
        ) : (
          <div className="mt-6 divide-y divide-slate-100 dark:divide-gray-800">
            {upcoming.map((appointment) => (
              <div key={appointment.appointmentId} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold">{appointment.petName} · {appointment.ownerName}</p>
                  <p className="text-sm text-slate-500 dark:text-gray-400">{appointment.date} · {appointment.time}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  {t(`status_${appointment.status}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm font-semibold text-slate-500 dark:text-gray-400">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </article>
  )
}

function State({ message }) {
  return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">{message}</div>
}
