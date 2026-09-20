import { useEffect, useState } from 'react'
import { getDoc } from 'firebase/firestore'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthProvider'
import { userRef } from '../lib/firestore'
import { listClinicAppointments, transitionAppointment } from '../lib/appointments'

const STATUS_OPTIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export default function ClinicDashboard() {
  const { user, signOut } = useAuth()
  const { t } = useTranslation()
  const [clinicId, setClinicId] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [status, setStatus] = useState('loading')
  const [actionId, setActionId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const membershipSnapshot = await getDoc(userRef(user.uid))
        if (!membershipSnapshot.exists()) {
          throw new Error('CLINIC_MEMBERSHIP_NOT_FOUND')
        }

        const membership = membershipSnapshot.data()
        if (membership.status !== 'active' || !membership.clinicId) {
          throw new Error('CLINIC_MEMBERSHIP_INVALID')
        }

        const nextAppointments = await listClinicAppointments(membership.clinicId)
        if (cancelled) return

        setClinicId(membership.clinicId)
        setAppointments(nextAppointments)
        setStatus('ready')
      } catch (loadError) {
        if (cancelled) return
        setError(loadError.message)
        setStatus('error')
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user.uid])

  const handleSignOut = async () => {
    await signOut()
    window.location.assign('/clinic/login')
  }

  const handleTransition = async (appointmentId, nextStatus) => {
    if (!clinicId) return

    setActionId(appointmentId)
    setError('')

    try {
      await transitionAppointment(clinicId, appointmentId, nextStatus)
      const nextAppointments = await listClinicAppointments(clinicId)
      setAppointments(nextAppointments)
    } catch (transitionError) {
      setError(transitionError.message || 'APPOINTMENT_UPDATE_FAILED')
    } finally {
      setActionId(null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-gray-950 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              VetLife Clinic
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
              {t('clinicAppointmentsTitle')}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
              {user?.email || 'clinic user'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {t('signOut')}
          </button>
        </header>

        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {t('appointmentLoadError')}
          </div>
        )}

        {status === 'loading' && (
          <StateCard message={t('loadingAppointments')} />
        )}

        {status === 'error' && (
          <StateCard message={t('appointmentLoadError')} />
        )}

        {status === 'ready' && appointments.length === 0 && (
          <StateCard message={t('noAppointments')} />
        )}

        {status === 'ready' && appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <article
                key={appointment.appointmentId}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        )}
      </section>
    </main>
  )
}

function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  )
}

function StateCard({ message }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
      {message}
    </div>
  )
}
