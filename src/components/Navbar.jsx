import React from 'react';
import { useTranslation } from 'react-i18next';
import { getInitialTheme, syncThemeWithDOM } from '../i18n/config';

export default function Navbar() {
 const { t, i18n } = useTranslation();
  
  // Manage the live reactive dark mode state directly within React context
  const [isDark, setIsDark] = React.useState(() => getInitialTheme());

  // Handle language transitions seamlessly via i18next internal core
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Toggle theme globally and keep the DOM synchronized dynamically
  const handleThemeToggle = () => {
    const nextDarkState = !isDark;
    setIsDark(nextDarkState);
    syncThemeWithDOM(nextDarkState);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 bg-white/90 dark:bg-gray-900/90 border-slate-100 dark:border-gray-800 text-slate-800 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight text-emerald-500 dark:text-emerald-400">
            Vet<span className="text-slate-800 dark:text-white">Life</span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          <a href="#hero" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">{t('navHome')}</a>
          <a href="#about" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">{t('navAbout')}</a>
          <a href="#services" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">{t('navServices')}</a>
          <a href="#faq" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">{t('navFaq')}</a>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          
          {/* Language Selector Dropdown */}
          <select 
            onChange={(e) => changeLanguage(e.target.value)} 
            value={i18n.language}
            className="px-2 py-1.5 rounded-md border text-sm font-medium outline-none cursor-pointer transition-colors bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-200"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>

          {/* Clean Integrated Dark Mode Toggle Button */}
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-lg border transition-colors bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-200"
            aria-label="Toggle Theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          
          {/* Contact Button */}
          <a 
            href="#contact" 
            className="hidden sm:inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full font-medium transition-all text-sm shadow-sm"
          >
            {t('navContact')}
          </a>
        </div>

      </div>
    </nav>
  );
}