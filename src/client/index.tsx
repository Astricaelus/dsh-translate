import type { TranslatePanelProps } from './types.ts'
import { TranslatePanel } from './TranslatePanel.tsx'
import { en, zh } from './locales.ts'
import { TranslationIcon } from './icons.tsx'

const NS = 'dshTranslate'
const PANEL_ID = 'translate'

export const name = 'dsh-translate-client'
export const inject = ['slots', 'locale']

export function apply(ctx: any): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-translate: dictionaries')
  const t = ctx.locale.bind(NS)

  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: PANEL_ID,
    locale: NS,
  }, TranslatePanel))

  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 5,
    locale: NS,
    label: () => t('panel'),
  }, function TranslateSidebarIcon({ size }: { size: number }) {
    return <TranslationIcon size={size} />
  }))
}

export type { TranslatePanelProps }
