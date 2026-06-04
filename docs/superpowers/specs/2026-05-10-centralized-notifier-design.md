# Centralized Notifier — Design Spec
Date: 2026-05-10

## Problem

Notifications are scattered across `index.ts` as repeated `dmOwner()` calls.
There is no way to route alerts to a Discord channel instead of a DM, no
deduplication (same CPU alert fires every 10 minutes but may still spam), and
no single place to change notification behavior.

## Goal

Create `src/lib/notifier.ts` — a `Notifier` class that becomes the single
notification path for all operational alerts. Support routing to a channel
(via `ALERT_CHANNEL_ID` env var) with DM as fallback, and built-in cooldown
deduplication per alert key.

## Architecture

### `src/lib/notifier.ts`

```typescript
export type AlertKey =
    | 'cpu-high'
    | 'token-expired'
    | 'room-fatal'
    | 'room-restart'
    | 'browser-error'
    | 'no-token-available';

export class Notifier {
    private readonly cooldowns = new Map<string, number>();

    constructor(
        private readonly client: Client,
        private readonly defaultCooldownMs = 10 * 60 * 1000,
    ) {}

    async send(
        key: AlertKey,
        embed: EmbedBuilder,
        options?: { cooldownMs?: number; channelId?: string }
    ): Promise<void>
}
```

#### Routing logic (inside `send`):

1. Check cooldown: if `Date.now() - cooldowns.get(key) < cooldownMs` → skip.
2. Update cooldown timestamp.
3. Determine target:
   a. If `options.channelId` is provided → try to send to that channel.
   b. Else if `ALERT_CHANNEL_ID` env var is set → try to send to that channel.
   c. Fallback → DM to `OWNER_ID` (same as today's `dmOwner`).
4. Log failures but do not throw (non-fatal notification path).

### Cooldown defaults per key

| Key | Default cooldown |
|-----|-----------------|
| `cpu-high` | 10 min |
| `token-expired` | 0 (always send) |
| `room-fatal` | 0 (always send) |
| `room-restart` | 2 min (avoid spam on flapping) |
| `browser-error` | 5 min |
| `no-token-available` | 0 (always send) |

### Environment variables

- `ALERT_CHANNEL_ID` — optional. Discord channel ID for all operational alerts.
  If unset, falls back to DM to `OWNER_ID`.

### Migration in `index.ts`

Replace every `dmOwner(embed)` call with `notifier.send(key, embed)`.
The `dmOwner` function is removed entirely.

## Files changed

- `src/lib/notifier.ts` — new file, `Notifier` class
- `index.ts` — instantiate `Notifier`, replace all `dmOwner` calls, remove
  `dmOwner` function
- `.env.example` — add `ALERT_CHANNEL_ID=` entry with comment

## Out of scope

- Per-room channel routing (rooms already have `channelId`; this is for infra
  alerts only).
- Logging to database (log entries are written separately via `logAndEmit`).
- Slack / webhook integrations.
