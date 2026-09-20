import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createClinicFaq, deleteClinicFaq, listClinicFaqs, updateClinicContent, updateClinicFaq } from '../lib/clinicConfig'

const localized = (value) => ({ ar: value?.ar || '', en: value?.en || '', fr: value?.fr || '' })
const emptyFaq = { question: { ar: '', en: '', fr: '' }, answer: { ar: '', en: '', fr: '' }, order: 0, active: true }

export default function ClinicContentAdmin({ clinicId, clinic }) {
  const { t } = useTranslation()
  const [content, setContent] = useState({
    hero: {
      badge: localized(clinic.hero?.badge),
      title: localized(clinic.hero?.title),
      description: localized(clinic.hero?.description),
    },
    about: {
      title: localized(clinic.about?.title),
      description: localized(clinic.about?.description),
      quote: localized(clinic.about?.quote),
      features: clinic.about?.features || [],
    },
    footer: {
      about: localized(clinic.footer?.about),
      copyright: localized(clinic.footer?.copyright),
    },
    socialLinks: { ...(clinic.socialLinks || {}) },
  })
  const [faqs, setFaqs] = useState([])
  const [faq, setFaq] = useState(emptyFaq)
  const [editingFaqId, setEditingFaqId] = useState(null)
  const [status, setStatus] = useState('loading')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const loadFaqs = async () => {
    try {
      setStatus('loading')
      setFaqs(await listClinicFaqs(clinicId))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => { loadFaqs() }, [clinicId])

  const saveContent = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await updateClinicContent(clinicId, content)
      setMessage(t('contentSaved'))
    } catch {
      setMessage(t('contentSaveError'))
    } finally {
      setSaving(false)
    }
  }

  const saveFaq = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (editingFaqId) await updateClinicFaq(clinicId, editingFaqId, faq)
      else await createClinicFaq(clinicId, faq)
      setFaq(emptyFaq)
      setEditingFaqId(null)
      await loadFaqs()
      setMessage(t('faqSaved'))
    } catch {
      setMessage(t('faqSaveError'))
    } finally {
      setSaving(false)
    }
  }

  const editFaq = (item) => {
    setEditingFaqId(item.faqId)
    setFaq({
      question: localized(item.question),
      answer: localized(item.answer),
      order: item.order ?? 0,
      active: item.active !== false,
    })
  }

  const removeFaq = async (faqId) => {
    if (!window.confirm(t('confirmDeleteFaq'))) return
    setSaving(true)
    try {
      await deleteClinicFaq(clinicId, faqId)
      await loadFaqs()
    } catch {
      setMessage(t('faqDeleteError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-black">{t('managedContentTitle')}</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t('managedContentHint')}</p>
        <form onSubmit={saveContent} className="mt-6 space-y-6">
          <LocalizedFields label={t('heroContent')} value={content.hero.title} onChange={(title) => setContent((v) => ({ ...v, hero: { ...v.hero, title } }))} />
          <LocalizedFields label={t('heroDescription')} value={content.hero.description} onChange={(description) => setContent((v) => ({ ...v, hero: { ...v.hero, description } }))} textarea />
          <LocalizedFields label={t('aboutTitle')} value={content.about.title} onChange={(title) => setContent((v) => ({ ...v, about: { ...v.about, title } }))} />
          <LocalizedFields label={t('aboutDescription')} value={content.about.description} onChange={(description) => setContent((v) => ({ ...v, about: { ...v.about, description } }))} textarea />
          <LocalizedFields label={t('footerAbout')} value={content.footer.about} onChange={(about) => setContent((v) => ({ ...v, footer: { ...v.footer, about } }))} textarea />
          <LocalizedFields label={t('footerCopyright')} value={content.footer.copyright} onChange={(copyright) => setContent((v) => ({ ...v, footer: { ...v.footer, copyright } }))} />
          <div className="grid gap-4 md:grid-cols-2">
            {['facebook', 'instagram', 'tiktok', 'youtube', 'whatsapp', 'website'].map((network) => (
              <label key={network} className="text-sm font-bold capitalize">
                {network}
                <input value={content.socialLinks[network] || ''} onChange={(e) => setContent((v) => ({ ...v, socialLinks: { ...v.socialLinks, [network]: e.target.value } }))} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal dark:border-gray-700 dark:bg-gray-950" />
              </label>
            ))}
          </div>
          <button disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? t('saving') : t('saveContent')}</button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-black">{t('faqManagementTitle')}</h3>
        <form onSubmit={saveFaq} className="mt-6 space-y-4">
          <LocalizedFields label={t('faqQuestion')} value={faq.question} onChange={(question) => setFaq((v) => ({ ...v, question }))} />
          <LocalizedFields label={t('faqAnswer')} value={faq.answer} onChange={(answer) => setFaq((v) => ({ ...v, answer }))} textarea />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('serviceOrder')} value={faq.order} onChange={(order) => setFaq((v) => ({ ...v, order: Number(order) }))} type="number" />
            <label className="flex items-center gap-2 pt-7 text-sm font-bold"><input type="checkbox" checked={faq.active} onChange={(e) => setFaq((v) => ({ ...v, active: e.target.checked }))} />{t('serviceActive')}</label>
          </div>
          <div className="flex gap-3">
            <button disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white">{editingFaqId ? t('saveFaq') : t('createFaq')}</button>
            {editingFaqId && <button type="button" onClick={() => { setEditingFaqId(null); setFaq(emptyFaq) }} className="rounded-xl border px-5 py-2.5 text-sm font-bold dark:border-gray-700">{t('cancelEdit')}</button>}
          </div>
        </form>
        <div className="mt-6 space-y-3">
          {status === 'loading' && <p className="text-sm text-slate-500">{t('adminLoading')}</p>}
          {status === 'ready' && faqs.map((item) => (
            <article key={item.faqId} className="rounded-2xl border p-4 dark:border-gray-800">
              <p className="font-bold">{item.question?.en || item.question?.ar || item.question?.fr}</p>
              <p className="mt-1 text-sm text-slate-500">{item.answer?.en || item.answer?.ar || item.answer?.fr}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => editFaq(item)} className="rounded-lg border px-3 py-2 text-xs font-bold dark:border-gray-700">{t('editFaq')}</button>
                <button type="button" onClick={() => removeFaq(item.faqId)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">{t('deleteFaq')}</button>
              </div>
            </article>
          ))}
        </div>
      </section>
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
          {textarea ? <textarea value={value[language]} onChange={(e) => onChange({ ...value, [language]: e.target.value })} className="mt-1 min-h-24 w-full rounded-xl border p-3 text-sm font-normal dark:border-gray-700 dark:bg-gray-950" /> : <input value={value[language]} onChange={(e) => onChange({ ...value, [language]: e.target.value })} className="mt-1 w-full rounded-xl border p-3 text-sm font-normal dark:border-gray-700 dark:bg-gray-950" />}
        </label>
      ))}
    </fieldset>
  )
}

function Field({ label, value, onChange, type = 'text' }) {
  return <label className="text-sm font-bold">{label}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border p-3 font-normal dark:border-gray-700 dark:bg-gray-950" /></label>
}
