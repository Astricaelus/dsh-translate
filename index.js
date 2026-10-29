/** Host entry for the Translate bundle. */
import { registerRoutes } from './lib/server.js'

export const name = 'dsh-translate'
export const inject = []

/**
 * Register the authenticated browser API when this profile has a Web
 * connection. The optional connection keeps the bundle inert in headless
 * profiles instead of failing their composition.
 * @param {any} ctx Cordis context
 */
export function apply(ctx) {
  ctx.inject(['connection'], (web) => {
    registerRoutes(web)
  })
}
