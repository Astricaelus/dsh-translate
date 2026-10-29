import type { HistoryEntry, Preferences } from './types.ts'

const PREFS_KEY = 'dsh.translate.preferences.v1'
const HISTORY_KEY = 'dsh.translate.history.v1'
const HISTORY_LIMIT = 60

export function loadPreferences(fallbackTarget: string): Preferences {
  const fallback: Preferences = {
    targetLanguage: fallbackTarget,
    sourceLanguage: 'auto',
    routeId: 'web:bing',
  }
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw === null) return fallback
    const value = JSON.parse(raw) as Partial<Preferences>
    return {
      targetLanguage: typeof value.targetLanguage === 'string' ? value.targetLanguage : fallback.targetLanguage,
      sourceLanguage: typeof value.sourceLanguage === 'string' ? value.sourceLanguage : 'auto',
      routeId: typeof value.routeId === 'string' ? value.routeId : 'web:bing',
    }
  } catch {
    return fallback
  }
}

export function savePreferences(value: Preferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(value))
  } catch {
    // Browser storage is an enhancement; translation itself remains available.
  }
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (raw === null) return []
    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) return []
    return value.filter(isHistoryEntry).slice(0, HISTORY_LIMIT)
  } catch {
    return []
  }
}

export function saveHistory(entries: readonly HistoryEntry[]): HistoryEntry[] {
  const retained = entries.slice(0, HISTORY_LIMIT)
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(retained))
  } catch {
    // A full or disabled localStorage never turns a successful translation into a failure.
  }
  return retained
}

export function createHistoryEntry(value: Omit<HistoryEntry, 'id' | 'createdAt'>): HistoryEntry {
  return {
    ...value,
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
  }
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return typeof entry.id === 'string'
    && typeof entry.source === 'string'
    && typeof entry.translation === 'string'
    && typeof entry.sourceLanguage === 'string'
    && typeof entry.targetLanguage === 'string'
    && typeof entry.routeId === 'string'
    && typeof entry.routeLabel === 'string'
    && typeof entry.createdAt === 'number'
}
