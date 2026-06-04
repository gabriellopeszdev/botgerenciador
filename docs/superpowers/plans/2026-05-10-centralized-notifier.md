# Centralized Notifier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four scattered `dmOwner()` calls in `index.ts` with a single `Notifier` class that routes alerts to a Discord channel (or DM fallback) and deduplicates by cooldown per alert key.

**Architecture:** `src/lib/notifier.ts` exports `Notifier` class and `AlertKey` type. `index.ts` instantiates one `Notifier` after `client` is created and calls `notifier.send(key, embed)` everywhere `dmOwner(embed)` was called. The `dmOwner` function is deleted.

**Tech Stack:** TypeScript 5, discord.js 14. No test framework — verification is `npx tsc --noEmit`.

---

## File Map

| File | Change |
|------|--------|
| `src/lib/notifier.ts` | New file — `Notifier` class + `AlertKey` type |
| `index.ts` | Instantiate notifier, replace 4× `dmOwner` calls, delete `dmOwner` function |
| `.env.production` | Add `ALERT_CHANNEL_ID=` entry |

> **Parallel-agent note:** This plan replaces `dmOwner` call sites spread throughout `index.ts`. If running alongside Area B (Token Failover) or Area E (Browser Isolation), be aware that Area B adds a new `dmOwner` call inside the `page.on('close')` handler — apply the notifier migration to that new call as well. Area E does not add any `dmOwner` calls.

---

### Task 1: Create `src/lib/notifier.ts`

**Files:**
- Create: `src/lib/notifier.ts`

- [ ] **Step 1: Write the file**

Create `src/lib/notifier.ts` with this content:

```typescript
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { logger } from './logger';

export type AlertKey =
    | 'cpu-high'
    | 'token-expired'
    | 'room-fatal'
    | 'room-restart'
    | 'browser-error'
    | 'no-token-available';

const KEY_COOLDOWNS: Record<AlertKey, number> = {
    'cpu-high':           10 * 60 * 1000,
    'token-expired':      0,
    'room-fatal':         0,
    'room-restart':       2  * 60 * 1000,
    'browser-error':      5  * 60 * 1000,
    'no-token-available': 0,
};

export class Notifier {
    private readonly lastSent = new Map<string, number>();

    constructor(private readonly client: Client) {}

    async send(
        key: AlertKey,
        embed: EmbedBuilder,
        options?: { channelId?: string },
    ): Promise<void> {
        const cooldownMs = KEY_COOLDOWNS[key];
        const last = this.lastSent.get(key) ?? 0;
        if (cooldownMs > 0 && Date.now() - last < cooldownMs) return;
        this.lastSent.set(key, Date.now());

        const targetChannelId = options?.channelId ?? process.env.ALERT_CHANNEL_ID;

        if (targetChannelId) {
            try {
                const ch = await this.client.channels.fetch(targetChannelId).catch(() => null) as TextChannel | null;
                if (ch && 'send' in ch) {
                    await ch.send({ embeds: [embed] });
                    return;
                }
            } catch {
                logger.warn('Notifier: falha ao enviar para canal de alertas, tentando DM.');
            }
        }

        const ownerId = process.env.OWNER_ID;
        if (!ownerId) return;
        try {
            const owner = await this.client.users.fetch(ownerId);
            await owner.send({ embeds: [embed] });
        } catch {
            logger.warn('Notifier: não foi possível entregar alerta via DM ao dono.');
        }
    }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/notifier.ts
git commit -m "feat(notifier): add Notifier class with cooldown and channel routing"
```

---

### Task 2: Wire `Notifier` into `index.ts` and remove `dmOwner`

**Files:**
- Modify: `index.ts`

There are exactly 4 `dmOwner` call sites plus the function definition itself. Each is replaced below.

- [ ] **Step 1: Add import at top of `index.ts`**

Find the existing import block near the top of `index.ts`:

```typescript
import { logger } from './src/lib/logger';
```

Add directly after it:

```typescript
import { Notifier } from './src/lib/notifier';
```

- [ ] **Step 2: Instantiate `Notifier` after `client` is declared**

Find this in `index.ts` (~line 61):

```typescript
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});
```

Add directly after the closing `});`:

```typescript
const notifier = new Notifier(client);
```

- [ ] **Step 3: Delete the `dmOwner` function**

Remove the entire block (~lines 50–59):

```typescript
// ─── Utilitário: envia DM ao dono do bot ──────────────────────────────────────
async function dmOwner(embed: EmbedBuilder): Promise<void> {
    const ownerId = process.env.OWNER_ID;
    if (!ownerId) return;
    try {
        const owner = await client.users.fetch(ownerId);
        await owner.send({ embeds: [embed] });
    } catch {
        logger.warn('Não foi possível enviar DM ao dono do bot.');
    }
}
```

- [ ] **Step 4: Replace call site 1 — CPU alert (~line 166)**

Find:

```typescript
        await dmOwner(
            new EmbedBuilder()
                .setTitle('⚠️ Alerta de Carga Alta')
                .setColor('#E74C3C')
                .setDescription('O servidor está com uso elevado de CPU. Abrir mais salas pode causar lag.')
                .addFields(
                    { name: '🖥️ CPU',          value: `${cpu}%`,       inline: true },
                    { name: '💾 RAM',           value: `${ram} MB`,     inline: true },
                    { name: '🌐 Salas Ativas',  value: `${roomsOnline}`, inline: true },
                )
                .setTimestamp()
        );
```

Replace with:

```typescript
        await notifier.send('cpu-high',
            new EmbedBuilder()
                .setTitle('⚠️ Alerta de Carga Alta')
                .setColor('#E74C3C')
                .setDescription('O servidor está com uso elevado de CPU. Abrir mais salas pode causar lag.')
                .addFields(
                    { name: '🖥️ CPU',          value: `${cpu}%`,        inline: true },
                    { name: '💾 RAM',           value: `${ram} MB`,      inline: true },
                    { name: '🌐 Salas Ativas',  value: `${roomsOnline}`, inline: true },
                )
                .setTimestamp()
        );
```

Note: the `lastCpuAlertAt` variable and its cooldown guard can now be removed since `Notifier` handles cooldown internally for `'cpu-high'` (10 min). Remove these lines from the CPU metrics interval:

```typescript
const CPU_ALERT_COOLDOWN = 10 * 60 * 1000;
let lastCpuAlertAt = 0;
```

And remove the cooldown check:

```typescript
        if (cpu >= CPU_THRESHOLD && Date.now() - lastCpuAlertAt >= CPU_ALERT_COOLDOWN) {
            lastCpuAlertAt = Date.now();
```

Replace with:

```typescript
        if (cpu >= CPU_THRESHOLD) {
```

(The `Notifier` class handles the 10-minute cooldown internally for `'cpu-high'`.)

- [ ] **Step 5: Replace call site 2 — invalid token DM (~line 336)**

Find inside `sendErrorToDiscord` handler:

```typescript
            if (isInvalidToken) {
                await dmOwner(
                    new EmbedBuilder()
                        .setTitle('🔑 Token Inválido Detectado')
                        .setColor('#E74C3C')
                        .setDescription(
                            `A sala **${botFileName}** caiu por token inválido ou expirado.\n\n` +
                            `[Clique aqui para gerar um novo token](https://www.haxball.com/headlesstoken)`
                        )
                        .setTimestamp()
                );
            }
```

Replace with:

```typescript
            if (isInvalidToken) {
                await notifier.send('token-expired',
                    new EmbedBuilder()
                        .setTitle('🔑 Token Inválido Detectado')
                        .setColor('#E74C3C')
                        .setDescription(
                            `A sala **${botFileName}** caiu por token inválido ou expirado.\n\n` +
                            `[Clique aqui para gerar um novo token](https://www.haxball.com/headlesstoken)`
                        )
                        .setTimestamp()
                );
            }
```

- [ ] **Step 6: Replace call site 3 — room fatal DM (~line 386)**

Find inside `page.on('close')`:

```typescript
                    } else {
                        // Sala aberta pelo painel sem canal — notifica o dono via DM
                        await dmOwner(fatalEmbed);
                    }
```

Replace with:

```typescript
                    } else {
                        await notifier.send('room-fatal', fatalEmbed);
                    }
```

- [ ] **Step 7: Replace call site 4 — room restart DM (~line 416)**

Find inside `page.on('close')` restart branch:

```typescript
            } else {
                // Sala aberta pelo painel — avisa dono por DM e usa Socket.io como status
                await dmOwner(restartEmbed);
                const io        = getIO();
```

Replace with:

```typescript
            } else {
                await notifier.send('room-restart', restartEmbed);
                const io        = getIO();
```

- [ ] **Step 8: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. Common failure: `dmOwner is not defined` somewhere — search for any remaining `dmOwner` references: `grep -n "dmOwner" index.ts`. There should be zero results.

- [ ] **Step 9: Commit**

```bash
git add index.ts
git commit -m "feat(notifier): wire Notifier into index.ts, remove dmOwner"
```

---

### Task 3: Add `ALERT_CHANNEL_ID` to environment config

**Files:**
- Modify: `.env.production`

- [ ] **Step 1: Add the variable**

In `.env.production`, find the Discord section and add after `OWNER_ID`:

```
# Canal para alertas operacionais (CPU, salas caindo, tokens expirados).
# Deixe vazio para receber alertas por DM ao OWNER_ID.
ALERT_CHANNEL_ID=
```

- [ ] **Step 2: Commit**

```bash
git add .env.production
git commit -m "chore(config): add ALERT_CHANNEL_ID env var for alert routing"
```
