import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { localized, getPublicClinicBySlug, getPublicClinicContent } from '../lib/clinicData'
import Navbar from './Navbar'
import Hero from './Hero'
import Services from './Services'
import About from './About'
import VetTips from './VetTips'
import Faq from './Faq'
import Footer from './Footer'
import BookingForm from './BookingForm'
import { Toaster } from 'react-hot-toast'

export default function PublicClinicPage({ clinicSlug }) {
  const { i18n } = useTranslation()
  const [clinic, setClinic] = useState(null)
  const [services, setServices] = useState([])
  const [faqs, setFaqs] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setStatus('loading')
      try {
        const publicClinic = await getPublicClinicBySlug(clinicSlug)
        const content = await getPublicClinicContent(publicClinic.clinicId)

        if (cancelled) return

        setClinic(publicClinic)
        setServices(content.services)
        setFaqs(content.faqs)
        setStatus('ready')
      } catch (error) {
        if (cancelled) return
        setStatus(error.message === 'CLINIC_NOT_FOUND' ? 'not-found' : 'error')
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [clinicSlug])

  useEffect(() => {
    if (!clinic) return
    document.title = localized(clinic.name, i18n.language) || 'VetLife'
  }, [clinic, i18n.language])

  if (status === 'loading') {
    return <PageState message="Loading clinic..." />
  }

  if (status === 'not-found') {
    return <PageState message="This clinic is not available." />
  }

  if (status === 'error') {
    return <PageState message="We could not load this clinic right now." />
  }

  return (
    <div
      className="min-h-screen antialiased transition-colors duration-300 bg-slate-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100"
      style={{
        '--clinic-primary': clinic.branding?.primaryColor || '#0284c7',
        '--clinic-accent': clinic.branding?.accentColor || '#10b981',
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar clinic={clinic} />
      <main>
        <Hero clinic={clinic} />
        <Services services={services} />
        <About clinic={clinic} />
        <VetTips />
        <Faq faqs={faqs} />
        <BookingForm clinicId={clinic.clinicId} services={services} />
      </main>
      <Footer clinic={clinic} />
    </div>
  )
}

function PageState({ message }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-gray-950">
      <section className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">VetLife</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-gray-300">{message}</p>
      </section>
    </main>
  )
}
