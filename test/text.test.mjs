import assert from 'node:assert/strict'
import test from 'node:test'
import { splitForTranslation, validLanguageTag } from '../src/shared/text.js'

test('short text is one unchanged fragment', () => {
  assert.deepEqual(splitForTranslation('Hello, world!', 4000), ['Hello, world!'])
  assert.deepEqual(splitForTranslation('', 4000), [])
})

test('long text is split at natural boundaries without losing bytes', () => {
  const text = [
    'First paragraph with a complete thought.',
    'Second paragraph stays nearby and is long enough to become its own fragment.',
    '第三段包含中文标点。它也应该在自然边界处结束。',
    'Final paragraph.',
  ].join('\n\n')
  const fragments = splitForTranslation(text, 72)
  assert.equal(fragments.join(''), text)
  assert.ok(fragments.length > 1)
  assert.ok(fragments.every(fragment => fragment.length > 0 && fragment.length <= 72))
  assert.match(fragments[0], /\.\n\n|\.$/)
})

test('hard splits preserve surrogate pairs', () => {
  const text = '😀'.repeat(300) + 'a' + '文'.repeat(300)
  const fragments = splitForTranslation(text, 17)
  assert.equal(fragments.join(''), text)
  assert.ok(fragments.every(fragment => fragment.length <= 17))
  for (const fragment of fragments) {
    assert.doesNotMatch(fragment, /^[\uDC00-\uDFFF]|[\uD800-\uDBFF]$/)
  }
})

test('language tags are strict and auto is only accepted for a source', () => {
  assert.equal(validLanguageTag('zh-CN'), 'zh-CN')
  assert.equal(validLanguageTag('fr'), 'fr')
  assert.equal(validLanguageTag('auto', true), 'auto')
  assert.equal(validLanguageTag('auto', false), undefined)
  assert.equal(validLanguageTag('en\nX-Test: 1'), undefined)
  assert.equal(validLanguageTag(''), undefined)
})
