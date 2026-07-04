import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard({ appointments }) {
  const { t } = useTranslation();

  // Maps values back to core dynamic translation keys
  const getServiceTranslationKey = (serviceValue) => {
    switch(serviceValue) {
      case 'checkup': return t('service1Title');
      case 'vaccine': return t('service2Title');
      case 'grooming': return t('service3Title');
      case 'surgery': return t('service4Title');
      default: return serviceValue;
    }
  };

  const getPetTypeTranslationKey = (typeValue) => {
    switch(typeValue) {
      case 'cat': return t('optCat');
      case 'dog': return t('optDog');
      case 'bird': return t('optBird');
      case 'other': return t('optOther');
      default: return typeValue;
    }
  };

  return (
    <section className="py-16 px-8 transition-colors duration-300 bg-slate-50 dark:bg-gray-900/40">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700/80 p-6 md:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none transition-colors duration-300">
        
        {/* Dashboard Section Title */}
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-gray-700 pb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('adminTitle')}
          </h2>
        </div>

        {/* Database Grid Table View */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-gray-700">
          <table className="w-full text-sm text-start border-collapse">
            
            <thead>
              <tr className="bg-slate-100/80 dark:bg-gray-700/50 border-b border-slate-200 dark:border-gray-700">
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-gray-300 text-start">{t('thPetName')}</th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-gray-300 text-start">{t('thPetType')}</th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-gray-300 text-start">{t('thService')}</th>
                <th className="px-6 py-4 font-bold text-slate-700 dark:text-gray-300 text-start">{t('thDate')}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-gray-700/60">
              {appointments && appointments.map((app) => (
                <tr 
                  key={app.id} 
                  className="hover:bg-slate-50/60 dark:hover:bg-gray-700/20 transition-colors duration-200"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-gray-100">{app.petName}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-gray-300">{getPetTypeTranslationKey(app.petType)}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-gray-300">
                    <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400">
                      {getServiceTranslationKey(app.service)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-gray-400 font-mono">{app.date}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </section>
  );
}