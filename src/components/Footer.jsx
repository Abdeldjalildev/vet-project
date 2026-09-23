import { useTranslation } from 'react-i18next'
import { localized } from '../lib/clinicData'

const NETWORK_LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  whatsapp: 'WhatsApp',
  website: 'Website',
}

export default function Footer({ clinic }) {
  const { t, i18n } = useTranslation()
  const contact = clinic?.contact || {}
  const socialLinks = clinic?.socialLinks || {}
  const footer = clinic?.footer || {}
  const clinicName = localized(clinic?.name, i18n.language) || 'VetLife'
  const footerAbout = localized(footer.about, i18n.language) || t('footerAboutFallback')
  const copyright = localized(footer.copyright, i18n.language) || t('footerCopyrightFallback')

  return (
    <footer id="contact" className="border-t border-slate-900 bg-slate-950 px-6 py-12 text-slate-400 md:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-emerald-400" aria-hidden="true">🐾</span>
            <span className="text-xl font-black tracking-tight text-white"><span className="text-sky-400">Vet</span>Life</span>
          </div>
          <p className="text-sm leading-relaxed">{footerAbout}</p>
          {clinicName !== 'VetLife' && <p className="text-xs font-semibold text-slate-500">{clinicName}</p>}
        </div>

        <div className="space-y-3">
          <h4 className="text-base font-bold text-white">{t('footerLinksTitle')}</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#hero" className="transition-colors hover:text-emerald-400">{t('navHome')}</a></li>
            <li><a href="#services" className="transition-colors hover:text-emerald-400">{t('navServices')}</a></li>
            <li><a href="#about" className="transition-colors hover:text-emerald-400">{t('navAbout')}</a></li>
            <li><a href="#faq" className="transition-colors hover:text-emerald-400">{t('navFaq')}</a></li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="mb-3 text-base font-bold text-white">{t('footerContactTitle')}</h4>
            <ul className="space-y-2 text-sm">
              {clinic?.emergencyInformation && <li className="rounded-xl bg-red-950/40 p-3 text-red-200">🚨 {localized(clinic.emergencyInformation, i18n.language)}</li>}
              {contact.address && <li>📍 {localized(contact.address, i18n.language)}</li>}
              {contact.phone && <li>📞 <a href={`tel:${contact.phone}`} className="transition-colors hover:text-sky-400">{contact.phone}</a></li>}
              {contact.email && <li>✉️ <a href={`mailto:${contact.email}`} className="break-all transition-colors hover:text-sky-400">{contact.email}</a></li>}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-base font-bold text-white">{t('socialLinks')}</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(socialLinks).filter(([, url]) => Boolean(url)).map(([network, url]) => (
                <a key={network} href={url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:text-white">
                  {NETWORK_LABELS[network] || network}
                </a>
              ))}
              {Object.values(socialLinks).every((value) => !value) && <span className="text-xs text-slate-500">{t('noSocialLinks')}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-slate-900 pt-8 text-center text-xs text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} {copyright}</p>
        <p>{t('poweredByVetLife')}</p>
      </div>
    </footer>
  )
}
