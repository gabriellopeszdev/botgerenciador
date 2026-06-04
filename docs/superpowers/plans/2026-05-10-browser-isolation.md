# Browser Isolation per Room Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each Haxball room its own dedicated Chromium process so that a browser crash kills only one room instead of all of them simultaneously.

**Architecture:** Add `launchRoomBrowser()` to `src/browser.ts` (no singleton). In `createPage()`, replace `getBrowser()` with `launchRoomBrowser()`. The browser variable is captured in the `createPage` closure; `page.on('close')` closes it; `browser.on('disconnected')` triggers page close if Chromium dies unexpectedly.

**Tech Stack:** TypeScript 5, puppeteer 22. No test framework — verification is `npx tsc --noEmit`.

---

## File Map

| File | Change |
|------|--------|
| `src/browser.ts` | Add `launchRoomBrowser()` export — no singleton, fresh browser per call |
| `index.ts` | In `createPage()`: use `launchRoomBrowser()`, add `browser.on('disconnected')`, add `browser.close()` in close handler |

> **Parallel-agent note:** This plan modifies `createPage()` setup (~lines 215–218) and the top of `page.on('close')` (~line 353). Area B (Token Failover) modifies the body of `page.on('close')` but not its opening lines. Area D (Notifier) replaces `dmOwner` calls — no line overlap with browser setup.

---

### Task 1: Add `launchRoomBrowser()` to `src/browser.ts`

**Files:**
- Modify: `src/browser.ts`

- [ ] **Step 1: Add the export**

Open `src/browser.ts`. The file currently exports `getBrowser()` and `getRandomUserAgent()`. Add a new export after `getBrowser`:

```typescript
/**
 * Launches a fresh, isolated Chromium instance for a single room.
 * Each room gets its own process — a crash affects only that room.
 */
export async function launchRoomBrowser(): Promise<Browser> {
    const proxyUrl = process.env.PROXY_URL;
    return puppeteer.launch({
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
}
```

The `getBrowser()` singleton is left untouched.

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/browser.ts
git commit -m "feat(browser): add launchRoomBrowser() for per-room isolation"
```

---

### Task 2: Use `launchRoomBrowser()` in `createPage()` and manage browser lifecycle

**Files:**
- Modify: `index.ts`

- [ ] **Step 1: Update the import**

Find in `index.ts`:

```typescript
import { getBrowser, getRandomUserAgent } from './src/browser';
```

Replace with:

```typescript
import { getBrowser, launchRoomBrowser, getRandomUserAgent } from './src/browser';
```

(`getBrowser` is kept in the import because it may be used elsewhere; keeping it avoids a "not used" lint warning — but if TypeScript complains, remove it.)

- [ ] **Step 2: Replace `getBrowser()` call in `createPage()`**

Find inside `createPage()` at `// ── 4. Setup do Puppeteer`:

```typescript
    // ── 4. Setup do Puppeteer ──────────────────────────────────────────────────
    const browser = await getBrowser();
    const page    = await browser.newPage();
    const pageId  = randomUUID();
    let linkSent  = false;
```

Replace with:

```typescript
    // ── 4. Setup do Puppeteer ──────────────────────────────────────────────────
    const browser = await launchRoomBrowser();
    const page    = await browser.newPage();
    const pageId  = randomUUID();
    let linkSent  = false;

    // Se o Chromium morrer (OOM, sinal externo), fechar a page dispara o close
    // handler que registra o crash e agenda o restart.
    browser.on('disconnected', () => {
        if (!page.isClosed()) page.close().catch(() => {});
    });
```

- [ ] **Step 3: Close the browser in `page.on('close')`**

Find the top of the `page.on('close')` handler:

```typescript
    page.on('close', async () => {
        const sala      = manager.buscarPorId(pageId);
        const isManual  = sala?.manualClose ?? false;
        manager.remover(pageId);
```

Add `browser.close()` at the very end of the handler, just before the closing `});`. The handler ends at a `catch (err: any)` block like this:

```typescript
        } catch (err: any) {
            logger.error(`Falha ao reiniciar a sala "${botFileName}": ${err.message}`);
        }
    });
```

Change that last `}` + `});` to:

```typescript
        } catch (err: any) {
            logger.error(`Falha ao reiniciar a sala "${botFileName}": ${err.message}`);
        }

        // Encerra o processo Chromium dedicado a esta sala.
        // O catch evita que uma falha aqui propague para o handler.
        await browser.close().catch(() => {});
    });
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. If TypeScript says `getBrowser` is declared but never read, remove it from the import line.

- [ ] **Step 5: Manual smoke test**

Start the bot: `npm run dev`

Open a room with `!open <token> <script>`. Then run:

```bash
# List running Chromium processes — expect one per open room
ps aux | grep chromium | grep -v grep
```

Or on Linux/Docker:

```bash
pgrep -c chromium
```

Expected: one Chromium process per open room. Previously there was one shared process. Open a second room and confirm the count increases by 1.

- [ ] **Step 6: Commit**

```bash
git add index.ts
git commit -m "feat(rooms): isolate each room in its own Chromium process"
```
