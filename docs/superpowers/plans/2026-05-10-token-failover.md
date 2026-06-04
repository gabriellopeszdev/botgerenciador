# Token Failover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a Haxball room crashes because its token expired, automatically restart it with the next available token instead of burning retries and dying.

**Architecture:** Add `findNextAvailable()` to `TokenRepository`, then update the `page.on('close')` handler in `index.ts` to fetch the current token's status at close-time: if EXPIRED, find a fallback token and restart with retry=0; otherwise restart as today.

**Tech Stack:** TypeScript 5, Prisma ORM, puppeteer, discord.js. No test framework — verification is `npx tsc --noEmit`.

---

## File Map

| File | Change |
|------|--------|
| `src/repositories/TokenRepository.ts` | Add `findNextAvailable(excludeId?)` method |
| `index.ts` | Update `page.on('close')` handler (~line 353) with token-failover branch |

> **Parallel-agent note:** This plan only touches `page.on('close')` in `index.ts` (lines 353–425). If running alongside Area D (Notifier) or Area E (Browser Isolation), there are no line-level conflicts — Area D replaces `dmOwner` call sites, Area E modifies `createPage()` setup above line 215.

---

### Task 1: Add `findNextAvailable` to `TokenRepository`

**Files:**
- Modify: `src/repositories/TokenRepository.ts` (append after `findById` at line 110)

- [ ] **Step 1: Add the method**

Open `src/repositories/TokenRepository.ts`. After the `findById` method (line 110), add:

```typescript
    /**
     * Returns the next AVAILABLE token, excluding the one that just expired.
     * Prefers least-recently-used to spread load across tokens.
     */
    async findNextAvailable(excludeId?: string): Promise<Token | null> {
        return this.prisma.token.findFirst({
            where: {
                status: 'AVAILABLE',
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            orderBy: { lastUsedAt: 'asc' },
        });
    }
```

The full file after the change should have this method before `listAll()`.

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/repositories/TokenRepository.ts
git commit -m "feat(tokens): add findNextAvailable for token failover"
```

---

### Task 2: Update `page.on('close')` with token failover branch

**Files:**
- Modify: `index.ts` lines 352–425 (the `page.on('close')` handler inside `createPage`)

- [ ] **Step 1: Replace the handler**

Find this block inside `createPage` (starts at `// ── 8. Auto-Restart`):

```typescript
    // ── 8. Auto-Restart + fechamento do registro no banco ─────────────────────
    page.on('close', async () => {
        const sala      = manager.buscarPorId(pageId);
        const isManual  = sala?.manualClose ?? false;
        manager.remover(pageId);

        const closeStatus = isManual ? 'OFFLINE' as const : 'CRASHED' as const;
        const logMessage  = isManual
            ? 'Sala encerrada manualmente pelo operador'
            : `Sala encerrou inesperadamente`;

        await roomRepo.closeRoom(roomRecord.id, closeStatus).catch(() => {});
        logAndEmit(roomRecord.id, isManual ? 'INFO' : 'CRASH', logMessage);
        emitter.emit('room:removed', { pageId, dbId: roomRecord.id, status: closeStatus });

        logger.info(`Aba da sala "${botFileName}" foi fechada (${closeStatus}).`);

        if (isManual || retryCount >= MAX_RETRIES) {
            if (!isManual) {
                logger.error(`Sala "${botFileName}" atingiu o limite de ${MAX_RETRIES} reinicializações. Interrompendo.`);
                const fatalEmbed = new EmbedBuilder()
                    .setTitle('💀 Sala Encerrada Definitivamente')
                    .setColor('#E74C3C')
                    .setDescription(
                        `A sala **${botFileName}** atingiu o limite de **${MAX_RETRIES}** reinicializações automáticas e foi encerrada permanentemente.\n\n` +
                        `Use \`!open\` para reabri-la manualmente quando o problema for resolvido.`
                    )
                    .setTimestamp();
                try {
                    const channel = await client.channels.fetch(channelId).catch(() => null) as TextChannel | null;
                    if (channel && 'send' in channel) {
                        await channel.send({ embeds: [fatalEmbed] });
                    } else {
                        // Sala aberta pelo painel sem canal — notifica o dono via DM
                        await dmOwner(fatalEmbed);
                    }
                } catch { /* canal pode não estar mais acessível */ }
            }
            return;
        }

        const nextRetry = retryCount + 1;
        logger.warn(`Sala "${botFileName}" fechou inesperadamente. Aguardando ${RESTART_DELAY / 1000}s antes de reiniciar (${nextRetry}/${MAX_RETRIES})...`);

        // Aguarda antes de tentar reabrir — evita queimar tentativas em falhas transientes
        await new Promise(resolve => setTimeout(resolve, RESTART_DELAY));

        try {
            const restartEmbed = new EmbedBuilder()
                .setTitle('🔄 Reiniciando Sala Automaticamente')
                .setDescription(`A sala **${botFileName}** caiu inesperadamente.\nReiniciando... (tentativa **${nextRetry}/${MAX_RETRIES}**)`)
                .setColor('#E67E22')
                .setTimestamp();

            // Se a sala tem canal Discord associado, notifica lá; caso contrário usa DM ao dono
            const channel = channelId
                ? await client.channels.fetch(channelId).catch(() => null) as TextChannel | null
                : null;

            let statusMsg: IStatusMessage;
            if (channel && 'send' in channel) {
                statusMsg = await channel.send({ embeds: [restartEmbed] });
            } else {
                // Sala aberta pelo painel — avisa dono por DM e usa Socket.io como status
                await dmOwner(restartEmbed);
                const io        = getIO();
                const requestId = randomUUID();
                statusMsg       = io ? new WebStatusMessage(io, requestId) : { edit: async () => {} } as IStatusMessage;
            }
            await createPage(token, statusMsg, botFileName, channelId, nextRetry);
        } catch (err: any) {
            logger.error(`Falha ao reiniciar a sala "${botFileName}": ${err.message}`);
        }
    });
```

Replace the entire block with:

```typescript
    // ── 8. Auto-Restart + fechamento do registro no banco ─────────────────────
    page.on('close', async () => {
        const sala      = manager.buscarPorId(pageId);
        const isManual  = sala?.manualClose ?? false;
        manager.remover(pageId);

        const closeStatus = isManual ? 'OFFLINE' as const : 'CRASHED' as const;
        const logMessage  = isManual
            ? 'Sala encerrada manualmente pelo operador'
            : 'Sala encerrou inesperadamente';

        await roomRepo.closeRoom(roomRecord.id, closeStatus).catch(() => {});
        logAndEmit(roomRecord.id, isManual ? 'INFO' : 'CRASH', logMessage);
        emitter.emit('room:removed', { pageId, dbId: roomRecord.id, status: closeStatus });

        logger.info(`Aba da sala "${botFileName}" foi fechada (${closeStatus}).`);

        if (isManual) return;

        // ── Token failover: se o token expirou, tenta o próximo disponível ──────
        const currentToken = await tokenRepo.findById(tokenRecord.id).catch(() => null);
        const tokenExpired = currentToken?.status === 'EXPIRED';
        let restartToken   = token;
        let restartRetry   = retryCount + 1;

        if (tokenExpired) {
            const fallback = await tokenRepo.findNextAvailable(tokenRecord.id).catch(() => null);
            if (!fallback) {
                logger.error(`Sala "${botFileName}": token expirado e nenhum token disponível. Encerrando.`);
                logAndEmit(roomRecord.id, 'CRASH', 'Token expirado — nenhum token de reposição disponível');
                await dmOwner(
                    new EmbedBuilder()
                        .setTitle('🔑 Sem Tokens Disponíveis')
                        .setColor('#E74C3C')
                        .setDescription(
                            `A sala **${botFileName}** caiu e o token expirou.\n` +
                            `Não há tokens de reposição disponíveis.\n\n` +
                            `Registre um novo token em **haxball.com/headlesstoken** e use \`!open\` para reabrir.`
                        )
                        .setTimestamp()
                );
                return;
            }
            restartToken = fallback.value;
            restartRetry = 0; // token fresco — zera tentativas
            logger.warn(`Sala "${botFileName}": token expirado. Reiniciando com token alternativo.`);
            logAndEmit(roomRecord.id, 'INFO', `Token expirado — usando token alternativo para reiniciar`);
        } else if (retryCount >= MAX_RETRIES) {
            logger.error(`Sala "${botFileName}" atingiu o limite de ${MAX_RETRIES} reinicializações. Interrompendo.`);
            const fatalEmbed = new EmbedBuilder()
                .setTitle('💀 Sala Encerrada Definitivamente')
                .setColor('#E74C3C')
                .setDescription(
                    `A sala **${botFileName}** atingiu o limite de **${MAX_RETRIES}** reinicializações automáticas e foi encerrada permanentemente.\n\n` +
                    `Use \`!open\` para reabri-la manualmente quando o problema for resolvido.`
                )
                .setTimestamp();
            try {
                const channel = await client.channels.fetch(channelId).catch(() => null) as TextChannel | null;
                if (channel && 'send' in channel) {
                    await channel.send({ embeds: [fatalEmbed] });
                } else {
                    await dmOwner(fatalEmbed);
                }
            } catch { /* canal pode não estar mais acessível */ }
            return;
        }

        logger.warn(`Sala "${botFileName}" fechou inesperadamente. Aguardando ${RESTART_DELAY / 1000}s antes de reiniciar (${restartRetry}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RESTART_DELAY));

        try {
            const restartEmbed = new EmbedBuilder()
                .setTitle('🔄 Reiniciando Sala Automaticamente')
                .setDescription(
                    tokenExpired
                        ? `A sala **${botFileName}** caiu (token expirado).\nReiniciando com novo token...`
                        : `A sala **${botFileName}** caiu inesperadamente.\nReiniciando... (tentativa **${restartRetry}/${MAX_RETRIES}**)`
                )
                .setColor('#E67E22')
                .setTimestamp();

            const channel = channelId
                ? await client.channels.fetch(channelId).catch(() => null) as TextChannel | null
                : null;

            let statusMsg: IStatusMessage;
            if (channel && 'send' in channel) {
                statusMsg = await channel.send({ embeds: [restartEmbed] });
            } else {
                await dmOwner(restartEmbed);
                const io        = getIO();
                const requestId = randomUUID();
                statusMsg       = io ? new WebStatusMessage(io, requestId) : { edit: async () => {} } as IStatusMessage;
            }
            await createPage(restartToken, statusMsg, botFileName, channelId, restartRetry);
        } catch (err: any) {
            logger.error(`Falha ao reiniciar a sala "${botFileName}": ${err.message}`);
        }
    });
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. If there are errors, the most likely cause is `dmOwner` not being defined — it is defined at line ~50 of `index.ts` and is in scope here.

- [ ] **Step 3: Manual smoke test**

Start the bot: `npm run dev`

To verify the failover path:
1. Open a room with a token that is currently AVAILABLE.
2. In the database, manually set that token's status to `EXPIRED`:
   ```sql
   UPDATE "Token" SET status = 'EXPIRED' WHERE value = '<your-token-value>';
   ```
3. Kill the room's page from the health check or by closing it via the panel.
4. In the bot logs, you should see:
   - `Token expirado — usando token alternativo para reiniciar` (if another AVAILABLE token exists)
   - OR `token expirado e nenhum token disponível. Encerrando.` (if no fallback)

- [ ] **Step 4: Commit**

```bash
git add index.ts
git commit -m "feat(rooms): token failover on expired token at room close"
```
