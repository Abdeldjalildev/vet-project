import { useEffect, useState } from 'react'
import { getDoc } from 'firebase/firestore'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthProvider'
import { clinicRef, userRef } from '../lib/firestore'
import { localized } from '../lib/clinicData'
import { trackAdminEvent } from '../lib/analytics'

const NAV_ITEMS = [
  ['dashboard', 'adminNavDashboard'],
  ['appointments', 'adminNavAppointments'],
  ['services', 'adminNavServices'],
  ['content', 'adminNavContent'],
  ['analytics', 'adminNavAnalytics'],
  ['settings', 'adminNavSettings'],
]

export default function ClinicAdminLayout({ section, children }) {
  const { user, signOut } = useAuth()
  const { t, i18n } = useTranslation()
  const [membership, setMembership] = useState(null)
  const [clinic, setClinic] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const membershipSnapshot = await getDoc(userRef(user.uid))
        if (!membershipSnapshot.exists()) throw new Error('CLINIC_MEMBERSHIP_NOT_FOUND')

        const nextMembership = membershipSnapshot.data()
        if (
          nextMembership.status !== 'active' ||
          !['owner', 'admin'].includes(nextMembership.role) ||
          !nextMembership.clinicId
        ) {
          throw new Error('CLINIC_MEMBERSHIP_INVALID')
        }

        const clinicSnapshot = await getDoc(clinicRef(nextMembership.clinicId))
        if (!clinicSnapshot.exists()) throw new Error('CLINIC_NOT_FOUND')

        if (cancelled) return
        setMembership(nextMembership)
        setClinic({ clinicId: clinicSnapshot.id, ...clinicSnapshot.data() })
        setStatus('ready')
      } catch (error) {
        if (cancelled) return
        setStatus(error.message || 'ADMIN_LOAD_FAILED')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user.uid])

  useEffect(() => {
    if (status === 'ready') trackAdminEvent({ clinicId: membership.clinicId, eventType: 'admin_section_view', page: section })
  }, [status, membership, section])

  const handleSignOut = async () => {
    await signOut()
    window.location.assign('/clinic/login')
  }

  if (status === 'loading') return <AdminState message={t('adminLoading')} />
  if (status !== 'ready') return <AdminState message={t('adminAccessError')} />

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-gray-950 dark:text-white">
      <aside className="fixed inset-y-0 start-0 z-40 hidden w-64 border-e border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-6 dark:border-gray-800">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">VetLife</p>
          <h1 className="mt-2 truncate text-lg font-black">{localized(clinic.name, i18n.language) || 'Clinic'}</h1>
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-gray-400">{user.email}</p>
        </div>

        <nav className="flex-1 space-y-1 p-4" aria-label={t('adminNavigation')}>
          {NAV_ITEMS.map(([key, label]) => (
            <AdminNavLink key={key} section={section} target={key} label={t(label)} />
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-gray-800">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-xl px-4 py-3 text-start text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {t('signOut')}
          </button>
        </div>
      </aside>

      <div className="lg:ps-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">VetLife Clinic</p>
              <h2 className="mt-1 text-xl font-black">{t(NAV_ITEMS.find(([key]) => key === section)?.[1] || 'adminNavDashboard')}</h2>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={i18n.language.split('-')[0]}
                onChange={(event) => i18n.changeLanguage(event.target.value)}
                aria-label={t('language')}
                className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm font-semibold dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 dark:border-gray-700 dark:text-gray-200 lg:hidden"
              >
                {t('signOut')}
              </button>
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto lg:hidden" aria-label={t('adminNavigation')}>
            {NAV_ITEMS.map(([key, label]) => (
              <AdminNavLink key={key} section={section} target={key} label={t(label)} compact />
            ))}
          </nav>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children({ clinicId: membership.clinicId, clinic })}</div>
        </main>
      </div>
    </div>
  )
}

function AdminNavLink({ section, target, label, compact = false }) {
  const active = section === target
  return (
    <a
      href={`/clinic/${target}`}
      aria-current={active ? 'page' : undefined}
      className={`block shrink-0 rounded-xl px-4 py-3 text-sm font-bold transition ${
        active
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800'
      } ${compact ? 'py-2.5' : ''}`}
    >
      {label}
    </a>
  )
}

function AdminState({ message }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 dark:bg-gray-950">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm font-semibold text-slate-600 dark:text-gray-300">{message}</p>
      </section>
    </main>
  )
}
