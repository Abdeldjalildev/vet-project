import { useEffect, useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import ClinicLogin from './components/ClinicLogin'
import ClinicAdminLayout from './components/ClinicAdminLayout'
import ClinicAppointmentsAdmin from './components/ClinicAppointmentsAdmin'
import ClinicOverview from './components/ClinicOverview'
import ClinicServicesAdmin from './components/ClinicServicesAdmin'
import ClinicSettingsAdmin from './components/ClinicSettingsAdmin'
import ClinicContentAdmin from './components/ClinicContentAdmin'
import ClinicAnalyticsAdmin from './components/ClinicAnalyticsAdmin'
import ClinicPublicAccessAdmin from './components/ClinicPublicAccessAdmin'
import PlatformOwnerDashboard from './components/PlatformOwnerDashboard'
import ClinicFirstPassword from './components/ClinicFirstPassword'
import PublicClinicPage from './components/PublicClinicPage'
import VetLifeEntry from './components/VetLifeEntry'
import { getPlatformOwnerClaim } from './lib/auth'
import { useTranslation } from 'react-i18next'

function ClinicRoute() {
  const { user, authLoading } = useAuth()
  const { t } = useTranslation()
  const path = window.location.pathname

  if (authLoading) return <RouteState message={t('checkingClinicSession')} />

  if (path === '/clinic/login') {
    return user ? <Redirect path="/" /> : <ClinicLogin />
  }

  if (!user) return <Redirect path="/" />

  if (path === '/clinic/first-password') return <ClinicFirstPassword />

  const section = path === '/clinic/dashboard'
    ? 'dashboard'
    : path.replace('/clinic/', '').split('/')[0]

  const validSections = ['dashboard', 'appointments', 'services', 'content', 'analytics', 'settings', 'public']
  const activeSection = validSections.includes(section) ? section : 'dashboard'

  return (
    <ClinicAdminLayout section={activeSection}>
      {({ clinicId, clinic }) => <ClinicSection section={activeSection} clinicId={clinicId} clinic={clinic} />}
    </ClinicAdminLayout>
  )
}

function ClinicSection({ section, clinicId, clinic }) {
  const { t } = useTranslation()
  if (section === 'dashboard') return <ClinicOverview clinicId={clinicId} />
  if (section === 'appointments') return <ClinicAppointmentsAdmin clinicId={clinicId} />
  if (section === 'services') return <ClinicServicesAdmin clinicId={clinicId} />
  if (section === 'content') return <ClinicContentAdmin clinicId={clinicId} clinic={clinic} />
  if (section === 'settings') return <ClinicSettingsAdmin clinicId={clinicId} clinic={clinic} />
  if (section === 'analytics') return <ClinicAnalyticsAdmin clinicId={clinicId} />
  if (section === 'public') return <ClinicPublicAccessAdmin clinic={clinic} />
  return <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900"><h3 className="text-xl font-black">{t('adminNavPublic')}</h3></section>
}

function PlatformRoute() {
  const { user, authLoading } = useAuth()
  const { t } = useTranslation()
  const [state, setState] = useState('loading')
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    if (!user) {
      setState('ready')
      setAuthorized(false)
      return
    }
    getPlatformOwnerClaim(user, true)
      .then((claim) => { setAuthorized(claim); setState('ready') })
      .catch(() => { setAuthorized(false); setState('ready') })
  }, [user])

  if (authLoading || state === 'loading') return <RouteState message={t('checkingPlatformSession')} />
  if (!user) return <Redirect path="/" />
  if (!authorized) return <RouteState message={t('platformAccessDenied')} />
  return <PlatformOwnerDashboard />
}

function RouteState({ message }) {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-gray-950"><p className="text-sm font-semibold text-slate-600 dark:text-gray-300">{message}</p></main>
}

function Redirect({ path }) {
  useEffect(() => { window.location.replace(path) }, [path])
  return null
}

function getPublicClinicSlug() {
  const segments = window.location.pathname.split('/').filter(Boolean)
  return segments[0] === 'c' && segments[1] ? decodeURIComponent(segments[1]) : ''
}

export default function App() {
  const path = window.location.pathname
  if (path === '/') return <VetLifeEntry />
  if (path.startsWith('/clinic/')) return <ClinicRoute />
  if (path.startsWith('/platform/')) return <PlatformRoute />
  if (path.startsWith('/c/')) {
    const clinicSlug = getPublicClinicSlug()
    return clinicSlug ? <PublicClinicPage clinicSlug={clinicSlug} /> : <RouteState message="Invalid public clinic route." />
  }
  return <VetLifeEntry />
}
