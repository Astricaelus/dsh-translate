import assert from 'node:assert/strict'
import test from 'node:test'
import {
  TranslationFailure,
  languageForProvider,
  parseBingResponse,
  parseGoogleResponse,
  readJsonBody,
  registerRoutes,
  routeCatalog,
  translateRequest,
  translateWeb,
  translateWithLlm,
} from '../lib/server.js'

test('Google and Bing response parsers accept their fixed wire shapes', () => {
  assert.equal(parseGoogleResponse([[['Hello ', '你好'], ['world', '世界']]]), 'Hello world')
  assert.equal(parseBingResponse([{ translations: [{ text: 'Hello world' }] }]), 'Hello world')
  assert.throws(() => parseGoogleResponse([{}]), TranslationFailure)
  assert.throws(() => parseBingResponse({}), TranslationFailure)
})

test('Chinese language tags are normalized per provider', () => {
  assert.equal(languageForProvider('zh-CN', 'google'), 'zh-CN')
  assert.equal(languageForProvider('zh-CN', 'bing'), 'zh-Hans')
  assert.equal(languageForProvider('zh-HK', 'google'), 'zh-TW')
  assert.equal(languageForProvider('zh-HK', 'bing'), 'zh-Hant')
  assert.equal(languageForProvider('de-DE', 'bing'), 'de-DE')
  assert.equal(languageForProvider('auto', 'google'), 'auto')
})

test('web translation sends only the fixed provider request shape', async () => {
  const original = globalThis.fetch
  let seen
  globalThis.fetch = async (url, init) => {
    seen = { url: String(url), init }
    return Response.json([[['Hallo', 'Hello']]])
  }
  try {
    const result = await translateWeb({
      provider: 'google',
      text: 'Hello',
      sourceLanguage: 'en',
      targetLanguage: 'de',
      signal: new AbortController().signal,
    })
    assert.equal(result, 'Hallo')
    const url = new URL(seen.url)
    assert.equal(url.origin, 'https://translate.googleapis.com')
    const body = new URLSearchParams(seen.init.body)
    assert.equal(body.get('q'), 'Hello')
    assert.equal(body.get('sl'), 'en')
    assert.equal(body.get('tl'), 'de')
    assert.equal(seen.init.credentials, 'omit')
    assert.equal(seen.init.redirect, 'error')
  } finally {
    globalThis.fetch = original
  }
})

test('configured model translation uses the LLM stream without conversation history', async () => {
  let request
  const llm = {
    stream(options) {
      request = options
      return (async function* () {
        yield { type: 'block-start', index: 0, blockType: 'text' }
        yield { type: 'text-delta', index: 0, text: 'Bon' }
        yield { type: 'text-delta', index: 0, text: 'jour' }
        yield { type: 'block-end', index: 0, block: { type: 'text', text: 'Bonjour' } }
        yield { type: 'finish', reason: { kind: 'stop' } }
      })()
    },
  }
  const ctx = { get: name => name === 'llm' ? llm : undefined }
  const result = await translateWithLlm(ctx, {
    provider: 'deepseek-official',
    model: 'deepseek-flash',
    text: 'Hello',
    sourceLanguage: 'en',
    targetLanguage: 'fr',
    signal: new AbortController().signal,
  })
  assert.equal(result, 'Bonjour')
  assert.equal(request.provider, 'deepseek-official')
  assert.equal(request.model, 'deepseek-flash')
  assert.match(request.system, /Return only the translation/)
  assert.deepEqual(request.messages, [{ role: 'user', content: [{ type: 'text', text: 'Hello' }] }])
  assert.equal(request.sessionId, undefined)
  assert.equal(request.tools, undefined)
})

test('catalog lists web providers and only text-capable LLM descriptors without invoking inference', async () => {
  const llm = {
    listProviders: () => [{ id: 'deepseek-official', name: 'DeepSeek' }],
    listModels: async () => [{ id: 'deepseek-flash', name: 'DeepSeek Flash' }],
  }
  const ctx = { get: name => name === 'llm' ? llm : undefined }
  const catalog = await routeCatalog(ctx, new AbortController().signal)
  assert.deepEqual(catalog.webProviders.map(provider => provider.id), ['bing', 'google'])
  assert.equal(catalog.llmProviders[0].models[0].id, 'deepseek-flash')
})

test('translate requests reject unknown routes and oversized fragments', async () => {
  const ctx = { get: () => undefined }
  await assert.rejects(
    translateRequest(ctx, { text: 'hello', targetLanguage: 'de', route: { kind: 'web', provider: 'evil' } }, new AbortController().signal),
    error => error instanceof TranslationFailure && error.code === 'UNSUPPORTED_PROVIDER',
  )
  await assert.rejects(
    translateRequest(ctx, { text: 'x'.repeat(4001), targetLanguage: 'de', route: { kind: 'web', provider: 'bing' } }, new AbortController().signal),
    error => error instanceof TranslationFailure && error.code === 'TEXT_TOO_LARGE',
  )
})

test('request body intake enforces JSON and a byte cap', async () => {
  assert.deepEqual(await readJsonBody(new Request('http://local/api', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{"text":"hello"}',
  })), { text: 'hello' })
  await assert.rejects(
    readJsonBody(new Request('http://local/api', { method: 'POST', body: 'not-json' })),
    error => error instanceof TranslationFailure && error.code === 'INVALID_REQUEST',
  )
})

test('host registers the two exact authenticated fetch routes', () => {
  const routes = []
  const ctx = {
    get: () => undefined,
    connection: {
      fetch: {
        register(route) {
          routes.push(route)
          return async () => {}
        },
      },
    },
  }
  registerRoutes(ctx)
  assert.deepEqual(routes.map(route => [route.path, route.methods, route.requestBody]), [
    ['/api/dsh-translate/config', ['GET'], 'buffered'],
    ['/api/dsh-translate/translate', ['POST'], 'buffered'],
  ])
})

test('the POST route validates JSON and returns a bounded translation response', async () => {
  const routes = []
  const ctx = {
    get: () => undefined,
    connection: { fetch: { register: route => { routes.push(route) } } },
  }
  registerRoutes(ctx)
  const translateRoute = routes.find(route => route.path === '/api/dsh-translate/translate')
  const original = globalThis.fetch
  globalThis.fetch = async () => Response.json([{ translations: [{ text: '你好，世界。' }] }])
  try {
    const response = await translateRoute.fetch(new Request('http://host/api/dsh-translate/translate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello, world.',
        sourceLanguage: 'en',
        targetLanguage: 'zh-CN',
        route: { kind: 'web', provider: 'bing' },
      }),
    }))
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await response.json(), { translation: '你好，世界。', route: 'web:bing' })
  } finally {
    globalThis.fetch = original
  }
})
