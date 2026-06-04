# Browser Isolation per Room — Design Spec
Date: 2026-05-10

## Problem

All rooms share one Chromium process via `getBrowser()` singleton. When that
process crashes, disconnects, or gets killed by the OS, every room dies
simultaneously. There is no per-room isolation, no retry on browser launch
failure, and the shared memory footprint grows unbounded as rooms accumulate.

Additionally: `HaxballTokenFetcher` already uses its own isolated
`puppeteer-extra` instance for token generation — so the pattern of one-browser-
per-concern is already established. Extending it to rooms is the natural next
step.

## Goal

Each call to `createPage()` launches its own dedicated Chromium process. A
browser crash kills only the one room it belonged to. Retry on browser launch
failure is isolated to that room's restart cycle.

## Architecture

### New export: `launchRoomBrowser()` in `src/browser.ts`

```typescript
export async function launchRoomBrowser(): Promise<Browser> {
    const proxyUrl = process.env.PROXY_URL;
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled',
            '--disable-infobars',
            ...(proxyUrl ? [`--proxy-server=${proxyUrl}`] : []),
        ],
    });
    return browser;
}
```

No singleton, no `browserInstance` global. Every call returns a fresh browser.

### `getBrowser()` — kept but deprecated

The existing `getBrowser()` singleton is kept for backwards compatibility with
any call sites outside `createPage`. It will not be called from `createPage`
after this change.

### Changes to `createPage()` in `index.ts`

```typescript
// Before:
const browser = await getBrowser();
const page    = await browser.newPage();

// After:
const browser = await launchRoomBrowser();
const page    = await browser.newPage();
```

### Browser lifecycle

The browser is owned by the page's lifecycle:

- `page.on('close')` → existing handler already handles room cleanup.
- Add: `browser.close()` call in `page.on('close')` handler (after room cleanup
  logic, in a `.catch(() => {})` to avoid throwing).
- Also add: `browser.on('disconnected', () => { if (!page.isClosed()) page.close() })`
  so a Chromium crash still triggers the existing close handler.

### Memory impact

~200–300 MB per active room. With 3 rooms: +600–900 MB vs. today's shared
instance. Acceptable trade-off given that each room already uses a full browser
tab, and the isolation prevents cascading failures.

### Retry on browser launch failure

If `launchRoomBrowser()` throws (e.g., Chromium OOM), the error propagates to
`createPage()` caller, which catches it and increments `retryCount` as today.
No special retry loop is needed — the existing restart logic handles it.

## Files changed

- `src/browser.ts` — add `launchRoomBrowser()`, keep `getBrowser()` as-is
- `index.ts` — replace `getBrowser()` call with `launchRoomBrowser()` inside
  `createPage`, add `browser.close()` in `page.on('close')`, add
  `browser.on('disconnected')` handler

## Out of scope

- Browser pooling or reuse across rooms.
- Process-level memory limits per browser (OS-level concern).
- Replacing `getBrowser()` at other call sites (no other call sites exist in
  current codebase).
