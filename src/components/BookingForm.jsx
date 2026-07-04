import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function BookingForm({ onAddAppointment }) {
  const { t } = useTranslation();
  
  // State pipeline to hold input values locally
  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
    service: '',
    date: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Computes system standard ISO date limits for fluid UI blocking
  const getTodayDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    
    // 1. Dispatch data instantly to parent context pipeline
    if (onAddAppointment) {
      onAddAppointment(formData);
    }
    
    // 2. Spawn dynamic toast notifications with current theme integration
    toast.success(t('successMessage'), {
      duration: 4000,
      style: {
        borderRadius: '1rem',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
        border: '1px solid ' + (document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0'),
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#ffffff',
      },
    });
    
    // 3. Reset form data after cooling period interval
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ petName: '', petType: '', service: '', date: '' });
    }, 4000);
  };

  return (
    <section id="booking" className="py-20 px-8 transition-colors duration-300 bg-white dark:bg-gray-950">
      <div className="max-w-xl mx-auto bg-slate-50 dark:bg-gray-900/60 p-8 rounded-3xl border border-slate-100 dark:border-gray-800/80 shadow-md">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            {t('bookingTitle')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            {t('bookingSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              {t('labelPetName')}
            </label>
            <input 
              type="text" 
              name="petName"
              required
              value={formData.petName}
              onChange={handleChange}
              placeholder={t('phPetName')}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                {t('labelPetType')}
              </label>
              <select 
                name="petType"
                required
                value={formData.petType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all text-sm"
               >
                <option value="">{t('optSelectType')}</option>
                <option value="cat">{t('optCat')}</option>
                <option value="dog">{t('optDog')}</option>
                <option value="bird">{t('optBird')}</option>
                <option value="other">{t('optOther')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                {t('labelService')}
              </label>
              <select 
                name="service"
                required
                value={formData.service}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all text-sm"
              >
                <option value="">{t('optSelectService')}</option>
                <option value="checkup">{t('service1Title')}</option>
                <option value="vaccine">{t('service2Title')}</option>
                <option value="grooming">{t('service3Title')}</option>
                <option value="surgery">{t('service4Title')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              {t('labelDate')}
            </label>
            <input 
              type="date" 
              name="date"
              required
              min={getTodayDateString()}
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 transition-all text-sm font-mono"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitted}
            className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold rounded-xl shadow-md shadow-sky-600/10 hover:shadow-lg transition-all text-sm mt-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitted ? '...' : t('btnSubmitBooking')}
          </motion.button>
        </form>

      </div>
    </section>
  );
}