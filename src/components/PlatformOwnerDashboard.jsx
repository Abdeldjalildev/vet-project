import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthProvider'
import { getPlatformOwnerClaim } from '../lib/auth'
import { listProvisionedClinics, provisionClinic } from '../lib/platform'

const EMPTY = { ar: '', en: '', fr: '' }

export default function PlatformOwnerDashboard() {
  const { user, signOut } = useAuth()
  const { t } = useTranslation()
  const [authorized, setAuthorized] = useState(null)
  const [clinics, setClinics] = useState([])
  const [status, setStatus] = useState('loading')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: EMPTY, slug: '', ownerEmail: '', public: false })

  const load = async () => {
    setStatus('loading')
    setError('')
    try {
      const claim = await getPlatformOwnerClaim(user, true)
      setAuthorized(claim)
      if (!claim) {
        setStatus('ready')
        return
      }
      setClinics(await listProvisionedClinics())
      setStatus('ready')
    } catch (loadError) {
      setAuthorized(false)
      setError(loadError.message || 'PLATFORM_LOAD_FAILED')
      setStatus('error')
    }
  }

  useEffect(() => { load() }, [user.uid])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const result = await provisionClinic(form)
      setMessage(result.ownerCreated && result.setupLink
        ? t('clinicProvisioned') + ' ' + result.setupLink
        : t('clinicProvisioned'))
      setForm({ name: { ...EMPTY }, slug: '', ownerEmail: '', public: false })
      setClinics(await listProvisionedClinics())
    } catch (saveError) {
      setError(saveError?.message || 'CLINIC_PROVISION_FAILED')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.assign('/')
  }

  if (status === 'loading') return <State message={t('platformLoading')} />
  if (status === 'error') return <State message={error} retry={load} />
  if (!authorized) return <State message={t('platformAccessDenied')} />

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-gray-950 dark:text-white">
      <header className="border-b border-slate-200 bg-white/95 px-4 py-5 shadow-sm dark:border-gray-800 dark:bg-gray-900/95 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">VetLife Platform</p>
            <h1 className="mt-1 text-xl font-black">{t('platformOwnerTitle')}</h1>
          </div>
          <button type="button" onClick={handleSignOut} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold dark:border-gray-700">{t('signOut')}</button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-black">{t('provisionClinicTitle')}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t('provisionClinicHint')}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {['ar', 'en', 'fr'].map((language) => (
              <label key={language} className="block text-sm font-bold">
                {t('clinicName')} ({language.toUpperCase()})
                <input required={language === 'en'} value={form.name[language]} onChange={(e) => setForm((v) => ({ ...v, name: { ...v.name, [language]: e.target.value } }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-gray-950" />
              </label>
            ))}
            <label className="block text-sm font-bold">
              {t('clinicSlug')}
              <input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" minLength={3} maxLength={63} value={form.slug} onChange={(e) => setForm((v) => ({ ...v, slug: e.target.value.toLowerCase() }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-gray-950" />
            </label>
            <label className="block text-sm font-bold">
              {t('clinicOwnerEmail')}
              <input required type="email" value={form.ownerEmail} onChange={(e) => setForm((v) => ({ ...v, ownerEmail: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-gray-950" />
            </label>
            <label className="flex items-center gap-3 text-sm font-bold">
              <input type="checkbox" checked={form.public} onChange={(e) => setForm((v) => ({ ...v, public: e.target.checked }))} />
              {t('publishClinicImmediately')}
            </label>
            {error && <p role="alert" className="break-all rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
            {message && <p role="status" className="break-all rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">{message}</p>}
            <button disabled={saving} className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
              {saving ? t('saving') : t('provisionClinic')}
            </button>
          </form>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-black">{t('provisionedClinicsTitle')}</h2><p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t('provisionedClinicsHint')}</p></div>
            <button type="button" onClick={load} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold dark:border-gray-700">{t('retry')}</button>
          </div>
          <div className="mt-5 space-y-3">
            {clinics.length === 0 && <State message={t('noProvisionedClinics')} />}
            {clinics.map((clinic) => (
              <article key={clinic.clinicId} className="rounded-2xl border border-slate-200 p-4 dark:border-gray-800">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div><p className="font-black">{clinic.name?.en || clinic.name?.ar || clinic.name?.fr || 'Clinic'}</p><p className="text-xs text-slate-500 dark:text-gray-400">/{clinic.slug}</p></div>
                  <div className="flex gap-2 text-xs font-bold"><span>{clinic.active ? t('active') : t('inactive')}</span><span>{clinic.public ? t('public') : t('private')}</span></div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function State({ message, retry }) {
  const { t } = useTranslation()
  return <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 dark:bg-gray-950"><section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900"><p role="alert" className="break-words text-sm font-semibold text-slate-600 dark:text-gray-300">{message}</p>{retry && <button type="button" onClick={retry} className="mt-5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">{t('retry')}</button>}</section></main>
}
