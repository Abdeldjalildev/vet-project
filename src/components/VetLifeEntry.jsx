import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthProvider'
import { getPlatformOwnerClaim } from '../lib/auth'

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

export default function VetLifeEntry() {
  const { user, authLoading, signIn } = useAuth()
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!user) return
    getPlatformOwnerClaim(user)
      .then((isPlatformOwner) => window.location.replace(isPlatformOwner ? '/platform/dashboard' : '/clinic/dashboard'))
      .catch(() => window.location.replace('/clinic/dashboard'))
  }, [user])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)
    const formData = new FormData(event.currentTarget)
    try {
      await signIn(String(formData.get('email') || '').trim(), String(formData.get('password') || ''))
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || user) return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white"><p className="text-sm font-semibold">{authLoading ? t('checkingClinicSession') : t('routingUser')}</p></main>

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-6 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center text-white">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">VetLife</p>
          <h1 className="mt-4 text-3xl font-black">{t('welcomeToVetLife')}</h1>
          <p className="mt-3 text-sm text-slate-300">{t('welcomeToVetLifeHint')}</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm font-bold text-white">{t('email')}<input required type="email" name="email" autoComplete="username" className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none" /></label>
          <label className="block text-sm font-bold text-white">{t('password')}<input required type="password" name="password" autoComplete="current-password" className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 outline-none" /></label>
          {errorMessage && <p role="alert" className="rounded-xl bg-red-500/15 p-3 text-sm text-red-200">{t(errorMessage)}</p>}
          <button disabled={isSubmitting} className="w-full rounded-xl bg-emerald-500 px-5 py-3 font-black text-white shadow-lg hover:bg-emerald-400 disabled:opacity-50">{isSubmitting ? t('signingIn') : t('enterVetLife')}</button>
        </form>
      </section>
    </main>
  )
}
