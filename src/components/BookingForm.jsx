import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { createPublicAppointment } from '../lib/appointments'
import { localized } from '../lib/clinicData'
import { getTodayDate, validateAppointmentInput } from '../lib/appointmentValidation'
import { trackPublicEvent } from '../lib/analytics'

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-gray-700/80 dark:bg-gray-800 dark:text-white'

export default function BookingForm({ clinicId, services = [] }) {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    trackPublicEvent({ clinicId, eventType: 'booking_started', page: 'booking' })
  }, [clinicId])
  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    serviceId: '',
    date: '',
    time: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validation = validateAppointmentInput(formData)
    if (!validation.valid) {
      toast.error(t('bookingValidationError'))
      return
    }

    setIsSubmitting(true)

    try {
      await createPublicAppointment(clinicId, validation.value)
      await trackPublicEvent({ clinicId, eventType: 'booking_completed', page: 'booking' })
      toast.success(t('successMessage'))
      setFormData({
        petName: '',
        petType: '',
        ownerName: '',
        ownerPhone: '',
        ownerEmail: '',
        serviceId: '',
        date: '',
        time: '',
        notes: '',
      })
    } catch (error) {
      console.error('Public booking failed', error)
      toast.error(t('bookingError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="booking" className="bg-white px-8 py-20 transition-colors duration-300 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-md dark:border-gray-800/80 dark:bg-gray-900/60">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-black text-slate-900 dark:text-white">{t('bookingTitle')}</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">{t('bookingSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label={t('labelOwnerName')}>
            <input name="ownerName" required value={formData.ownerName} onChange={updateField} className={inputClass} />
          </Field>
          <Field label={t('labelOwnerPhone')}>
            <input name="ownerPhone" required value={formData.ownerPhone} onChange={updateField} className={inputClass} />
          </Field>
          <Field label={t('labelOwnerEmail')}>
            <input type="email" name="ownerEmail" value={formData.ownerEmail} onChange={updateField} className={inputClass} />
          </Field>
          <Field label={t('labelPetName')}>
            <input name="petName" required value={formData.petName} onChange={updateField} placeholder={t('phPetName')} className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label={t('labelPetType')}>
              <select name="petType" required value={formData.petType} onChange={updateField} className={inputClass}>
                <option value="">{t('optSelectType')}</option>
                <option value="cat">{t('optCat')}</option>
                <option value="dog">{t('optDog')}</option>
                <option value="bird">{t('optBird')}</option>
                <option value="other">{t('optOther')}</option>
              </select>
            </Field>
            <Field label={t('labelService')}>
              <select name="serviceId" required value={formData.serviceId} onChange={updateField} className={inputClass}>
                <option value="">{t('optSelectService')}</option>
                {services.map((service) => (
                  <option key={service.serviceId} value={service.serviceId}>
                    {localized(service.name, i18n.language)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label={t('labelDate')}>
              <input type="date" name="date" required min={getTodayDate()} value={formData.date} onChange={updateField} className={`${inputClass} font-mono`} />
            </Field>
            <Field label={t('labelTime')}>
              <input type="time" name="time" required value={formData.time} onChange={updateField} className={`${inputClass} font-mono`} />
            </Field>
          </div>

          <Field label={t('labelNotes')}>
            <textarea name="notes" value={formData.notes} onChange={updateField} rows="3" className={`${inputClass} resize-y`} />
          </Field>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting || services.length === 0}
            className="w-full rounded-xl bg-sky-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t('submitting') : t('btnSubmitBooking')}
          </motion.button>
        </form>
      </div>
    </section>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">{label}</span>
      {children}
    </label>
  )
}
