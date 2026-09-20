import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { updateClinicBranding, updateClinicProfile } from '../lib/clinicConfig'

const localized = (value) => ({ ar: value?.ar || '', en: value?.en || '', fr: value?.fr || '' })

export default function ClinicSettingsAdmin({ clinicId, clinic }) {
  const { t } = useTranslation()
  const [profile, setProfile] = useState({
    name: localized(clinic.name),
    description: localized(clinic.description),
    logoUrl: clinic.logoUrl || '',
    address: localized(clinic.contact?.address),
    phone: clinic.contact?.phone || '',
    email: clinic.contact?.email || '',
    emergencyInformation: localized(clinic.emergencyInformation),
    openingHours: clinic.openingHours || {},
  })
  const [branding, setBranding] = useState({
    primaryColor: clinic.branding?.primaryColor || '#0284c7',
    accentColor: clinic.branding?.accentColor || '#10b981',
    logoUrl: clinic.logoUrl || '',
  })
  const [saving, setSaving] = useState('')
  const [hours, setHours] = useState(clinic.openingHours || {})
  const [message, setMessage] = useState('')

  const saveProfile = async (event) => {
    event.preventDefault()
    setSaving('profile')
    setMessage('')
    try {
      await updateClinicProfile(clinicId, { ...profile, openingHours: hours })
      setMessage(t('profileSaved'))
    } catch {
      setMessage(t('profileSaveError'))
    } finally {
      setSaving('')
    }
  }

  const saveBranding = async (event) => {
    event.preventDefault()
    setSaving('branding')
    setMessage('')
    try {
      await updateClinicBranding(clinicId, branding)
      setMessage(t('brandingSaved'))
    } catch {
      setMessage(t('brandingSaveError'))
    } finally {
      setSaving('')
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-black">{t('clinicProfileTitle')}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t('clinicProfileHint')}</p>
        <form onSubmit={saveProfile} className="mt-6 space-y-5">
          <LocalizedFields label={t('clinicName')} value={profile.name} onChange={(name) => setProfile((v) => ({ ...v, name }))} />
          <LocalizedFields label={t('clinicDescription')} value={profile.description} onChange={(description) => setProfile((v) => ({ ...v, description }))} textarea />
          <LocalizedFields label={t('emergencyInformation')} value={profile.emergencyInformation} onChange={(emergencyInformation) => setProfile((v) => ({ ...v, emergencyInformation }))} textarea />
          <div className="grid gap-4 md:grid-cols-3">
            <Field label={t('logoUrl')} value={profile.logoUrl} onChange={(logoUrl) => setProfile((v) => ({ ...v, logoUrl }))} />
            <Field label={t('phone')} value={profile.phone} onChange={(phone) => setProfile((v) => ({ ...v, phone }))} />
            <Field label={t('email')} type="email" value={profile.email} onChange={(email) => setProfile((v) => ({ ...v, email }))} />
          </div>
          <LocalizedFields label={t('address')} value={profile.address} onChange={(address) => setProfile((v) => ({ ...v, address }))} />
          <fieldset>
            <legend className="mb-3 text-sm font-bold">{t('openingHours')}</legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                <label key={day} className="text-xs font-bold uppercase text-slate-500">
                  {t(`day_${day}`)}
                  <input value={hours[day] || ''} onChange={(e) => setHours((v) => ({ ...v, [day]: e.target.value }))} placeholder="09:00 - 17:00" className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal dark:border-gray-700 dark:bg-gray-950" />
                </label>
              ))}
            </div>
          </fieldset>
          <button disabled={saving === 'profile'} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {saving === 'profile' ? t('saving') : t('saveProfile')}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-black">{t('brandingTitle')}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t('brandingHint')}</p>
        <form onSubmit={saveBranding} className="mt-6 grid gap-4 md:grid-cols-3">
          <Field label={t('primaryColor')} type="color" value={branding.primaryColor} onChange={(primaryColor) => setBranding((v) => ({ ...v, primaryColor }))} />
          <Field label={t('accentColor')} type="color" value={branding.accentColor} onChange={(accentColor) => setBranding((v) => ({ ...v, accentColor }))} />
          <Field label={t('logoUrl')} value={branding.logoUrl} onChange={(logoUrl) => setBranding((v) => ({ ...v, logoUrl }))} />
          <button disabled={saving === 'branding'} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 md:col-span-3">
            {saving === 'branding' ? t('saving') : t('saveBranding')}
          </button>
        </form>
      </section>

      {message && <p role="status" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-gray-800 dark:bg-gray-900">{message}</p>}
    </div>
  )
}

function LocalizedFields({ label, value, onChange, textarea = false }) {
  return (
    <fieldset className="grid gap-3 md:grid-cols-3">
      <legend className="mb-2 text-sm font-bold md:col-span-3">{label}</legend>
      {['ar', 'en', 'fr'].map((language) => (
        <label key={language} className="text-xs font-bold uppercase text-slate-500">
          {language}
          {textarea ? (
            <textarea value={value[language]} onChange={(e) => onChange({ ...value, [language]: e.target.value })} className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal dark:border-gray-700 dark:bg-gray-950" />
          ) : (
            <input value={value[language]} onChange={(e) => onChange({ ...value, [language]: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal dark:border-gray-700 dark:bg-gray-950" />
          )}
        </label>
      ))}
    </fieldset>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label className="text-sm font-bold">
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal dark:border-gray-700 dark:bg-gray-950" />
    </label>
  )
}
