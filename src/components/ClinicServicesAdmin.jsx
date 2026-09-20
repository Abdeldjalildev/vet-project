import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  createClinicService,
  deleteClinicService,
  listClinicServices,
  setClinicServiceActive,
  updateClinicService,
} from '../lib/clinicServices'

const EMPTY = {
  name: { ar: '', en: '', fr: '' },
  description: { ar: '', en: '', fr: '' },
  icon: '🩺',
  price: 0,
  currency: 'DZD',
  order: 0,
  active: true,
}

export default function ClinicServicesAdmin({ clinicId }) {
  const { t } = useTranslation()
  const [services, setServices] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [status, setStatus] = useState('loading')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setStatus('loading')
      const next = await listClinicServices(clinicId)
      setServices(next)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    load()
  }, [clinicId])

  const reset = () => {
    setForm(EMPTY)
    setEditingId(null)
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (editingId) {
        await updateClinicService(clinicId, editingId, form)
      } else {
        await createClinicService(clinicId, form)
      }
      reset()
      await load()
    } catch (saveError) {
      setError(saveError.message || 'SERVICE_SAVE_FAILED')
    } finally {
      setSaving(false)
    }
  }

  const edit = (service) => {
    setEditingId(service.serviceId)
    setForm({
      name: { ar: service.name?.ar || '', en: service.name?.en || '', fr: service.name?.fr || '' },
      description: {
        ar: service.description?.ar || '',
        en: service.description?.en || '',
        fr: service.description?.fr || '',
      },
      icon: service.icon || '🩺',
      price: Number(service.price || 0),
      currency: service.currency || 'DZD',
      order: Number(service.order || 0),
      active: service.active !== false,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggle = async (service) => {
    try {
      await setClinicServiceActive(clinicId, service.serviceId, service.active === false)
      await load()
    } catch (toggleError) {
      setError(toggleError.message || 'SERVICE_UPDATE_FAILED')
    }
  }

  const remove = async (service) => {
    if (!window.confirm(t('confirmDeleteService'))) return
    try {
      await deleteClinicService(clinicId, service.serviceId)
      await load()
    } catch (deleteError) {
      setError(deleteError?.code === 'functions/failed-precondition' ? t('serviceInUse') : (deleteError.message || 'SERVICE_DELETE_FAILED'))
    }
  }

  if (status === 'error') {
    return <State message={t('adminServicesError')} />
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6">
          <h3 className="text-lg font-black">{editingId ? t('editService') : t('addService')}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t('serviceManagementHint')}</p>
        </div>

        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}

        <form onSubmit={submit} className="space-y-5">
          {['ar', 'en', 'fr'].map((language) => (
            <div key={language} className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold">
                {t('serviceName')} ({language.toUpperCase()})
                <input
                  required={language === 'en'}
                  value={form.name[language]}
                  onChange={(event) => setForm((current) => ({ ...current, name: { ...current.name, [language]: event.target.value } }))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950"
                />
              </label>
              <label className="text-sm font-bold">
                {t('serviceDescription')} ({language.toUpperCase()})
                <textarea
                  value={form.description[language]}
                  onChange={(event) => setForm((current) => ({ ...current, description: { ...current.description, [language]: event.target.value } }))}
                  className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-950"
                />
              </label>
            </div>
          ))}

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-bold">
              {t('serviceIcon')}
              <input value={form.icon} onChange={(event) => setForm((current) => ({ ...current, icon: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-gray-950" />
            </label>
            <label className="text-sm font-bold">
              {t('servicePrice')}
              <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-gray-950" />
            </label>
            <label className="text-sm font-bold">
              {t('serviceCurrency')}
              <input maxLength="3" value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal uppercase dark:border-gray-700 dark:bg-gray-950" />
            </label>
            <label className="text-sm font-bold">
              {t('serviceOrder')}
              <input type="number" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: Number(event.target.value) }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal dark:border-gray-700 dark:bg-gray-950" />
            </label>
            <label className="flex items-center gap-3 pt-7 text-sm font-bold">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} />
              {t('serviceActive')}
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
              {saving ? t('saving') : editingId ? t('saveService') : t('createService')}
            </button>
            {editingId && (
              <button type="button" onClick={reset} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold dark:border-gray-700">
                {t('cancelEdit')}
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-black">{t('servicesList')}</h3>
        <div className="mt-5 space-y-3">
          {status === 'loading' && <State message={t('adminLoading')} />}
          {status === 'ready' && services.length === 0 && <State message={t('noServices')} />}
          {services.map((service) => (
            <article key={service.serviceId} className="rounded-2xl border border-slate-200 p-4 dark:border-gray-800">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <span className="text-2xl">{service.icon || '🩺'}</span>
                  <div>
                    <p className="font-black">{service.name?.en || service.name?.ar || service.name?.fr}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{service.description?.en || service.description?.ar || service.description?.fr}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      {service.active === false ? t('serviceInactive') : t('serviceActive')} · {service.price ?? 0} {service.currency || 'DZD'} · {t('serviceOrder')}: {service.order ?? 0}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => edit(service)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold dark:border-gray-700">{t('editService')}</button>
                  <button type="button" onClick={() => toggle(service)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold dark:border-gray-700">{service.active === false ? t('activateService') : t('deactivateService')}</button>
                  <button type="button" onClick={() => remove(service)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 dark:border-red-900/50 dark:text-red-300">{t('deleteService')}</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function State({ message }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-gray-700 dark:text-gray-400">{message}</div>
}
