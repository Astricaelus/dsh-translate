/**
 * Split text at natural boundaries while keeping every original character in
 * exactly one fragment. Provider calls receive these fragments in order.
 *
 * @param {string} text source text
 * @param {number} maxChars maximum UTF-16 code units per fragment
 * @returns {string[]} ordered, non-empty fragments
 */
export function splitForTranslation(text, maxChars) {
  if (!Number.isSafeInteger(maxChars) || maxChars < 2) {
    throw new RangeError('maxChars must be an integer of at least 2')
  }
  if (text.length === 0) return []
  if (text.length <= maxChars) return [text]

  const fragments = []
  let start = 0
  while (start < text.length) {
    const hardEnd = Math.min(start + maxChars, text.length)
    if (hardEnd === text.length) {
      fragments.push(text.slice(start))
      break
    }

    const window = text.slice(start, hardEnd)
    const minimum = Math.floor(maxChars * 0.42)
    let cut = -1

    const paragraph = lastMatchEnd(window, /\n[ \t]*\n/g)
    if (paragraph > minimum) cut = paragraph
    if (cut < 0) {
      const line = lastMatchEnd(window, /\n/g)
      if (line > minimum) cut = line
    }
    if (cut < 0) {
      const sentence = lastMatchEnd(window, /[.!?。！？；;](?:["'”’）)\]]*)[ \t]+/g)
      if (sentence > minimum) cut = sentence
    }
    if (cut < 0) {
      const space = lastMatchEnd(window, /[ \t]+/g)
      if (space > minimum) cut = space
    }
    if (cut < 0) cut = maxChars

    // Never consume a surrogate pair separately, including at the hard cap.
    if (cut > 0) {
      const before = text.charCodeAt(start + cut - 1)
      const after = text.charCodeAt(start + cut)
      if (isHighSurrogate(before) && isLowSurrogate(after)) cut -= 1
    }
    if (cut <= 0) cut = maxChars

    fragments.push(text.slice(start, start + cut))
    start += cut
  }
  return fragments
}

/**
 * @param {string} value
 * @param {RegExp} pattern
 * @returns {number} end index of the last match, or -1
 */
function lastMatchEnd(value, pattern) {
  let end = -1
  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? -1
    if (index >= 0) end = index + match[0].length
  }
  return end
}

/** @param {number} code */
function isHighSurrogate(code) {
  return code >= 0xd800 && code <= 0xdbff
}

/** @param {number} code */
function isLowSurrogate(code) {
  return code >= 0xdc00 && code <= 0xdfff
}

/**
 * Validate and normalize a language tag supplied by the browser.
 * @param {string} value
 * @param {boolean} [allowAuto]
 * @returns {string | undefined}
 */
export function validLanguageTag(value, allowAuto = false) {
  if (value === 'auto') return allowAuto ? 'auto' : undefined
  if (typeof value !== 'string' || !/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{2,8})*$/.test(value)) return undefined
  return value
}
