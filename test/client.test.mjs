import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const clientSource = await readFile(new URL('../client.js', import.meta.url), 'utf8')

test('manifest declares a web client and a bundle patch', () => {
  assert.equal(packageJson.dsh.bundle.patch, './cordis.patch.yml')
  assert.equal(packageJson.dsh.client.platform, 'web')
  assert.equal(packageJson.exports['./client'], './client.js')
  assert.match(packageJson.engines.dsh, />=/)
})

test('generated client registers a main panel and left sidebar entry', () => {
  let handoff
  const context = {
    window: {
      __ModuleLoader__: {
        load(value) {
          handoff = value
        },
      },
    },
    console,
    setTimeout,
    clearTimeout,
  }
  vm.runInNewContext(clientSource, context)
  assert.equal(handoff.id, packageJson.name)

  const React = {
    useEffect() {},
    useMemo() {},
    useRef() {},
    useState() {},
  }
  const jsxRuntime = {
    jsx() {},
    jsxs() {},
    Fragment: Symbol('Fragment'),
  }
  const plugin = handoff.factory(specifier => {
    if (specifier === 'react') return React
    if (specifier === 'react/jsx-runtime') return jsxRuntime
    throw new Error(`unexpected client import: ${specifier}`)
  })
  assert.equal(typeof plugin.apply, 'function')

  const dictionaries = []
  const registrations = []
  const ctx = {
    effect(callback) {
      return callback()
    },
    locale: {
      register(namespace, values) {
        dictionaries.push({ namespace, values })
        return () => {}
      },
      bind(namespace) {
        return key => `${namespace}:${key}`
      },
    },
    slots: {
      inject(_slot, callback) {
        return callback()
      },
      register(options, component) {
        registrations.push({ options, component })
        return () => {}
      },
    },
  }
  plugin.apply(ctx)

  assert.deepEqual(Array.from(plugin.inject), ['slots', 'locale'])
  assert.deepEqual(Object.keys(dictionaries[0].values).sort(), ['en', 'zh'])
  const main = registrations.find(entry => entry.options.name === 'main')
  const sidebar = registrations.find(entry => entry.options.name === 'sidebar.panellist')
  assert.equal(main.options.key, 'translate')
  assert.equal(main.options.locale, 'dshTranslate')
  assert.equal(sidebar.options.id, 'translate')
  assert.equal(sidebar.options.order, 5)
  assert.equal(sidebar.options.label(), 'dshTranslate:panel')
  assert.equal(typeof main.component, 'function')
  assert.equal(typeof sidebar.component, 'function')
})
