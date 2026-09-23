import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { localized, getPublicClinicBySlug, subscribePublicClinic } from '../lib/clinicData'
import Navbar from './Navbar'
import Hero from './Hero'
import Services from './Services'
import About from './About'
import VetTips from './VetTips'
import Faq from './Faq'
import Footer from './Footer'
import BookingForm from './BookingForm'
import { Toaster } from 'react-hot-toast'
import { trackPublicEvent, trackSessionStartOnce } from '../lib/analytics'

export default function PublicClinicPage({ clinicSlug }) {
  const { i18n, t } = useTranslation()
  const [clinic, setClinic] = useState(null)
  const [services, setServices] = useState([])
  const [faqs, setFaqs] = useState([])
  const [status, setStatus] = useState('loading')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    let unsubscribe = null

    const load = async () => {
      setStatus('loading')
      setLoadError('')
      try {
        const publicClinic = await getPublicClinicBySlug(clinicSlug)
        if (cancelled) return

        trackSessionStartOnce({ clinicId: publicClinic.clinicId, page: 'home' })
        trackPublicEvent({ clinicId: publicClinic.clinicId, eventType: 'page_view', page: 'home' })
        unsubscribe = subscribePublicClinic(publicClinic.clinicId, {
          onClinic: (nextClinic) => {
            if (cancelled) return
            setClinic(nextClinic)
            setStatus('ready')
          },
          onServices: (nextServices) => {
            if (!cancelled) setServices(nextServices)
          },
          onFaqs: (nextFaqs) => {
            if (!cancelled) setFaqs(nextFaqs)
          },
          onError: (error) => {
            if (cancelled) return
            setLoadError(error.message)
            setStatus(error.message === 'CLINIC_NOT_FOUND' ? 'not-found' : 'error')
          },
        })
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message)
          setStatus(error.message === 'CLINIC_NOT_FOUND' ? 'not-found' : 'error')
        }
      }
    }

    load()
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [clinicSlug])

  useEffect(() => {
    if (!clinic) return
    document.title = localized(clinic.name, i18n.language) || 'VetLife'
  }, [clinic, i18n.language])

  if (status === 'loading') return <PageState loading />
  if (status === 'not-found') return <PageState message="clinicNotFound" />
  if (status === 'error') return <PageState message="clinicLoadError" retry={() => window.location.reload()} error={loadError} />

  return (
    <div
      className="min-h-screen antialiased transition-colors duration-300 bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100"
      style={{
        '--clinic-primary': clinic.branding?.primaryColor || '#0284c7',
        '--clinic-accent': clinic.branding?.accentColor || '#10b981',
      }}
    >
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:shadow-xl dark:focus:bg-gray-900">{t('skipToContent')}</a>
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar clinic={clinic} />
      <main id="main-content">
        <Hero clinic={clinic} />
        <Services clinicId={clinic.clinicId} services={services} />
        <About clinic={clinic} />
        <VetTips />
        <Faq faqs={faqs} />
        <BookingForm clinicId={clinic.clinicId} services={services} clinic={clinic} />
      </main>
      <Footer clinic={clinic} />
    </div>
  )
}

function PageState({ message, loading = false, retry, error }) {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-gray-950" aria-live="polite">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" aria-hidden="true">{loading ? '…' : '!'}</div>
        <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">VetLife</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-gray-300">{loading ? t('clinicLoading') : t(message)}</p>
        {error && <p className="sr-only">{error}</p>}
        {retry && <button type="button" onClick={retry} className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500">{t('retry')}</button>}
      </section>
    </main>
  )
}
