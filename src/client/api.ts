import type { RouteCatalog, TranslationRoute } from './types.ts'

const API_ROOT = 'api/dsh-translate'

export class ApiFailure extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiFailure'
  }
}

export async function loadCatalog(signal: AbortSignal): Promise<RouteCatalog> {
  return await request<RouteCatalog>(`${API_ROOT}/config`, {
    method: 'GET',
    signal,
  })
}

export async function translateChunk(
  request: {
    text: string
    sourceLanguage: string
    targetLanguage: string
    route: TranslationRoute
  },
  signal: AbortSignal,
): Promise<string> {
  const response = await requestJson<{ translation: string }>(`${API_ROOT}/translate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  })
  return response.translation
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  return await requestJson<T>(path, init)
}

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response
  try {
    const headers = new Headers(init.headers)
    if (!headers.has('accept')) headers.set('accept', 'application/json')
    response = await fetch(path, {
      ...init,
      cache: 'no-store',
      credentials: 'same-origin',
      headers,
    })
  } catch (error) {
    if (init.signal?.aborted) throw error
    throw new ApiFailure('NETWORK_ERROR', 'Could not reach the Harness host', 0)
  }
  let body: unknown
  try {
    body = await response.json()
  } catch {
    body = undefined
  }
  if (!response.ok) {
    const failure = errorBody(body)
    throw new ApiFailure(failure?.code ?? `HTTP_${response.status}`,
      failure?.message ?? `Translation request failed with HTTP ${response.status}`, response.status)
  }
  return body as T
}

function errorBody(value: unknown): { code: string; message: string } | undefined {
  if (typeof value !== 'object' || value === null || !('error' in value)) return undefined
  const error = value.error
  if (typeof error !== 'object' || error === null || !('code' in error) || typeof error.code !== 'string') {
    return undefined
  }
  return {
    code: error.code,
    message: 'message' in error && typeof error.message === 'string' ? error.message : 'Translation failed',
  }
}
