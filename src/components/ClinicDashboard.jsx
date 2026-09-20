import { useAuth } from '../auth/AuthProvider'

export default function ClinicDashboard() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.assign('/clinic/login')
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 dark:bg-gray-950">
      <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              VetLife Clinic
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
              Clinic dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
              Authenticated as {user?.email || 'clinic user'}.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Sign out
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="font-semibold text-slate-900 dark:text-white">Authentication foundation active.</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            Appointment, service, content, analytics, and clinic settings screens remain scoped to their later roadmap gates.
          </p>
        </div>
      </section>
    </main>
  )
}
