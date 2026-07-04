import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export default function VetTips() {
  const { t } = useTranslation();
  
  // Active category filter state
  const [activeFilter, setActiveFilter] = useState('all');

  // Enhanced data array with strict categorical taxonomy properties
  const tipsData = [
    { id: 1, category: 'cat', titleKey: "tip1Title", descKey: "tip1Desc", colorClass: "border-sky-500 bg-sky-50/30 dark:bg-sky-950/10" },
    { id: 2, category: 'dog', titleKey: "tip2Title", descKey: "tip2Desc", colorClass: "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10" },
    { id: 3, category: 'general', titleKey: "tip3Title", descKey: "tip3Desc", colorClass: "border-amber-500 bg-amber-50/30 dark:bg-amber-950/10" }
  ];

  // Definition layout for filtering tabs metadata
  const filterTabs = [
    { id: 'all', labelKey: 'filterAll', defaultLabel: 'All' },
    { id: 'cat', labelKey: 'optCat', defaultLabel: 'Cats' },
    { id: 'dog', labelKey: 'optDog', defaultLabel: 'Dogs' },
    { id: 'general', labelKey: 'optGeneral', defaultLabel: 'General Advice' }
  ];

  // Intercept data pipeline to extract only chosen category elements
  const filteredTips = activeFilter === 'all' 
    ? tipsData 
    : tipsData.filter(tip => tip.category === activeFilter);

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  return (
    <section id="tips" className="py-20 px-8 transition-colors duration-300 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        
        {/* Section header typography */}
        <div className="text-center mb-10">
          <span className="text-sky-600 dark:text-sky-400 font-bold text-sm bg-sky-50 dark:bg-sky-950/40 px-4 py-1.5 rounded-full inline-block mb-3">
            💡 {t('navTips', 'Vet Advice')}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            {t('tipsTitle')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
            {t('tipsSubtitle')}
          </p>
        </div>

        {/* Dynamic Micro-Animated Filter Tabs Bar */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-12 max-w-md mx-auto">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`relative px-5 py-2 text-sm font-bold rounded-xl transition-colors duration-300 cursor-pointer ${
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800/60'
                }`}
              >
                {/* Visual Sliding Pill Indicator via Framer Motion LayoutId */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-500 rounded-xl -z-10 shadow-md shadow-sky-600/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t(tab.labelKey, tab.defaultLabel)}</span>
              </button>
            );
          })}
        </div>

        {/* AnimatePresence for smoothly handling cards insertion/removal */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[220px]"
          >
          <AnimatePresence mode="popLayout">
            {filteredTips.map((tip) => (
              <motion.div 
                key={tip.id}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`p-6 rounded-2xl border-s-4 border-t border-e border-b border-transparent dark:border-gray-800/80 shadow-sm hover:shadow-xl dark:hover:shadow-none transition-shadow duration-300 group cursor-pointer ${tip.colorClass}`}
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-300">
                  {t(tip.titleKey)}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {t(tip.descKey)}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
