import { Component } from 'react'
import { useTranslation } from 'react-i18next'

export default class AppErrorBoundary extends Component {
  static getDerivedStateFromError() {
    return { hasError: true }
  }

  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return <ErrorFallback />
  }
}

function ErrorFallback() {
  const { t } = useTranslation()
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-gray-950">
      <section role="alert" className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-black">{t('unexpectedErrorTitle')}</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-gray-300">{t('unexpectedErrorMessage')}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-500"
        >
          {t('reloadPage')}
        </button>
      </section>
    </main>
  )
}
