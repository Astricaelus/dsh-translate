# Translate for DeepSeek Harness

A focused translation workspace for [DeepSeek Harness](https://deepseek-harness.github.io/deepseek-harness/en/develop/basic/) with a native entry in the left sidebar.

The page provides:

- Side-by-side source and translation editors with a language picker, automatic source detection, and language swap.
- Bing and Google web translation out of the box, with no additional account, key, or endpoint configuration.
- Optional translation through any text-capable model already registered in the Harness LLM catalog.
- Long-text chunking at paragraph, line, sentence, or whitespace boundaries, with live part-by-part progress.
- Browser-local translation history with reload, delete, and bulk-clear controls.
- English and Simplified Chinese UI copy, dark/light theme tokens, keyboard operation, and a responsive layout.

## Requirements

- DeepSeek Harness `0.2.1-rc.5` or newer.
- Node.js 20 or newer on the Harness host.
- A network path from the Harness host to Microsoft's or Google's web translation endpoint when using a web provider.

The plugin is self-contained. It has no runtime npm dependencies and does not require another DSH plugin.

## Install

In DeepSeek Harness, open **Plugins**, choose **Add plugin**, and paste:

```text
https://github.com/Astricaelus/dsh-translate
```

Confirm the installation and open **Translate** from the left sidebar.

For local development, point **Add plugin** at this directory instead:

```text
/absolute/path/to/dsh-translate
```

## Providers

### Web translation

Bing and Google are fixed, anonymous web endpoints. They need no API key and send the source text in a POST body. These endpoints have no third-party API availability guarantee; a rejection or timeout is shown in the page without automatic fallback to another provider.

### Configured models

When the running Harness profile has an LLM service and at least one model catalog, the plugin offers those model routes in the same provider menu. Requests go through `ctx.llm`, so existing provider credentials, proxy policy, and model configuration are reused. The selected text is sent only to that route.

Web translation is the default so that opening the page never starts a billed model request. Model translation is an explicit choice and is billed according to the configured provider.

## Privacy and state

- Source text is sent only to the provider selected for the current translation.
- Translation history is stored in the current browser's `localStorage` under `dsh.translate.history.v1`. It is not written to a Harness Session, synchronized, uploaded, or exported.
- Settings are stored under `dsh.translate.preferences.v1` in the same browser.
- The host API is registered on Harness's authenticated connection channel. It is not an unauthenticated public web route.
- Provider failures are surfaced as classified messages without source text or response bodies.

## How it works

The bundle has two halves:

1. `index.js` registers two authenticated exact Fetch routes through `ctx.connection.fetch`: a provider catalog read and a translation request.
2. `client.js` registers a keyed `main` panel and a matching `sidebar.panellist` item. Clicking the sidebar item selects the panel through Harness's native layout service.

The browser splits long text under the host-advertised character limit. It sends each fragment to the selected route and joins the translated fragments in order. Web providers use fixed Microsoft/Google request formats; model providers call `ctx.llm.stream()` with a translation-only system prompt.

## Development

```sh
npm install
npm run check
```

`npm run build` regenerates `client.js` from `src/client` with the Harness client-module handoff. The generated client is committed so installation from Git does not require a build step.

The local checks cover:

- TypeScript checking for the browser half.
- Host syntax and the Harness client-module registration shape.
- Lossless long-text chunking.
- Provider request/response parsing and language normalization.
- The authenticated route wiring with a fake connection service.

## Known limitations

- Web providers can rate-limit or change their private response formats.
- Web translation is optimized for general prose; model translation is the better choice for code-heavy or terminology-sensitive material.
- A fragment is sent as a whole to its provider. Translation is chunked, not token-streamed, so partial text appears after each completed fragment rather than token by token.
- History is intentionally browser-local and is not shared across browsers or machines.
- Very long source-plus-result pairs above 20,000 characters are shown but not added to history.

## License

MIT
