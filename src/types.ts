/**
 * Interface mínima compartilhada por Message do discord.js e WebStatusMessage do painel web.
 * Permite que createPage seja chamado tanto pelo bot Discord quanto pelo servidor HTTP.
 */
export interface IStatusMessage {
    edit(payload: { content?: string; embeds?: any[]; files?: any[] }): Promise<any>;
}

/** Snapshot serializável de uma sala para o painel web (sem Page nem token raw). */
export interface RoomSnapshot {
    pageId:        string;
    dbId:          string;
    name:          string;
    url:           string;
    botFile:       string;
    channelId:     string;
    startedAt:     string;   // ISO 8601
    uptimeSeconds: number;
    playerCount:   number;
    avgPing:       number | null;
    ownerId:       string | null;
}
