import { Page } from 'puppeteer';

/**
 * Estado em memória de uma sala ativa.
 *
 * dbId / tokenDbId → chaves primárias no PostgreSQL, usadas pelos repositórios
 * para gravar métricas, logs e fechar a sala no banco.
 *
 * Tudo que é exclusivamente de runtime (Page, flags de controle) fica aqui;
 * tudo persistente fica no banco via repositórios — sem mistura.
 */
export interface Sala {
    pageId:      string;  // chave no Map (exposta ao painel web)
    dbId:        string;  // Prisma Room.id
    tokenDbId:   string;  // Prisma Token.id
    name:        string;
    url:         string;
    page:        Page;
    botFile:     string;
    token:       string;  // valor bruto do token (para exibição)
    channelId:   string;
    startedAt:   Date;
    manualClose:  boolean;
    crashReason:  string;       // motivo do último crash (para notificações)
    playerCount:  number;       // atualizado pelo health check
    avgPing:      number | null; // atualizado pelo health check
}

const salasOnline = new Map<string, Sala>();
export const manager = {
    adicionar:      (id: string, dados: Sala) => { salasOnline.set(id, dados); },
    remover:        (id: string)              => { salasOnline.delete(id); },
    listar:         ()                        => Array.from(salasOnline.values()),
    buscarPorIndex: (index: number)           => Array.from(salasOnline.values())[index],
    buscarPorId:    (id: string)              => salasOnline.get(id),
    isTokenInUse:   (token: string)           => Array.from(salasOnline.values()).some(s => s.token === token),
};
