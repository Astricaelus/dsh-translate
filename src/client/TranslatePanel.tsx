import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ApiFailure, loadCatalog, translateChunk } from './api.ts'
import {
  CheckIcon,
  ClearIcon,
  CopyIcon,
  HistoryIcon,
  ShieldIcon,
  SparkIcon,
  SwapIcon,
  TrashIcon,
  TranslationIcon,
} from './icons.tsx'
import type { TranslateKey } from './locales.ts'
import {
  createHistoryEntry,
  loadHistory,
  loadPreferences,
  saveHistory,
  savePreferences,
} from './storage.ts'
import { panelStyles } from './styles.ts'
import type {
  HistoryEntry,
  RouteCatalog,
  TranslatePanelProps,
  TranslationRoute,
} from './types.ts'
import { splitForTranslation } from '../shared/text.js'

const LANGUAGES = [
  'en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ru',
  'ar', 'hi', 'it', 'nl', 'pl', 'tr', 'uk', 'vi', 'th', 'id', 'ms',
  'sv', 'da', 'fi', 'nb', 'cs', 'el', 'he', 'fa', 'ur', 'bn', 'ta',
] as const

const WEB_ONLY_CATALOG: RouteCatalog = {
  maxTextChars: 4000,
  maxTotalChars: 60000,
  webProviders: [
    { id: 'bing', name: 'Bing', description: 'Microsoft Edge web translation' },
    { id: 'google', name: 'Google', description: 'Google web translation' },
  ],
  llmProviders: [],
}

interface FlatRoute {
  id: string
  label: string
  providerName: string
  route: TranslationRoute
}

interface LastRun {
  source: string
  targetLanguage: string
  sourceLanguage: string
  routeId: string
}

type TranslationState = 'idle' | 'working' | 'done' | 'cancelled' | 'error'

export function TranslatePanel({ t }: TranslatePanelProps) {
  const activeLocale = typeof document === 'undefined' ? 'en' : document.documentElement.lang || 'en'
  const fallbackTarget = activeLocale.toLowerCase().startsWith('zh') ? 'en' : 'zh-CN'
  const initialPreferences = useMemo(() => loadPreferences(fallbackTarget), [fallbackTarget])
  const [source, setSource] = useState('')
  const [translation, setTranslation] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState(initialPreferences.sourceLanguage)
  const [targetLanguage, setTargetLanguage] = useState(initialPreferences.targetLanguage)
  const [routeId, setRouteId] = useState(initialPreferences.routeId)
  const [catalog, setCatalog] = useState<RouteCatalog>(WEB_ONLY_CATALOG)
  const [catalogState, setCatalogState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [state, setState] = useState<TranslationState>('idle')
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [lastRun, setLastRun] = useState<LastRun | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory())
  const [historyOpen, setHistoryOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.innerWidth > 1120
  })
  const [confirmClear, setConfirmClear] = useState(false)
  const [copied, setCopied] = useState(false)
  const sourceRef = useRef<HTMLTextAreaElement>(null)
  const requestRef = useRef<AbortController | null>(null)
  const copiedTimer = useRef<number | undefined>(undefined)
  const runToken = useRef(0)

  const flatRoutes = useMemo(() => flattenRoutes(catalog), [catalog])
  const selectedRoute = flatRoutes.find(route => route.id === routeId) ?? flatRoutes[0]
  const selectedRouteId = selectedRoute?.id ?? 'web:bing'
  const isWorking = state === 'working'
  const isStale = translation !== '' && lastRun !== null && (
    lastRun.source !== source
    || lastRun.targetLanguage !== targetLanguage
    || lastRun.sourceLanguage !== sourceLanguage
    || lastRun.routeId !== selectedRouteId
  )
  const tooLong = source.length > catalog.maxTotalChars
  const canTranslate = source.trim() !== '' && !tooLong && !isWorking && selectedRoute !== undefined
  const canSwap = translation !== '' && sourceLanguage !== 'auto' && !isWorking
  const languageOptions = useMemo(
    () => LANGUAGES.map(code => ({ code, label: languageName(code, activeLocale) })),
    [activeLocale],
  )
  const aiSelected = selectedRoute?.route.kind === 'llm'

  useEffect(() => {
    const controller = new AbortController()
    setCatalogState('loading')
    void loadCatalog(controller.signal).then((next) => {
      if (controller.signal.aborted) return
      setCatalog(next)
      setCatalogState('ready')
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return
      setCatalogState('error')
      if (!(error instanceof ApiFailure) || error.code !== 'NETWORK_ERROR') {
        // The page stays usable with the built-in web routes.
        console.warn('[dsh-translate] model catalog unavailable', error)
      }
    })
    return () => { controller.abort() }
  }, [])

  useEffect(() => {
    if (catalogState !== 'ready') return
    if (!flatRoutes.some(route => route.id === routeId)) setRouteId(flatRoutes[0]?.id ?? 'web:bing')
  }, [catalogState, flatRoutes, routeId])

  useEffect(() => {
    savePreferences({ targetLanguage, sourceLanguage, routeId: selectedRouteId })
  }, [selectedRouteId, sourceLanguage, targetLanguage])

  useEffect(() => {
    saveHistory(history)
  }, [history])

  useEffect(() => {
    sourceRef.current?.focus()
    return () => {
      requestRef.current?.abort()
      if (copiedTimer.current !== undefined) window.clearTimeout(copiedTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!copied) return
    copiedTimer.current = window.setTimeout(() => { setCopied(false) }, 1500)
    return () => {
      if (copiedTimer.current !== undefined) window.clearTimeout(copiedTimer.current)
    }
  }, [copied])

  function changeRoute(next: string): void {
    setRouteId(next)
    setErrorCode(null)
    if (state !== 'working') setState('idle')
  }

  function changeSourceLanguage(next: string): void {
    setSourceLanguage(next)
    setErrorCode(null)
    if (state !== 'working') setState('idle')
  }

  function changeTargetLanguage(next: string): void {
    setTargetLanguage(next)
    setErrorCode(null)
    if (state !== 'working') setState('idle')
  }

  function cancelTranslation(): void {
    if (!isWorking) return
    runToken.current += 1
    requestRef.current?.abort()
    requestRef.current = null
    setState('cancelled')
    setProgress({ done: 0, total: 0 })
    setErrorCode(null)
  }

  async function startTranslation(): Promise<void> {
    if (!canTranslate || selectedRoute === undefined) return
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    const token = ++runToken.current
    const runSource = source
    const runTarget = targetLanguage
    const runSourceLanguage = sourceLanguage
    const runRoute = selectedRoute
    const fragments = splitForTranslation(runSource, catalog.maxTextChars)
    setState('working')
    setErrorCode(null)
    setTranslation('')
    setLastRun(null)
    setProgress({ done: 0, total: fragments.length })
    const translated = new Array<string>(fragments.length).fill('')

    try {
      for (let index = 0; index < fragments.length; index += 1) {
        const fragment = fragments[index] as string
        const whitespace = fragmentWhitespace(fragment)
        const value = whitespace.core === ''
          ? ''
          : await translateChunk({
            text: whitespace.core,
            sourceLanguage: runSourceLanguage,
            targetLanguage: runTarget,
            route: runRoute.route,
          }, controller.signal)
        if (token !== runToken.current) return
        if (whitespace.core !== '' && value.trim() === '') {
          throw new ApiFailure('EMPTY_TRANSLATION', 'Translation was empty', 502)
        }
        translated[index] = whitespace.leading + value + whitespace.trailing
        setTranslation(translated.join(''))
        setProgress({ done: index + 1, total: fragments.length })
      }
      if (token !== runToken.current) return
      const result = translated.join('').trim()
      if (result === '') throw new ApiFailure('EMPTY_TRANSLATION', 'Translation was empty', 502)
      setTranslation(result)
      setState('done')
      const completed = { source: runSource, targetLanguage: runTarget, sourceLanguage: runSourceLanguage, routeId: runRoute.id }
      setLastRun(completed)
      if (runSource.length + result.length <= 20000) {
        const entry = createHistoryEntry({
          source: runSource,
          translation: result,
          sourceLanguage: runSourceLanguage,
          targetLanguage: runTarget,
          routeId: runRoute.id,
          routeLabel: runRoute.label,
        })
        setHistory(current => [
          entry,
          ...current.filter(item => !(item.source === entry.source
            && item.translation === entry.translation
            && item.targetLanguage === entry.targetLanguage
            && item.sourceLanguage === entry.sourceLanguage
            && item.routeId === entry.routeId)),
        ].slice(0, 60))
      }
    } catch (error) {
      if (token !== runToken.current || controller.signal.aborted) return
      setState('error')
      setErrorCode(error instanceof ApiFailure ? error.code : 'UNKNOWN_ERROR')
    } finally {
      if (requestRef.current === controller) requestRef.current = null
      if (token === runToken.current) setProgress({ done: 0, total: 0 })
    }
  }

  function clearEditor(): void {
    if (isWorking) cancelTranslation()
    runToken.current += 1
    setSource('')
    setTranslation('')
    setLastRun(null)
    setErrorCode(null)
    setProgress({ done: 0, total: 0 })
    setState('idle')
    sourceRef.current?.focus()
  }

  function swapLanguages(): void {
    if (!canSwap) return
    const previousTarget = targetLanguage
    setSource(translation)
    setTranslation(source)
    setSourceLanguage(previousTarget)
    setTargetLanguage(sourceLanguage)
    setLastRun({
      source: translation,
      targetLanguage: sourceLanguage,
      sourceLanguage: previousTarget,
      routeId: selectedRouteId,
    })
    setState('done')
    setErrorCode(null)
  }

  async function copyTranslation(): Promise<void> {
    if (translation === '') return
    try {
      await copyText(translation)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function loadHistoryEntry(entry: HistoryEntry): void {
    if (isWorking) cancelTranslation()
    setSource(entry.source)
    setTranslation(entry.translation)
    setSourceLanguage(entry.sourceLanguage)
    setTargetLanguage(entry.targetLanguage)
    if (flatRoutes.some(route => route.id === entry.routeId)) setRouteId(entry.routeId)
    setLastRun({
      source: entry.source,
      targetLanguage: entry.targetLanguage,
      sourceLanguage: entry.sourceLanguage,
      routeId: entry.routeId,
    })
    setState('done')
    setErrorCode(null)
    sourceRef.current?.focus()
  }

  const statusText = isWorking
    ? progress.total > 1
      ? t('status.translatingParts', { done: progress.done, total: progress.total })
      : t('status.translating')
    : state === 'cancelled'
      ? t('status.cancelled')
      : isStale
        ? t('status.stale')
        : state === 'error'
          ? t('error.label')
          : state === 'done'
            ? t('status.complete')
            : ''
  const statusTone = state === 'error' ? 'error' : isStale ? 'stale' : 'normal'
  const errorCopy = errorCode === null ? undefined : errorKey(errorCode)

  return (
    <>
      <style data-dsh-translate="">{panelStyles}</style>
      <section className="dshx-root" aria-label={t('aria.page')} data-testid="dsh-translate-page">
        <header className="dshx-header">
          <div className="dshx-identity">
            <span className="dshx-mark"><TranslationIcon size={21} /></span>
            <div className="dshx-titles">
              <h1 className="dshx-title">{t('title')}</h1>
              <p className="dshx-subtitle">{t('subtitle')}</p>
            </div>
          </div>
          <div className="dshx-header-actions">
            <button
              type="button"
              className="dshx-icon-button dshx-focus-only"
              aria-label={historyOpen ? t('history.close') : t('history.open')}
              aria-pressed={historyOpen}
              title={historyOpen ? t('history.close') : t('history.open')}
              onClick={() => { setHistoryOpen(value => !value) }}
            >
              <HistoryIcon size={17} />
              {history.length > 0 && <span className="dshx-count-badge">{history.length > 99 ? '99+' : history.length}</span>}
            </button>
            <button
              type="button"
              className="dshx-icon-button dshx-focus-only"
              aria-label={t('action.new')}
              title={t('action.new')}
              onClick={clearEditor}
            >
              <ClearIcon size={16} />
            </button>
          </div>
        </header>

        <div className="dshx-workspace" data-history={historyOpen ? 'open' : 'closed'}>
          <div className="dshx-main">
            <div className="dshx-control-bar">
              <div className="dshx-language-bar">
                <label className="dshx-field">
                  <span className="dshx-field-label">{t('language.from')}</span>
                  <span className="dshx-select-shell">
                    <select
                      className="dshx-select dshx-source-language"
                      aria-label={t('language.from')}
                      value={sourceLanguage}
                      onChange={(event) => { changeSourceLanguage(event.target.value) }}
                    >
                      <option value="auto">{t('language.auto')}</option>
                      {languageOptions.map(option => <option key={option.code} value={option.code}>{option.label}</option>)}
                    </select>
                  </span>
                </label>
                <button
                  type="button"
                  className="dshx-icon-button dshx-swap dshx-focus-only"
                  aria-label={t('language.swap')}
                  title={canSwap ? t('language.swap') : t('language.swapUnavailable')}
                  disabled={!canSwap}
                  onClick={swapLanguages}
                >
                  <SwapIcon size={16} />
                </button>
                <label className="dshx-field">
                  <span className="dshx-field-label">{t('language.to')}</span>
                  <span className="dshx-select-shell">
                    <select
                      className="dshx-select dshx-target-language"
                      aria-label={t('language.to')}
                      value={targetLanguage}
                      onChange={(event) => { changeTargetLanguage(event.target.value) }}
                    >
                      {languageOptions.map(option => <option key={option.code} value={option.code}>{option.label}</option>)}
                    </select>
                  </span>
                </label>
              </div>
              <label className="dshx-field dshx-provider-bar">
                <span className="dshx-field-label">{t('provider.label')}</span>
                <span className="dshx-select-shell">
                  <select
                    className="dshx-select dshx-provider-select"
                    aria-label={t('provider.label')}
                    value={selectedRouteId}
                    onChange={(event) => { changeRoute(event.target.value) }}
                  >
                    <optgroup label={t('provider.webGroup')}>
                      {catalog.webProviders.map(provider => (
                        <option key={provider.id} value={`web:${provider.id}`}>{provider.name}</option>
                      ))}
                    </optgroup>
                    {catalog.llmProviders.map(provider => (
                      <optgroup key={provider.id} label={`${t('provider.modelGroup')} · ${provider.name}`}>
                        {provider.models.map(model => (
                          <option key={`${provider.id}/${model.id}`} value={llmRouteId(provider.id, model.id)}>
                            {model.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </span>
                {aiSelected && <span className="dshx-ai-chip"><SparkIcon size={11} />AI</span>}
                {catalogState === 'loading' && <span className="dshx-status">{t('provider.loading')}</span>}
              </label>
            </div>

            {errorCode !== null && (
              <div className="dshx-error" role="alert">
                <span className="dshx-error-icon"><ClearIcon size={15} /></span>
                <div className="dshx-error-copy">
                  <div className="dshx-error-title">{t('error.label')}</div>
                  <div className="dshx-error-body">{t(errorCopy ?? 'error.generic')}</div>
                </div>
                {canTranslate && (
                  <button type="button" className="dshx-ghost-button dshx-focus-only" onClick={() => { void startTranslation() }}>
                    {t('action.retry')}
                  </button>
                )}
              </div>
            )}

            {catalogState === 'error' && errorCode === null && (
              <div className="dshx-status dshx-catalog-error" role="status">
                {t('error.catalog')}
              </div>
            )}

            <div className="dshx-editor-grid">
              <article className="dshx-pane">
                <div className="dshx-pane-head">
                  <span className="dshx-pane-title">
                    <span className="dshx-live-dot" aria-hidden="true" />
                    {t('source.label')}
                  </span>
                  <div className="dshx-pane-actions">
                    <button
                      type="button"
                      className="dshx-tiny-button dshx-focus-only"
                      aria-label={t('action.clear')}
                      title={t('action.clear')}
                      onClick={clearEditor}
                      disabled={source === '' && translation === ''}
                    >
                      <ClearIcon size={13} />
                      {t('action.clear')}
                    </button>
                  </div>
                </div>
                <textarea
                  ref={sourceRef}
                  className="dshx-textarea"
                  aria-label={t('aria.source')}
                  placeholder={t('source.placeholder')}
                  value={source}
                  spellCheck
                  onChange={(event) => {
                    setSource(event.target.value)
                    setErrorCode(null)
                    if (state !== 'working') setState('idle')
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault()
                      void startTranslation()
                    }
                  }}
                />
                <div className="dshx-pane-foot">
                  <div className="dshx-metrics">
                    <span>{t('count.characters', { count: source.length })}</span>
                    {tooLong && <span className="dshx-status" data-tone="error">{t('count.tooLong', { max: catalog.maxTotalChars })}</span>}
                  </div>
                  {isWorking ? (
                    <button type="button" className="dshx-secondary-button dshx-focus-only" onClick={cancelTranslation}>
                      <ClearIcon size={12} />
                      {t('action.cancel')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="dshx-primary-button dshx-focus-only"
                      disabled={!canTranslate}
                      title={`${t('shortcut.translate')} · ${isMac() ? '⌘↵' : 'Ctrl↵'}`}
                      onClick={() => { void startTranslation() }}
                    >
                      <TranslationIcon size={14} />
                      {t('action.translate')}
                      <span className="dshx-shortcut">{isMac() ? '⌘↵' : 'Ctrl↵'}</span>
                    </button>
                  )}
                </div>
              </article>

              <article className="dshx-pane">
                <div className="dshx-pane-head">
                  <span className="dshx-pane-title">
                    {aiSelected ? <SparkIcon size={13} /> : <TranslationIcon size={13} />}
                    {t('output.label')}
                  </span>
                  <div className="dshx-pane-actions">
                    <button
                      type="button"
                      className="dshx-tiny-button dshx-focus-only"
                      aria-label={t('action.copy')}
                      title={t('action.copy')}
                      disabled={translation === ''}
                      onClick={() => { void copyTranslation() }}
                    >
                      {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                      {copied ? t('action.copied') : t('action.copy')}
                    </button>
                  </div>
                </div>
                {translation === '' ? (
                  <div className="dshx-output-scroll">
                    <div className="dshx-output-empty">
                      <div className="dshx-language-art" aria-hidden="true">
                        <span className="dshx-art-glyph">A</span>
                        <span className="dshx-art-glyph">文</span>
                      </div>
                      <p className="dshx-empty-title">{t('empty.title')}</p>
                      <p className="dshx-empty-body">{isWorking ? t('status.translating') : t('output.hint')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="dshx-output-scroll" tabIndex={0} aria-label={t('aria.output')}>
                    <pre className="dshx-output-text">{translation}</pre>
                  </div>
                )}
                <div className="dshx-pane-foot">
                  <span className="dshx-status" data-tone={statusTone} role="status" aria-live="polite">
                    {statusText}
                  </span>
                  {aiSelected && <span className="dshx-ai-chip"><SparkIcon size={11} />{selectedRoute.label}</span>}
                </div>
              </article>
            </div>
          </div>

          {historyOpen && (
            <aside className="dshx-history" aria-label={t('aria.history')}>
              <div className="dshx-history-head">
                <div className="dshx-history-title-row">
                  <h2 className="dshx-history-title">{t('history.title')}</h2>
                  <span className="dshx-history-count">{history.length}</span>
                </div>
                <div className="dshx-history-tools">
                  <button
                    type="button"
                    className="dshx-icon-button dshx-focus-only"
                    aria-label={t('history.clear')}
                    title={t('history.clear')}
                    disabled={history.length === 0}
                    onClick={() => { setConfirmClear(true) }}
                  >
                    <TrashIcon size={15} />
                  </button>
                  <button
                    type="button"
                    className="dshx-icon-button dshx-focus-only"
                    aria-label={t('history.close')}
                    title={t('history.close')}
                    onClick={() => { setHistoryOpen(false) }}
                  >
                    <ClearIcon size={14} />
                  </button>
                </div>
              </div>
              {confirmClear && (
                <div className="dshx-history-foot dshx-confirm-row">
                  <span className="dshx-confirm-label">{t('history.confirm')}</span>
                  <button
                    type="button"
                    className="dshx-ghost-button dshx-focus-only"
                    onClick={() => {
                      setHistory([])
                      setConfirmClear(false)
                    }}
                  >
                    {t('history.clear')}
                  </button>
                  <button type="button" className="dshx-ghost-button dshx-focus-only" onClick={() => { setConfirmClear(false) }}>
                    {t('history.cancelClear')}
                  </button>
                </div>
              )}
              {history.length === 0 ? (
                <div className="dshx-history-empty">
                  <span className="dshx-history-empty-icon"><HistoryIcon size={19} /></span>
                  <p className="dshx-history-empty-title">{t('history.empty')}</p>
                  <p className="dshx-history-empty-body">{t('history.emptyHint')}</p>
                </div>
              ) : (
                <ul className="dshx-history-list" aria-label={t('aria.historyList')}>
                  {history.map(entry => (
                    <li key={entry.id} className="dshx-history-item">
                      <button
                        type="button"
                        className="dshx-history-load dshx-focus-only"
                        aria-label={t('history.load')}
                        onClick={() => { loadHistoryEntry(entry) }}
                      >
                        <span className="dshx-history-meta">
                          <span className="dshx-history-direction">
                            {entry.sourceLanguage === 'auto' ? t('language.auto') : languageName(entry.sourceLanguage, activeLocale)}
                            <span aria-hidden="true">→</span>
                            {languageName(entry.targetLanguage, activeLocale)}
                          </span>
                          <time dateTime={new Date(entry.createdAt).toISOString()}>
                            {historyTime(entry.createdAt, activeLocale)}
                          </time>
                        </span>
                        <span className="dshx-history-source">{entry.source}</span>
                        <span className="dshx-history-result">{entry.translation}</span>
                      </button>
                      <button
                        type="button"
                        className="dshx-history-delete dshx-focus-only"
                        aria-label={t('history.delete')}
                        title={t('history.delete')}
                        onClick={() => {
                          setHistory(current => current.filter(item => item.id !== entry.id))
                        }}
                      >
                        <ClearIcon size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="dshx-history-foot">
                <div className="dshx-history-note">
                  <ShieldIcon size={12} />
                  <span>{t('history.localOnly')}</span>
                </div>
              </div>
            </aside>
          )}
        </div>

        <div className="dshx-privacy">
          <ShieldIcon size={11} />
          <span>{t('privacy')}</span>
        </div>
      </section>
    </>
  )
}

function flattenRoutes(catalog: RouteCatalog): FlatRoute[] {
  const web = catalog.webProviders.map(provider => ({
    id: `web:${provider.id}`,
    label: provider.name,
    providerName: provider.name,
    route: { kind: 'web' as const, provider: provider.id },
  }))
  const models = catalog.llmProviders.flatMap(provider => provider.models.map(model => ({
    id: llmRouteId(provider.id, model.id),
    label: `${model.name} · ${provider.name}`,
    providerName: provider.name,
    route: { kind: 'llm' as const, provider: provider.id, model: model.id },
  })))
  return [...web, ...models]
}

function llmRouteId(provider: string, model: string): string {
  return `llm:${encodeURIComponent(provider)}:${encodeURIComponent(model)}`
}

function fragmentWhitespace(fragment: string): { leading: string, core: string, trailing: string } {
  const leading = fragment.match(/^\s*/u)?.[0] ?? ''
  const trailing = fragment.match(/\s*$/u)?.[0] ?? ''
  const coreEnd = Math.max(leading.length, fragment.length - trailing.length)
  return {
    leading,
    core: fragment.slice(leading.length, coreEnd),
    trailing: fragment.slice(coreEnd),
  }
}

function languageName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'language' }).of(code) ?? code
  } catch {
    return code
  }
}

function historyTime(value: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return new Date(value).toLocaleString()
  }
}

function errorKey(code: string): TranslateKey {
  switch (code) {
    case 'NETWORK_ERROR': return 'error.network'
    case 'INVALID_REQUEST':
    case 'INVALID_ROUTE': return 'error.invalidRequest'
    case 'REQUEST_TOO_LARGE':
    case 'TEXT_TOO_LARGE': return 'error.tooLarge'
    case 'INVALID_LANGUAGE': return 'error.invalidLanguage'
    case 'WEB_PROVIDER_REJECTED': return 'error.webRejected'
    case 'WEB_TIMEOUT': return 'error.webTimeout'
    case 'WEB_REQUEST_FAILED':
    case 'WEB_INVALID_RESPONSE':
    case 'WEB_RESPONSE_TOO_LARGE': return 'error.webFailed'
    case 'LLM_UNAVAILABLE':
    case 'LLM_MODEL_UNAVAILABLE': return 'error.llmUnavailable'
    case 'LLM_TIMEOUT': return 'error.llmTimeout'
    case 'LLM_REQUEST_FAILED':
    case 'LLM_INVALID_RESPONSE':
    case 'LLM_OUTPUT_TRUNCATED': return 'error.llmFailed'
    case 'EMPTY_TRANSLATION': return 'error.empty'
    case 'HTTP_429': return 'error.rateLimit'
    default: return 'error.generic'
  }
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard !== undefined) {
    await navigator.clipboard.writeText(value)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Clipboard write failed')
}

function isMac(): boolean {
  return /Mac|iPhone|iPad/.test(navigator.platform)
}
