import { useMemo, useState } from 'react'
import qrcode from 'qrcode-generator'
import { useTranslation } from 'react-i18next'

export default function ClinicPublicAccessAdmin({ clinic }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const publicUrl = useMemo(() => {
    if (!clinic?.slug) return ''
    return new URL('/c/' + encodeURIComponent(clinic.slug), window.location.origin).toString()
  }, [clinic?.slug])

  const qrDataUrl = useMemo(() => {
    if (!publicUrl) return ''
    const qr = qrcode(0, 'M')
    qr.addData(publicUrl)
    qr.make()
    return qr.createDataURL(6, 4)
  }, [publicUrl])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print:hidden dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-xl font-black">{t('publicAccessTitle')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t('publicAccessHint')}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input readOnly value={publicUrl} aria-label={t('publicClinicLink')} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-950" />
          <button type="button" onClick={copyLink} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white">{copied ? t('copied') : t('copyLink')}</button>
          <button type="button" onClick={() => window.print()} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold dark:border-gray-700">{t('printQr')}</button>
        </div>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900 print:border-0 print:shadow-none">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">VetLife</p>
        <h3 className="mt-2 text-2xl font-black">{clinic?.name?.en || clinic?.name?.ar || clinic?.name?.fr || 'Clinic'}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-gray-400 print:text-black">{t('scanToVisitClinic')}</p>
        <div className="mx-auto mt-6 max-w-[360px] rounded-2xl bg-white p-4"><img src={qrDataUrl} alt={t('clinicQrCode')} className="mx-auto h-auto w-full" /></div>
        <p className="mt-4 break-all text-xs text-slate-500 dark:text-gray-400 print:text-black">{publicUrl}</p>
      </section>
    </div>
  )
}
