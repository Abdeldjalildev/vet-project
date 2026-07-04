import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-12 px-8 border-t transition-colors duration-300 bg-slate-950 text-slate-400 border-slate-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        
        {/* Brand identity and short pitch */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h3l3-9 4 18 3-12h3" />
              <circle cx="12" cy="5" r="1" fill="currentColor" />
            </svg>
            <span className="text-xl font-black tracking-tight text-white">
              <span className="text-sky-400">Vet</span>Life
            </span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t('footerAboutText')}
          </p>
        </div>

        {/* Quick navigational map links */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-base">{t('footerLinksTitle')}</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#hero" className="hover:text-emerald-400 transition-colors">{t('navHome')}</a></li>
            <li><a href="#services" className="hover:text-emerald-400 transition-colors">{t('navServices')}</a></li>
            <li><a href="#about" className="hover:text-emerald-400 transition-colors">{t('navAbout')}</a></li>
            <li><a href="#faq" className="hover:text-emerald-400 transition-colors">{t('navFaq')}</a></li>
          </ul>
        </div>

        {/* Direct dynamic contact & functional developer social pipeline */}
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-bold text-base mb-3">{t('footerContactTitle')}</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">📍 <span className="hover:text-slate-300 transition-colors">{t('footerCity', 'Algeria')}</span></li>
              <li className="flex items-center gap-2">
                📞 <a href="tel:+213776605856" className="hover:text-sky-400 transition-colors dir-ltr inline-block">+213 (0) 776605856</a>
              </li>
              <li className="flex items-center gap-2">
                ✉️ <a href="mailto:abdeldjalilkhalfa2@gmail.com" className="hover:text-sky-400 transition-colors break-all">abdeldjalilkhalfa2@gmail.com</a>
              </li>
            </ul>
          </div>

          {/* Social Media Channels with human touch design details */}
          <div className="pt-2">
            <div className="flex items-center gap-4">
              {/* GitHub */}
              <a 
                href="https://github.com/djalil-kh" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all hover:-translate-y-0.5"
                title="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.061.069-.061 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012
                 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a 
                href="https://linkedin.com/in/abdeldjalil-khalfa" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-sky-400 hover:border-sky-900 transition-all hover:-translate-y-0.5"
                title="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com/djou_23_kh" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-950 transition-all hover:-translate-y-0.5"
                title="Instagram"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Semantic horizontal divider and developer trademark */}
      <div className="max-w-6xl mx-auto pt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} {t('footerCopyright')}</p>
        <p className="hover:text-slate-400 transition-colors">
          {t('footerDevelopedBy', 'Developed with Heart by Abdeldjalil Khalfa')}
        </p>
      </div>
    </footer>
  );
}