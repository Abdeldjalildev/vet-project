import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { localized } from '../lib/clinicData'

export default function Faq({ faqs = [] }) {
  const { t, i18n } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(null)

  return (
    <section id="faq" className="border-y border-slate-100 bg-slate-50 px-8 py-20 transition-colors duration-300 dark:border-gray-800/60 dark:bg-gray-900/40">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            {t('navFaq')}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('faqSectionTitle')}
          </h2>
        </div>

        {faqs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-gray-700 dark:text-slate-400">
            {t('noFaqs')}
          </p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeIndex === index
              return (
                <div key={faq.faqId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-start font-bold text-slate-800 transition-colors hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
                  >
                    <span>{localized(faq.question, i18n.language)}</span>
                    <span className={isOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'}>▲</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="border-t border-slate-100 bg-white/50 p-5 dark:border-gray-700/60 dark:bg-gray-800/40">
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                            {localized(faq.answer, i18n.language)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
