# Token Failover — Design Spec
Date: 2026-05-10

## Problem

When a token expires mid-run, the auto-restart in `page.on('close')` calls
`createPage(token, ...)` with the same expired token. `checkoutToken` throws
`"Token expirado"`, which counts as a retry and eventually kills the room
permanently — even though a fresh token might be available.

## Goal

When a room crashes and the token is EXPIRED, automatically select the next
AVAILABLE token and restart the room with it. If no token is available, notify
the owner and give up cleanly.

## Architecture

### New method: `TokenRepository.findNextAvailable(excludeId?)`

```typescript
async findNextAvailable(excludeId?: string): Promise<Token | null> {
    return this.prisma.token.findFirst({
        where: {
            status: 'AVAILABLE',
            ...(excludeId ? { id: { not: excludeId } } : {}),
        },
        orderBy: { lastUsedAt: 'asc' }, // prefer least-recently-used
    });
}
```

### Changes to `page.on('close')` handler in `index.ts`

The handler already detects token expiry via `tokenRepo.markAsExpired()` inside
`sendErrorToDiscord`. When the page closes, the handler must check if the
current token is expired and, if so, find a fallback before calling `createPage`.

Logic flow:
1. `page.on('close')` fires.
2. Look up token status via `tokenRepo.findById(tokenRecord.id)`.
3. If `EXPIRED` → call `tokenRepo.findNextAvailable(tokenRecord.id)`.
   - Found: release old token (no-op since already EXPIRED), restart with new
     token value. Reset `retryCount` to 0 (fresh token = fresh start).
   - Not found: send owner DM with "no token available" embed, log FATAL, return.
4. If not EXPIRED → restart as today with same token and `nextRetry`.

### No changes to `checkoutToken`

Token checkout remains atomic. The failover picks the next AVAILABLE token
before calling `createPage`, so `checkoutToken` always receives a valid value.

### No changes to `MAX_RETRIES` semantics

Retry counter resets only on token failover. Crashes unrelated to token expiry
still count against `MAX_RETRIES`.

## Error handling

- `findNextAvailable` returns `null` if no tokens exist → handled explicitly,
  no uncaught throw.
- `createPage` with new token can still fail → normal retry logic applies.
- All branch paths emit a log entry so the web panel shows what happened.

## Notifications

- Token failover success: log `INFO` "Reiniciando com token alternativo: <masked>"
- No token available: log `CRASH` + DM owner embed with instructions to register
  a new token.

## Files changed

- `src/repositories/TokenRepository.ts` — add `findNextAvailable`
- `index.ts` — update `page.on('close')` handler with failover branch

## Out of scope

- Auto-fetching a new token via `HaxballTokenFetcher` (requires reCAPTCHA;
  manual intervention is more reliable).
- UI for token failover status (covered by existing log viewer).
