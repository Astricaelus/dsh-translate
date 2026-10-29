export const panelStyles = String.raw`
.dshx-root {
  --dshx-accent: var(--dsw-alias-state-business-primary, #4d6bfe);
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  background:
    radial-gradient(circle at 8% -10%, color-mix(in srgb, var(--dshx-accent) 10%, transparent), transparent 34%),
    var(--dsw-alias-bg-base);
  font-size: 14px;
  line-height: 1.55;
}

.dshx-root *,
.dshx-root *::before,
.dshx-root *::after {
  box-sizing: border-box;
}

.dshx-root button,
.dshx-root textarea,
.dshx-root select {
  font: inherit;
}

.dshx-root button {
  color: inherit;
}

.dshx-header {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 76px;
  padding: 18px clamp(20px, 3.4vw, 44px);
  border-bottom: 1px solid var(--dsw-alias-border-l2);
}

html[data-platform='darwin'] .dshx-header {
  padding-top: calc(18px + var(--dsh-frame-top-clearance, 0px));
}

.dshx-identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 13px;
}

.dshx-mark {
  display: grid;
  flex: none;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 12px;
  color: #fff;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--dshx-accent) 82%, white 18%), var(--dshx-accent));
  box-shadow: 0 8px 22px color-mix(in srgb, var(--dshx-accent) 25%, transparent);
}

.dshx-titles {
  min-width: 0;
}

.dshx-title {
  margin: 0;
  overflow: hidden;
  font-size: 20px;
  font-weight: 560;
  line-height: 28px;
  letter-spacing: -0.015em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dshx-subtitle {
  margin: 1px 0 0;
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12.5px;
  line-height: 19px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dshx-header-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
}

.dshx-icon-button,
.dshx-ghost-button,
.dshx-secondary-button,
.dshx-primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color .16s ease,
    border-color .16s ease,
    color .16s ease,
    opacity .16s ease,
    transform .16s ease;
}

.dshx-icon-button {
  position: relative;
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 10px;
  color: var(--dsw-alias-label-secondary);
  background: transparent;
}

.dshx-icon-button:hover {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}

.dshx-icon-button:disabled,
.dshx-tiny-button:disabled {
  cursor: default;
  opacity: .38;
}

.dshx-icon-button[aria-pressed='true'] {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-active);
}

.dshx-count-badge {
  position: absolute;
  top: 1px;
  right: 0;
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  border: 2px solid var(--dsw-alias-bg-base);
  border-radius: 8px;
  color: var(--dsw-alias-label-primary-inverted, #fff);
  background: var(--dshx-accent);
  font-size: 9px;
  font-weight: 650;
  line-height: 11px;
  text-align: center;
}

.dshx-workspace {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 304px;
  flex: 1;
  gap: 16px;
  min-height: 0;
  padding: 18px clamp(20px, 3.4vw, 44px) 20px;
}

.dshx-workspace[data-history='closed'] {
  grid-template-columns: minmax(0, 1fr);
}

.dshx-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.dshx-control-bar {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px 18px;
  margin-bottom: 13px;
}

.dshx-language-bar {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: flex-end;
  gap: 8px;
}

.dshx-field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
}

.dshx-field-label {
  padding-left: 2px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 10.5px;
  font-weight: 560;
  line-height: 14px;
  letter-spacing: .045em;
  text-transform: uppercase;
}

.dshx-select-shell {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
}

.dshx-select {
  min-width: 0;
  height: 36px;
  padding: 0 34px 0 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  outline: none;
  color: var(--dsw-alias-label-primary);
  background-color: var(--dsw-alias-bg-layer-1);
  appearance: none;
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease;
}

.dshx-select:hover {
  border-color: var(--dsw-alias-border-l3);
  background-color: var(--dsw-alias-bg-layer-2);
}

.dshx-select:focus-visible {
  border-color: var(--dshx-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dshx-accent) 16%, transparent);
}

.dshx-select-shell::after {
  position: absolute;
  right: 13px;
  width: 6px;
  height: 6px;
  border-right: 1.5px solid var(--dsw-alias-label-tertiary);
  border-bottom: 1.5px solid var(--dsw-alias-label-tertiary);
  content: '';
  pointer-events: none;
  transform: translateY(-2px) rotate(45deg);
}

.dshx-source-language {
  width: clamp(130px, 15vw, 172px);
}

.dshx-target-language {
  width: clamp(140px, 16vw, 188px);
}

.dshx-swap {
  flex: none;
  width: 34px;
  height: 36px;
  margin-bottom: 0;
  border: 1px solid transparent;
  border-radius: 10px;
  color: var(--dsw-alias-label-tertiary);
  background: transparent;
}

.dshx-swap:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}

.dshx-swap:disabled {
  cursor: default;
  opacity: .35;
}

.dshx-provider-bar {
  display: flex;
  align-items: center;
  gap: 9px;
}

.dshx-provider-select {
  width: clamp(190px, 23vw, 290px);
}

.dshx-ai-chip {
  display: inline-flex;
  height: 22px;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border: 1px solid color-mix(in srgb, var(--dshx-accent) 26%, transparent);
  border-radius: 11px;
  color: var(--dshx-accent);
  background: color-mix(in srgb, var(--dshx-accent) 7%, transparent);
  font-size: 10px;
  font-weight: 650;
  letter-spacing: .03em;
  max-width: 185px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dshx-editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  flex: 1;
  gap: 13px;
  min-height: 0;
}

.dshx-pane {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 18px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 78%, var(--dsw-alias-bg-base));
  box-shadow: 0 1px 0 color-mix(in srgb, var(--dsw-alias-label-primary) 2%, transparent);
  transition: border-color .16s ease, box-shadow .16s ease;
}

.dshx-pane:focus-within {
  border-color: color-mix(in srgb, var(--dshx-accent) 58%, var(--dsw-alias-border-l2));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dshx-accent) 8%, transparent);
}

.dshx-pane-head {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 51px;
  padding: 0 16px 0 19px;
  border-bottom: 1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 72%, transparent);
}

.dshx-pane-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 620;
  letter-spacing: .015em;
}

.dshx-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--dsw-alias-state-success-primary, #1aa36f);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-state-success-primary, #1aa36f) 12%, transparent);
}

.dshx-pane-actions {
  display: flex;
  align-items: center;
  gap: 3px;
}

.dshx-tiny-button {
  display: inline-flex;
  height: 29px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 9px;
  border: 0;
  border-radius: 8px;
  color: var(--dsw-alias-label-tertiary);
  background: transparent;
  font-size: 11.5px;
  cursor: pointer;
}

.dshx-tiny-button:hover {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}

.dshx-textarea {
  display: block;
  flex: 1;
  width: 100%;
  min-height: 210px;
  padding: 22px 22px 14px;
  resize: none;
  border: 0;
  outline: 0;
  color: var(--dsw-alias-label-primary);
  background: transparent;
  font-size: 15.5px;
  line-height: 1.72;
  scrollbar-gutter: stable;
}

.dshx-textarea::placeholder {
  color: var(--dsw-alias-label-caption);
}

.dshx-output-scroll {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 22px 22px 14px;
  scrollbar-gutter: stable;
}

.dshx-output-text {
  width: 100%;
  margin: 0;
  color: var(--dsw-alias-label-primary);
  font-family: inherit;
  font-size: 15.5px;
  line-height: 1.72;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.dshx-output-empty {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
  color: var(--dsw-alias-label-tertiary);
  text-align: center;
}

.dshx-language-art {
  position: relative;
  width: 108px;
  height: 82px;
  margin-bottom: 18px;
}

.dshx-language-art::before,
.dshx-language-art::after {
  position: absolute;
  border: 1px solid color-mix(in srgb, var(--dshx-accent) 35%, var(--dsw-alias-border-l2));
  border-radius: 17px;
  content: '';
}

.dshx-language-art::before {
  inset: 4px 23px 18px 3px;
  background: color-mix(in srgb, var(--dshx-accent) 7%, transparent);
  transform: rotate(-4deg);
}

.dshx-language-art::after {
  inset: 19px 2px 4px 25px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 88%, transparent);
  transform: rotate(4deg);
}

.dshx-art-glyph {
  position: absolute;
  z-index: 1;
  color: var(--dshx-accent);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 25px;
  font-weight: 600;
  line-height: 1;
}

.dshx-art-glyph:first-child {
  top: 23px;
  left: 24px;
}

.dshx-art-glyph:last-child {
  right: 23px;
  bottom: 25px;
  opacity: .72;
}

.dshx-empty-title {
  margin: 0 0 3px;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  font-weight: 560;
}

.dshx-empty-body {
  max-width: 230px;
  margin: 0;
  color: var(--dsw-alias-label-caption);
  font-size: 12px;
  line-height: 1.55;
}

.dshx-pane-foot {
  display: flex;
  flex: none;
  min-height: 48px;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 9px 14px 10px 19px;
}

.dshx-metrics {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 9px;
  color: var(--dsw-alias-label-caption);
  font-size: 11px;
  line-height: 17px;
}

.dshx-status {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 5px;
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dshx-status[data-tone='stale'] {
  color: var(--dsw-alias-state-warn-label, #b7791f);
}

.dshx-status[data-tone='error'] {
  color: var(--dsw-alias-label-error, #e5484d);
}

.dshx-primary-button {
  gap: 7px;
  height: 35px;
  padding: 0 16px;
  border-radius: 18px;
  color: var(--dsw-alias-label-primary-inverted, #fff);
  background: var(--dshx-accent);
  box-shadow: 0 5px 14px color-mix(in srgb, var(--dshx-accent) 18%, transparent);
  font-size: 12.5px;
  font-weight: 570;
}

.dshx-primary-button:hover:not(:disabled) {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.dshx-primary-button:active:not(:disabled) {
  transform: translateY(0);
}

.dshx-primary-button:disabled {
  cursor: default;
  opacity: .48;
  box-shadow: none;
}

.dshx-secondary-button {
  height: 32px;
  gap: 6px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 16px;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-layer-1);
  font-size: 11.5px;
}

.dshx-secondary-button:hover {
  border-color: var(--dsw-alias-border-l3);
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}

.dshx-ghost-button {
  height: 30px;
  gap: 5px;
  padding: 0 9px;
  border-radius: 8px;
  color: var(--dsw-alias-label-tertiary);
  background: transparent;
  font-size: 11.5px;
}

.dshx-ghost-button:hover {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}

.dshx-shortcut {
  display: inline-flex;
  height: 18px;
  align-items: center;
  padding: 0 5px;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-radius: 5px;
  color: currentColor;
  font-size: 9.5px;
  line-height: 1;
  opacity: .7;
}

.dshx-error {
  display: flex;
  flex: none;
  align-items: flex-start;
  gap: 9px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-label-error, #e5484d) 24%, var(--dsw-alias-border-l2));
  border-radius: 11px;
  color: var(--dsw-alias-label-error, #e5484d);
  background: color-mix(in srgb, var(--dsw-alias-label-error, #e5484d) 7%, transparent);
  font-size: 12px;
  line-height: 18px;
}

.dshx-error-icon {
  flex: none;
  margin-top: 1px;
}

.dshx-error-copy {
  min-width: 0;
  flex: 1;
}

.dshx-error-title {
  font-weight: 600;
}

.dshx-error-body {
  margin-top: 1px;
  color: color-mix(in srgb, var(--dsw-alias-label-error, #e5484d) 78%, var(--dsw-alias-label-secondary));
}

.dshx-catalog-error {
  margin-bottom: 10px;
}

.dshx-history {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 18px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 76%, var(--dsw-alias-bg-base));
}

.dshx-history-head {
  display: flex;
  flex: none;
  min-height: 57px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 10px 0 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 72%, transparent);
}

.dshx-history-title-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
}

.dshx-history-title {
  margin: 0;
  font-size: 13px;
  font-weight: 620;
}

.dshx-history-count {
  min-width: 20px;
  height: 19px;
  padding: 0 6px;
  border-radius: 10px;
  color: var(--dsw-alias-label-tertiary);
  background: var(--dsw-alias-interactive-bg-hover);
  font-size: 10px;
  line-height: 19px;
  text-align: center;
}

.dshx-history-tools {
  display: flex;
  align-items: center;
  gap: 2px;
}

.dshx-history-list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 6px;
  overflow: auto;
  list-style: none;
  scrollbar-gutter: stable;
}

.dshx-history-item {
  position: relative;
  border-radius: 11px;
}

.dshx-history-item + .dshx-history-item {
  margin-top: 3px;
}

.dshx-history-load {
  display: block;
  width: 100%;
  padding: 10px 34px 10px 10px;
  border: 0;
  border-radius: 11px;
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.dshx-history-item:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}

.dshx-history-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
  color: var(--dsw-alias-label-caption);
  font-size: 9.5px;
  line-height: 14px;
}

.dshx-history-direction {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dshx-history-source,
.dshx-history-result {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  overflow-wrap: anywhere;
}

.dshx-history-source {
  margin-top: 5px;
  -webkit-line-clamp: 2;
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  line-height: 17px;
}

.dshx-history-result {
  margin-top: 2px;
  -webkit-line-clamp: 2;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 16px;
}

.dshx-history-delete {
  position: absolute;
  top: 6px;
  right: 5px;
  display: grid;
  width: 25px;
  height: 25px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 7px;
  color: var(--dsw-alias-label-caption);
  background: transparent;
  cursor: pointer;
  opacity: 0;
  transition: opacity .12s ease, background-color .12s ease, color .12s ease;
}

.dshx-history-item:hover .dshx-history-delete,
.dshx-history-delete:focus-visible {
  opacity: 1;
}

.dshx-history-delete:hover {
  color: var(--dsw-alias-label-error, #e5484d);
  background: color-mix(in srgb, var(--dsw-alias-label-error, #e5484d) 9%, transparent);
}

.dshx-history-empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 26px;
  color: var(--dsw-alias-label-tertiary);
  text-align: center;
}

.dshx-history-empty-icon {
  display: grid;
  width: 42px;
  height: 42px;
  margin-bottom: 12px;
  place-items: center;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 14px;
  background: var(--dsw-alias-interactive-bg-hover);
}

.dshx-history-empty-title {
  margin: 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 560;
}

.dshx-history-empty-body {
  max-width: 190px;
  margin: 3px 0 0;
  color: var(--dsw-alias-label-caption);
  font-size: 10.5px;
  line-height: 16px;
}

.dshx-history-foot {
  flex: none;
  padding: 9px 14px 12px;
  border-top: 1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 65%, transparent);
}

.dshx-history-note,
.dshx-privacy {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: var(--dsw-alias-label-caption);
  font-size: 9.5px;
  line-height: 14px;
}

.dshx-history-note svg,
.dshx-privacy svg {
  flex: none;
  margin-top: 1px;
}

.dshx-privacy {
  flex: none;
  align-items: center;
  justify-content: center;
  padding: 0 20px 10px;
  color: var(--dsw-alias-label-caption);
  font-size: 9.5px;
}

.dshx-confirm-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
}

.dshx-confirm-label {
  margin-right: auto;
  color: var(--dsw-alias-label-tertiary);
  font-size: 9.5px;
}

.dshx-focus-only:focus-visible {
  outline: 2px solid var(--dshx-accent);
  outline-offset: 2px;
}

.dshx-spin {
  animation: dshx-spin .85s linear infinite;
}

@keyframes dshx-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1120px) {
  .dshx-workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .dshx-history {
    position: absolute;
    z-index: 5;
    top: 18px;
    right: clamp(20px, 3.4vw, 44px);
    bottom: 20px;
    width: min(342px, calc(100vw - 48px));
    box-shadow: 0 18px 55px color-mix(in srgb, #000 24%, transparent);
  }
}

@media (max-width: 780px) {
  .dshx-header {
    min-height: 68px;
    padding: 14px 18px;
  }

  .dshx-subtitle {
    display: none;
  }

  .dshx-workspace {
    padding: 14px 18px 16px;
  }

  .dshx-history {
    top: 14px;
    right: 18px;
    bottom: 16px;
  }

  .dshx-editor-grid {
    grid-template-columns: minmax(0, 1fr);
    flex: none;
  }

  .dshx-pane {
    min-height: 340px;
  }

  .dshx-root {
    overflow: auto;
  }

  .dshx-control-bar {
    align-items: stretch;
  }

  .dshx-language-bar,
  .dshx-provider-bar {
    width: 100%;
  }

  .dshx-source-language,
  .dshx-target-language,
  .dshx-provider-select {
    width: 100%;
  }

  .dshx-field {
    flex: 1;
  }

  .dshx-provider-bar {
    align-items: flex-end;
  }

  .dshx-privacy {
    display: none;
  }
}

@media (max-width: 470px) {
  .dshx-header-actions {
    gap: 2px;
  }

  .dshx-mark {
    width: 34px;
    height: 34px;
  }

  .dshx-title {
    font-size: 18px;
  }

  .dshx-control-bar {
    gap: 10px;
  }

  .dshx-pane-head {
    padding-left: 15px;
  }

  .dshx-source-language,
  .dshx-target-language {
    width: 100%;
  }

  .dshx-shortcut {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dshx-root *,
  .dshx-root *::before,
  .dshx-root *::after {
    scroll-behavior: auto !important;
    transition-duration: 0s !important;
    animation-duration: 0s !important;
    animation-iteration-count: 1 !important;
  }
}
`
