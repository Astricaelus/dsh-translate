import type { TranslateKey } from './locales.ts'

export interface TranslatePanelProps {
  t: (key: TranslateKey, vars?: Record<string, string | number>) => string
}

export interface WebProvider {
  id: 'bing' | 'google'
  name: string
  description?: string
}

export interface LlmModel {
  id: string
  name: string
  description?: string
}

export interface LlmProvider {
  id: string
  name: string
  models: LlmModel[]
}

export interface RouteCatalog {
  maxTextChars: number
  maxTotalChars: number
  webProviders: WebProvider[]
  llmProviders: LlmProvider[]
}

export type TranslationRoute =
  | { kind: 'web'; provider: 'bing' | 'google' }
  | { kind: 'llm'; provider: string; model: string }

export interface HistoryEntry {
  id: string
  source: string
  translation: string
  sourceLanguage: string
  targetLanguage: string
  routeId: string
  routeLabel: string
  createdAt: number
}

export interface Preferences {
  targetLanguage: string
  sourceLanguage: string
  routeId: string
}
