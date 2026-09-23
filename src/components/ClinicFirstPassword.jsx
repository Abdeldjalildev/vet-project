import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthProvider'
import { changePasswordAndCompleteSetup, getClinicMembership } from '../lib/auth'

export default function ClinicFirstPassword() {
  const { user, signOut } = useAuth()
  const { t } = useTranslation()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user) {
      window.location.replace('/')
      return
    }
    getClinicMembership(user.uid)
      .then((membership) => {
        if (membership?.mustChangePassword !== true) {
          window.location.replace('/clinic/dashboard')
          return
        }
        setChecking(false)
      })
      .catch(() => {
        setError(t('passwordSetupFailed'))
        setChecking(false)
      })
  }, [user, t])

  if (!user || checking) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-gray-950"><p className="text-sm font-semibold text-slate-600 dark:text-gray-300">{t('checkingClinicSession')}</p></main>
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') || '')
    const confirmation = String(formData.get('confirmation') || '')

    if (password.length < 12 || password.length > 128) {
      setError(t('passwordTooShort'))
      return
    }
    if (password !== confirmation) {
      setError(t('passwordsDoNotMatch'))
      return
    }

    setSaving(true)
    try {
      await changePasswordAndCompleteSetup(user, password)
      window.location.replace('/clinic/dashboard')
    } catch (saveError) {
      setError(saveError?.code === 'auth/requires-recent-login' ? t('passwordRecentLoginRequired') : t('passwordSetupFailed'))
    } finally {
      setSaving(false)
    }
  }

  const cancel = async () => {
    await signOut()
    window.location.replace('/')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12 dark:bg-gray-950">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">VetLife Clinic</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{t('firstPasswordTitle')}</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-gray-300">{t('firstPasswordHint')}</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm font-bold text-slate-800 dark:text-gray-200">
            {t('newPassword')}
            <input required type="password" autoComplete="new-password" minLength={12} maxLength={128} name="password" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-950" />
          </label>
          <label className="block text-sm font-bold text-slate-800 dark:text-gray-200">
            {t('confirmNewPassword')}
            <input required type="password" autoComplete="new-password" minLength={12} maxLength={128} name="confirmation" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-950" />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-50">
            {saving ? t('saving') : t('setPermanentPassword')}
          </button>
          <button type="button" onClick={cancel} className="w-full rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 dark:border-gray-700 dark:text-gray-200">{t('signOut')}</button>
        </form>
      </section>
    </main>
  )
}
