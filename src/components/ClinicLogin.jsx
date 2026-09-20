import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthProvider'

const getAuthErrorMessage = (error) => {
  switch (error?.code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'authInvalidCredentials'
    case 'auth/too-many-requests':
      return 'authTooManyRequests'
    case 'auth/network-request-failed':
      return 'authNetworkError'
    default:
      return 'authSignInFailed'
  }
}

export default function ClinicLogin() {
  const { signIn } = useAuth()
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')

    try {
      await signIn(email, password)
      window.location.assign('/clinic/dashboard')
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 dark:bg-gray-950">
      <section className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            VetLife Clinic
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {t('authLoginTitle')}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">
            {t('authLoginHint')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="clinic-email" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-300">
              Email
            </label>
            <input
              id="clinic-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="clinic-password" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="clinic-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {errorMessage ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              {errorMessage ? t(errorMessage) : ''}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t('authSigningIn') : t('authSignIn')}
          </button>
        </form>
      </section>
    </main>
  )
}
