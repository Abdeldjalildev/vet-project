import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function Faq() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(null);

  const faqData = [
    { questionKey: "faq1Q", answerKey: "faq1A" },
    { questionKey: "faq2Q", answerKey: "faq2A" },
    { questionKey: "faq3Q", answerKey: "faq3A" },
    { questionKey: "faq4Q", answerKey: "faq4A" }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 px-8 border-t border-b transition-colors duration-300 bg-slate-50 dark:bg-gray-900/40 border-slate-100 dark:border-gray-800/60">
      <div className="max-w-3xl mx-auto">
        
        {/* Header container */}
        <div className="text-center mb-12">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/40 px-4 py-1.5 rounded-full inline-block mb-3">
            {t('navFaq')}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t('faqSectionTitle')}
          </h2>
        </div>

        {/* Accordion list stack */}
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <div 
                key={index} 
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen 
                    ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10 shadow-sm' 
                    : 'border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-800'
                }`}
              >
                {/* Accordion interactive trigger header */}
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-5 text-start font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer outline-none"
                >
                  <span>{t(item.questionKey)}</span>
                  <span className={`text-sm transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-500' : 'text-slate-400'}`}>
                    ▲
                  </span>
                </button>

                {/* Motion collapse animation with explicit AnimatePresence support */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="p-5 text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/40">
                        <p className="leading-relaxed text-sm md:text-base">
                          {t(item.answerKey)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}