import { useEffect } from 'react'
import { useAuth } from './auth/AuthProvider'
import ClinicLogin from './components/ClinicLogin'
import ClinicDashboard from './components/ClinicDashboard'
import PublicClinicPage from './components/PublicClinicPage'

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

  if (path === '/clinic/dashboard') {
    return user ? <ClinicDashboard /> : <Redirect path="/clinic/login" />
  }

  return <Redirect path="/clinic/login" />
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
