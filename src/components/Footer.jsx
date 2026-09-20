import { useTranslation } from 'react-i18next'
import { localized } from '../lib/clinicData'

export default function Footer({ clinic }) {
  const { t, i18n } = useTranslation()
  const contact = clinic.contact || {}
  const socialLinks = clinic.socialLinks || {}
  const footer = clinic.footer || {}

  return (
    <footer id="contact" className="border-t border-slate-900 bg-slate-950 px-8 py-12 text-slate-400">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-4">
          <p className="text-xl font-black text-white">
            {localized(clinic.name, i18n.language)}
          </p>
          <p className="text-sm leading-relaxed">
            {localized(footer.about, i18n.language)}
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-bold text-white">{t('footerContactTitle')}</h4>
          <ul className="space-y-2 text-sm">
            {contact.address && <li>📍 {localized(contact.address, i18n.language)}</li>}
            {contact.phone && <li>📞 <a href={`tel:${contact.phone}`} className="hover:text-sky-400">{contact.phone}</a></li>}
            {contact.email && <li>✉️ <a href={`mailto:${contact.email}`} className="break-all hover:text-sky-400">{contact.email}</a></li>}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-bold text-white">{t('socialLinks')}</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(socialLinks).filter(([, url]) => Boolean(url)).map(([network, url]) => (
              <a
                key={network}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold capitalize hover:text-white"
              >
                {network}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-slate-900 pt-8 text-center text-xs text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} {localized(footer.copyright, i18n.language)}</p>
        <p>{t('poweredByVetLife')}</p>
      </div>
    </footer>
  )
}
