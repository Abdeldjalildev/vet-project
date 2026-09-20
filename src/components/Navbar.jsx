import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getInitialTheme, syncThemeWithDOM } from '../i18n/config'
import { localized } from '../lib/clinicData'

export default function Navbar({ clinic }) {
  const { t, i18n } = useTranslation()
  const [isDark, setIsDark] = useState(() => getInitialTheme())

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 text-slate-800 backdrop-blur-md transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/90 dark:text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#hero" className="flex items-center gap-2">
          {clinic.logoUrl ? (
            <img src={clinic.logoUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <span className="font-bold tracking-tight text-emerald-500 dark:text-emerald-400">🐾</span>
          )}
          <span className="font-bold tracking-tight">
            {localized(clinic.name, i18n.language)}
          </span>
        </a>

        <div className="hidden items-center gap-8 font-medium md:flex">
          <a href="#hero" className="transition-colors hover:text-emerald-500">{t('navHome')}</a>
          <a href="#about" className="transition-colors hover:text-emerald-500">{t('navAbout')}</a>
          <a href="#services" className="transition-colors hover:text-emerald-500">{t('navServices')}</a>
          <a href="#faq" className="transition-colors hover:text-emerald-500">{t('navFaq')}</a>
        </div>

        <div className="flex items-center gap-3">
          <select
            onChange={(event) => i18n.changeLanguage(event.target.value)}
            value={i18n.language.split('-')[0]}
            aria-label={t('language')}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
          <button
            type="button"
            onClick={() => {
              const next = !isDark
              setIsDark(next)
              syncThemeWithDOM(next)
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-gray-700 dark:bg-gray-800"
            aria-label={t('toggleTheme')}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  )
}
