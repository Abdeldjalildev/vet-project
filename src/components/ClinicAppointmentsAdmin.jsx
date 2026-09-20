import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { listClinicAppointments, transitionAppointment } from '../lib/appointments'

const STATUS_OPTIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export default function ClinicAppointmentsAdmin({ clinicId }) {
  const { t } = useTranslation()
  const [appointments, setAppointments] = useState([])
  const [status, setStatus] = useState('loading')
  const [actionId, setActionId] = useState(null)

  const load = async () => {
    try {
      setStatus('loading')
      setAppointments(await listClinicAppointments(clinicId))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [clinicId])

  const handleTransition = async (appointmentId, nextStatus) => {
    setActionId(appointmentId)
    try {
      await transitionAppointment(clinicId, appointmentId, nextStatus)
      await load()
    } finally {
      setActionId(null)
    }
  }

  if (status === 'loading') return <State message={t('loadingAppointments')} />
  if (status === 'error') return <State message={t('appointmentLoadError')} />
  if (appointments.length === 0) return <State message={t('noAppointments')} />

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <article key={appointment.appointmentId} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Info label={t('appointmentPet')} value={appointment.petName} />
              <Info label={t('appointmentOwner')} value={appointment.ownerName} />
              <Info label={t('appointmentPhone')} value={appointment.ownerPhone} />
              <Info label={t('appointmentDateTime')} value={`${appointment.date} · ${appointment.time}`} />
              <Info label={t('appointmentService')} value={appointment.serviceId} />
              <Info label={t('appointmentStatus')} value={t(`status_${appointment.status}`)} />
              {appointment.ownerEmail && <Info label={t('appointmentEmail')} value={appointment.ownerEmail} />}
              {appointment.notes && <Info label={t('appointmentNotes')} value={appointment.notes} />}
            </div>

            {STATUS_OPTIONS[appointment.status]?.length > 0 && (
              <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                {STATUS_OPTIONS[appointment.status].map((nextStatus) => (
                  <button
                    key={nextStatus}
                    type="button"
                    disabled={actionId === appointment.appointmentId}
                    onClick={() => handleTransition(appointment.appointmentId, nextStatus)}
                    className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t(`action_${nextStatus}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  )
}

function State({ message }) {
  return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">{message}</div>
}
