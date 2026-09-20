import { useEffect } from 'react'
import { useAuth } from './auth/AuthProvider'
import ClinicLogin from './components/ClinicLogin'
import ClinicAdminLayout from './components/ClinicAdminLayout'
import ClinicAppointmentsAdmin from './components/ClinicAppointmentsAdmin'
import ClinicOverview from './components/ClinicOverview'
import ClinicServicesAdmin from './components/ClinicServicesAdmin'
import PublicClinicPage from './components/PublicClinicPage'
import { useTranslation } from 'react-i18next'

function ClinicRoute() {
  const { user, authLoading } = useAuth()
  const path = window.location.pathname

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950">
        <p className="text-sm font-semibold text-slate-600 dark:text-gray-300">Checking clinic session…</p>
      </main>
    )
  }

  if (path === '/clinic/login') {
    return user ? <Redirect path="/clinic/dashboard" /> : <ClinicLogin />
  }

  if (!user) return <Redirect path="/clinic/login" />

  const section = path === '/clinic/dashboard'
    ? 'dashboard'
    : path.replace('/clinic/', '').split('/')[0]

  const validSections = ['dashboard', 'appointments', 'services', 'content', 'analytics', 'settings']
  const activeSection = validSections.includes(section) ? section : 'dashboard'

  return (
    <ClinicAdminLayout section={activeSection}>
      {({ clinicId }) => <ClinicSection section={activeSection} clinicId={clinicId} />}
    </ClinicAdminLayout>
  )
}

function ClinicSection({ section, clinicId }) {
  const { t } = useTranslation()

  if (section === 'dashboard') return <ClinicOverview clinicId={clinicId} />
  if (section === 'appointments') return <ClinicAppointmentsAdmin clinicId={clinicId} />
  if (section === 'services') return <ClinicServicesAdmin clinicId={clinicId} />

  return (
    <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
      <h3 className="text-xl font-black">{t(`adminNav${section[0].toUpperCase()}${section.slice(1)}`)}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">{t('phaseComingLater')}</p>
    </section>
  )
}

function Redirect({ path }) {
  useEffect(() => {
    window.location.replace(path)
  }, [path])

  return null
}

function getPublicClinicSlug() {
  const segments = window.location.pathname.split('/').filter(Boolean)

  if (segments[0] === 'c' && segments[1]) {
    return decodeURIComponent(segments[1])
  }

  return import.meta.env.VITE_DEFAULT_CLINIC_SLUG || ''
}

function PublicRoute() {
  const clinicSlug = getPublicClinicSlug()

  if (!clinicSlug) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-gray-950">
        <section className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">VetLife</h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-gray-300">
            Add a public clinic slug to the URL using <code>/c/&lt;clinicSlug&gt;</code>.
          </p>
        </section>
      </main>
    )
  }

  return <PublicClinicPage clinicSlug={clinicSlug} />
}

export default function App() {
  return window.location.pathname.startsWith('/clinic/')
    ? <ClinicRoute />
    : <PublicRoute />
}
