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

        const ownerIds = (process.env.OWNER_ID ?? '').split(',').map(id => id.trim()).filter(Boolean);
        if (!ownerIds.length) return;
        await Promise.allSettled(
            ownerIds.map(async (id) => {
                try {
                    const user = await this.client.users.fetch(id);
                    await user.send({ embeds: [embed] });
                } catch {
                    logger.warn(`Notifier: não foi possível entregar alerta via DM ao usuário ${id}.`);
                }
            })
        );
    }
}
