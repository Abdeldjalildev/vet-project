import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getInitialTheme, syncThemeWithDOM } from '../i18n/config'
import { localized } from '../lib/clinicData'

export default function Navbar({ clinic }) {
  const { t, i18n } = useTranslation()
  const [isDark, setIsDark] = useState(() => getInitialTheme())
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const clinicName = localized(clinic?.name, i18n.language) || 'VetLife'

  const handleThemeToggle = () => {
    const nextDarkState = !isDark
    setIsDark(nextDarkState)
    syncThemeWithDOM(nextDarkState)
  }

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value)
    setIsMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100/80 bg-white/90 text-slate-800 shadow-sm backdrop-blur-md transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/90 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <a href="#hero" className="flex min-w-0 items-center gap-2.5" aria-label={clinicName}>
            {clinic?.logoUrl ? (
              <img src={clinic.logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-gray-700" />
            ) : (
              <span aria-hidden="true" className="text-xl font-bold tracking-tight text-emerald-500 dark:text-emerald-400">🐾</span>
            )}
            <span className="truncate text-xl font-black tracking-tight">
              <span className="text-sky-500">Vet</span><span className="text-slate-900 dark:text-white">Life</span>
            </span>
            {clinicName !== 'VetLife' && <span className="hidden max-w-40 truncate border-s border-slate-200 ps-3 text-sm font-semibold text-slate-500 dark:border-gray-700 dark:text-gray-300 sm:inline">{clinicName}</span>}
          </a>

          <div className="hidden items-center gap-8 font-medium md:flex">
            <PublicLinks t={t} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <select
              onChange={handleLanguageChange}
              value={i18n.language.split('-')[0]}
              aria-label={t('language')}
              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-medium outline-none transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>

            <button
              type="button"
              onClick={handleThemeToggle}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-slate-200"
              aria-label={t('toggleTheme')}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            <a href="#contact" className="hidden rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-600 sm:inline-block">
              {t('navContact')}
            </a>

            <button
              type="button"
              aria-label={isMenuOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-gray-700 dark:bg-gray-800 md:hidden"
            >
              <span aria-hidden="true">{isMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-slate-100 py-3 md:hidden dark:border-gray-800">
            <nav aria-label={t('publicNavigation')} className="grid gap-1">
              <PublicLinks t={t} mobile onNavigate={() => setIsMenuOpen(false)} />
            </nav>
          </div>
        )}
      </div>
    </nav>
  )
}

function PublicLinks({ t, mobile = false, onNavigate }) {
  const links = [
    ['#hero', 'navHome'],
    ['#about', 'navAbout'],
    ['#services', 'navServices'],
    ['#faq', 'navFaq'],
    ['#booking', 'heroBtnBook'],
  ]

  return links.map(([href, key]) => (
    <a
      key={href}
      href={href}
      onClick={onNavigate}
      className={mobile
        ? 'rounded-xl px-3 py-3 text-sm font-bold hover:bg-slate-100 dark:hover:bg-gray-800'
        : 'transition-colors hover:text-emerald-500 dark:hover:text-emerald-400'}
    >
      {t(key)}
    </a>
  ))
}
