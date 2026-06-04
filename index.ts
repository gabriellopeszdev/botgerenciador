import { Client, GatewayIntentBits, Message, EmbedBuilder, AttachmentBuilder, TextChannel } from 'discord.js';
import 'dotenv/config';
import os from 'os';
import { randomUUID } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getBrowser, launchRoomBrowser, getRandomUserAgent, closeBrowser } from './src/browser';
const execAsync = promisify(exec);
import { manager } from './src/manager';
import handleCommands from './src/commands';
import { logger } from './src/lib/logger';
import { Notifier } from './src/lib/notifier';
import { HaxballTokenFetcher } from './src/lib/HaxballTokenFetcher';
import { getCpuUsagePercent } from './src/system';
import { roomRepo, tokenRepo, logRepo, metricRepo, botRepo } from './src/repositories/index';
import { prisma } from './src/db/prisma';
import { emitter, logAndEmit } from './src/web/emitter';
import { startWebServer, getIO, WebStatusMessage } from './src/web/server';
import type { IStatusMessage } from './src/types';

// ─── Validação de variáveis de ambiente obrigatórias ──────────────────────────
for (const key of ['DISCORD_TOKEN', 'DATABASE_URL'] as const) {
    if (!process.env[key]) {
        console.error(`[FATAL] Variável de ambiente obrigatória não definida: "${key}". Verifique o arquivo .env.`);
        process.exit(1);
    }
}

// Impede que qualquer erro isolado derrube o processo inteiro e mate todas as salas
process.on('uncaughtException', (err) => {
    logger.error(`Exceção não capturada (processo mantido vivo): ${err.message}`);
});

process.on('unhandledRejection', (reason) => {
    logger.error(`Promise rejeitada não tratada (processo mantido vivo): ${String(reason)}`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown(signal: string): Promise<void> {
    logger.warn(`Sinal ${signal} recebido. Encerrando bot graciosamente...`);
    const salas = manager.listar();
    if (salas.length) {
        salas.forEach(s => { s.manualClose = true; });
        // Fecha salas no banco ANTES de desconectar o Prisma — os handlers
        // page.on('close') são assíncronos e não são aguardados pelo allSettled,
        // então sem isso os tokens ficam IN_USE após um docker restart.
        await Promise.allSettled(salas.map(s => roomRepo.closeRoom(s.dbId, 'OFFLINE').catch(() => {})));
        await Promise.allSettled(salas.map(s => s.page.close().catch(() => {})));
        logger.info(`${salas.length} sala(s) encerrada(s).`);
    }
    await prisma.$disconnect().catch(() => {});
    logger.info('Encerramento concluído.');
    process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});
const notifier = new Notifier(client);

const PREFIX          = process.env.PREFIX || '!';
const MAX_RETRIES     = parseInt(process.env.MAX_RETRIES || '3');
const HEALTH_INTERVAL = parseInt(process.env.HEALTH_CHECK_INTERVAL || '30') * 1000;
const HEALTH_TIMEOUT  = parseInt(process.env.HEALTH_TIMEOUT_MS || '12000');
const RESTART_DELAY   = parseInt(process.env.RESTART_DELAY_MS  || '8000');

// Conta falhas consecutivas por sala — evita que um timeout transiente mate salas saudáveis.
// Uma sala só é fechada após HEALTH_FAIL_THRESHOLD falhas seguidas sem sucesso.
const HEALTH_FAIL_THRESHOLD = 4;
const healthFailures = new Map<string, number>();

// ─── Health Check ─────────────────────────────────────────────────────────────
let healthCheckRunning = false;
setInterval(async () => {
    if (healthCheckRunning) return;
    const salas = manager.listar();
    if (!salas.length) return;

    healthCheckRunning = true;
    await Promise.allSettled(
        salas.map(async (sala) => {
            if (sala.page.isClosed()) return;
            try {
                // Um único round-trip ao Chromium para saúde + métricas
                let timeoutId: ReturnType<typeof setTimeout>;
                const metrics = await Promise.race([
                    sala.page.evaluate(() => {
                        const room = (window as any).room;
                        if (!room) return { playerCount: 0, avgPing: null as number | null };
                        const players: any[] = room.getPlayerList();
                        const pings = players.map((p: any) => p.ping).filter((p: number) => p > 0);
                        return {
                            playerCount: players.length,
                            avgPing: pings.length
                                ? Math.round(pings.reduce((a: number, b: number) => a + b, 0) / pings.length)
                                : null,
                        };
                    }),
                    new Promise<never>((_, reject) => {
                        timeoutId = setTimeout(
                            () => reject(new Error(`health-timeout-${HEALTH_TIMEOUT}ms`)),
                            HEALTH_TIMEOUT,
                        );
                    }),
                ]).finally(() => clearTimeout(timeoutId!));

                // Sucesso: zera contador de falhas consecutivas
                healthFailures.delete(sala.pageId);

                const { playerCount: pc, avgPing: ap } = metrics;
                const changed = pc !== sala.playerCount || ap !== sala.avgPing;
                sala.playerCount = pc;
                sala.avgPing     = ap;
                // Só escreve no banco quando os valores mudam — elimina writes desnecessários a cada 30s
                if (changed) await roomRepo.updateMetrics(sala.dbId, pc, ap).catch(() => {});
                emitter.emit('room:metrics', { pageId: sala.pageId, playerCount: pc, avgPing: ap });

            } catch (err: any) {
                const consecutive = (healthFailures.get(sala.pageId) ?? 0) + 1;
                healthFailures.set(sala.pageId, consecutive);

                logger.warn(
                    `Health check falhou para "${sala.botFile}" ` +
                    `(${consecutive}/${HEALTH_FAIL_THRESHOLD}): ${err.message}`
                );

                if (consecutive >= HEALTH_FAIL_THRESHOLD) {
                    healthFailures.delete(sala.pageId);
                    logger.error(`"${sala.botFile}" falhou ${HEALTH_FAIL_THRESHOLD}x consecutivos. Fechando para restart.`);
                    sala.crashReason = `health check: ${HEALTH_FAIL_THRESHOLD} timeouts consecutivos (${err.message})`;
                    await sala.page.close().catch(() => {});
                }
            }
        })
    );
    healthCheckRunning = false;
}, HEALTH_INTERVAL);

// ─── CPU Alert + gravação de métricas ─────────────────────────────────────────
const CPU_THRESHOLD     = parseInt(process.env.CPU_ALERT_THRESHOLD || '80');

setInterval(async () => {
    const cpu = await getCpuUsagePercent();
    const ram = parseFloat(((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0));
    const roomsOnline = manager.listar().length;

    // Grava snapshot no banco e emite para o painel web
    await metricRepo.record(cpu, ram, roomsOnline).catch(() => {});
    emitter.emit('server:metrics', { cpu, ramMb: ram, roomsOnline, timestamp: new Date().toISOString() });

    if (cpu >= CPU_THRESHOLD) {
        logger.warn(`CPU em ${cpu}% — acima do limite de ${CPU_THRESHOLD}%. Enviando alerta ao dono.`);
        await notifier.send('cpu-high',
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
    }
}, 2 * 60 * 1000);

// ─── Limpeza de tokens expirados (executa a cada minuto, remove com +5 min) ────
setInterval(async () => {
    const deleted = await tokenRepo.pruneExpired(5).catch(() => 0);
    if (deleted > 0) logger.info(`Tokens expirados removidos: ${deleted} token(s) com mais de 5 minutos.`);
}, 60 * 1000);

// ─── Limpeza periódica de métricas antigas (executa a cada 24h) ───────────────
setInterval(async () => {
    const deleted = await metricRepo.prune(7).catch(() => 0);
    if (deleted > 0) logger.info(`Limpeza de métricas: ${deleted} registro(s) com mais de 7 dias removidos.`);
}, 24 * 60 * 60 * 1000);

// ─── createPage ───────────────────────────────────────────────────────────────
export async function createPage(
    token: string,
    statusMsg: IStatusMessage,
    botFileName: string,
    channelId: string,
    retryCount = 0,
): Promise<void> {

    // ── 1. Reserva o token atomicamente ────────────────────────────────────────
    // A transação do Prisma garante que dois !open simultâneos com o mesmo
    // token não passem: só um deles reserva, o outro recebe um erro imediato.
    const tokenRecord = await tokenRepo.checkoutToken(token);

    // ── 2. Cria o registro da sala no banco (antes do Puppeteer) ───────────────
    // roomName fica com o scriptName como placeholder; será atualizado em
    // onLinkFound com o nome real que o HBInit recebe via config.roomName.
    const roomRecord = await roomRepo.create({
        scriptName: botFileName,
        channelId,
        retryCount,
        tokenId: tokenRecord.id,
    });

    // ── 3. Primeiro log: inicialização registrada ──────────────────────────────
    logAndEmit(roomRecord.id, 'SUCCESS', `Sala iniciada — script: ${botFileName} (tentativa ${retryCount + 1})`);

    // ── 4. Setup do Puppeteer ──────────────────────────────────────────────────
    const browser = await launchRoomBrowser();
    const page    = await browser.newPage();
    const pageId  = randomUUID();
    let linkSent  = false;

    // Motivo do crash: atualizado antes de fechar a page em cada cenário.
    // Incluído na notificação Discord para facilitar diagnóstico.
    let crashReason = 'encerramento inesperado do processo Chromium';

    // Se o Chromium morrer (OOM, sinal externo), fechar a page dispara o close
    // handler que registra o crash e agenda o restart.
    browser.on('disconnected', () => {
        crashReason = 'processo Chromium encerrado (OOM ou sinal externo)';
        if (!page.isClosed()) page.close().catch(() => {});
    });

    await page.setUserAgent(getRandomUserAgent());
    await page.evaluateOnNewDocument(`
        Object.defineProperty(navigator, 'webdriver', { get: function() { return undefined; } });
    `);

    await page.setRequestInterception(true);
    page.on('request', (req) => {
        try {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) req.abort();
            else req.continue();
        } catch { /* requisição já tratada */ }
    });

    // Captura erros JS não tratados no contexto do browser (não passam por sendErrorToDiscord)
    page.on('pageerror', (err) => {
        crashReason = `erro JS não tratado: ${err.message.slice(0, 120)}`;
        logger.warn(`Erro JS não tratado na sala "${botFileName}": ${err.message}`);
        logRepo.add(roomRecord.id, 'ERROR', `Erro JS: ${err.message}`).catch(() => {});
    });

    // ── 5. onLinkFound: sala confirmada online ─────────────────────────────────
    const onLinkFound = async (url: string, name: string) => {
        if (linkSent) return;
        linkSent = true;

        // Atualiza nome real e URL no banco
        await roomRepo.updateLink(roomRecord.id, name, url).catch(() => {});
        logAndEmit(roomRecord.id, 'SUCCESS', `Sala online: ${name} — ${url}`);

        const successEmbed = new EmbedBuilder()
            .setTitle('✅ Sala Online!')
            .setColor('#2ECC71')
            .addFields(
                { name: '🏷️ Nome',   value: name,                                         inline: true },
                { name: '📂 Script', value: `\`${botFileName}.js\``,                       inline: true },
                { name: '🔗 Link',   value: `[Clique aqui para entrar](${url})`,           inline: false },
            )
            .setFooter({ text: 'A sala está pronta para receber jogadores.' })
            .setTimestamp();

        await statusMsg.edit({ embeds: [successEmbed] }).catch(() => {});

        const sala = {
            pageId,
            dbId:        roomRecord.id,
            tokenDbId:   tokenRecord.id,
            name, url, page,
            botFile:     botFileName,
            token,
            channelId,
            startedAt:   new Date(),
            manualClose: false,
            crashReason: '',
            playerCount: 0,
            avgPing:     null as number | null,
        };
        manager.adicionar(pageId, sala);
        emitter.emit('room:added', {
            pageId, dbId: roomRecord.id, name, url,
            botFile: botFileName, channelId,
            startedAt:     sala.startedAt.toISOString(),
            uptimeSeconds: 0,
            playerCount:   0,
            avgPing:       null,
        });

        logger.success(`Sala "${name}" está online. Link: ${url}`);
    };

    // ── 6. Captura do link via console (fallback) ──────────────────────────────
    page.on('console', async (msg) => {
        try {
            if (linkSent) return;
            const text = msg.text();
            const m = text.match(/https?:\/\/www\.haxball\.com\/play\?c=[A-Za-z0-9_-]+/i)
                ?? text.match(/play\?c=[A-Za-z0-9_-]+/i);
            if (!m) return;
            const raw = m[0]!;
            const url = raw.startsWith('http') ? raw : `https://www.haxball.com/${raw}`;
            await onLinkFound(url, botFileName);
        } catch (err: any) {
            logger.warn(`Erro no listener de console da sala "${botFileName}": ${err.message}`);
        }
    });

    await page.exposeFunction('sendLinkToDiscord', async (url: string, name: string) => {
        try {
            await onLinkFound(url, name);
        } catch (err: any) {
            logger.warn(`Erro em sendLinkToDiscord da sala "${botFileName}": ${err.message}`);
        }
    });

    // ── 7. Erros reportados pelo script ───────────────────────────────────────
    await page.exposeFunction('sendErrorToDiscord', async (errorMsg: string) => {
        try {
            crashReason = `erro no script: ${errorMsg.slice(0, 120)}`;
            await logRepo.add(roomRecord.id, 'ERROR', errorMsg).catch(() => {});

            const isInvalidToken = /invalid.{0,20}token|token.{0,20}invalid/i.test(errorMsg);
            if (isInvalidToken) {
                await tokenRepo.markAsExpired(tokenRecord.id).catch(() => {});
                await logRepo.add(roomRecord.id, 'TOKEN_EXPIRED', 'Token inválido ou expirado').catch(() => {});
            }

            const screenshot = !page.isClosed()
                ? await page.screenshot().catch(() => null)
                : null;

            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erro no Script')
                .setColor('#E74C3C')
                .setDescription(`Falha ao rodar **${botFileName}**.`)
                .addFields({ name: 'Detalhes', value: `\`\`\`${errorMsg}\`\`\`` });

            const editPayload: Parameters<typeof statusMsg.edit>[0] = { embeds: [errorEmbed] };
            if (screenshot) {
                editPayload.files = [new AttachmentBuilder(screenshot as Buffer, { name: 'error.png' })];
            }

            await statusMsg.edit(editPayload).catch(() => {});
            logger.error(`Erro no navegador da sala "${botFileName}": ${errorMsg}`);
            if (!page.isClosed()) await page.close();

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
        } catch (err: any) {
            logger.error(`Erro ao processar sendErrorToDiscord da sala "${botFileName}": ${err.message}`);
        }
    });

    // ── 8. Auto-Restart + fechamento do registro no banco ─────────────────────
    page.on('close', async () => {
        const sala      = manager.buscarPorId(pageId);
        const isManual  = sala?.manualClose ?? false;
        // crashReason pode ter sido atualizado pelo health check via sala.crashReason
        if (sala?.crashReason) crashReason = sala.crashReason;
        manager.remover(pageId);

        const closeStatus = isManual ? 'OFFLINE' as const : 'CRASHED' as const;
        const logMessage  = isManual
            ? 'Sala encerrada manualmente pelo operador'
            : `Sala encerrou inesperadamente — ${crashReason}`;

        await roomRepo.closeRoom(roomRecord.id, closeStatus).catch(() => {});
        logAndEmit(roomRecord.id, isManual ? 'INFO' : 'CRASH', logMessage);
        emitter.emit('room:removed', { pageId, dbId: roomRecord.id, status: closeStatus });

        logger.info(`Aba da sala "${botFileName}" foi fechada (${closeStatus}).`);

        // Encerra sempre o processo Chromium desta sala — com timeout + SIGKILL
        // como fallback para evitar processos zumbi que acumulam CPU.
        await closeBrowser(browser);

        if (isManual) return;

        // ── Token failover: se o token expirou, tenta o próximo disponível ──────
        const currentToken = await tokenRepo.findById(tokenRecord.id).catch(() => null);
        const tokenExpired = currentToken?.status === 'EXPIRED';
        let restartToken   = token;
        let restartRetry   = retryCount + 1;

        if (tokenExpired) {
            const fallback = await tokenRepo.findNextAvailable(tokenRecord.id).catch(() => null);
            if (!fallback) {
                // Sem token de reposição — tenta gerar um novo automaticamente via 2captcha
                const captchaKey = process.env.CAPTCHA_API_KEY?.trim();
                if (captchaKey) {
                    try {
                        logger.warn(`Sala "${botFileName}": sem token disponível — gerando automaticamente via 2captcha...`);
                        logAndEmit(roomRecord.id, 'INFO', 'Token expirado — gerando novo token automaticamente via 2captcha...');

                        const channel = channelId
                            ? await client.channels.fetch(channelId).catch(() => null) as TextChannel | null
                            : null;

                        const generatingEmbed = new EmbedBuilder()
                            .setTitle('🔑 Gerando Novo Token Automaticamente')
                            .setDescription(`O token da sala **${botFileName}** expirou e não há tokens de reposição.\nGerando novo token via 2captcha... (pode levar até 60s)`)
                            .setColor('#E67E22')
                            .setTimestamp();

                        if (channel && 'send' in channel) await channel.send({ embeds: [generatingEmbed] }).catch(() => {});

                        const newTokenValue = await new HaxballTokenFetcher().fetch();
                        const newTokenRecord = await tokenRepo.register(newTokenValue);
                        logger.success(`Sala "${botFileName}": novo token gerado e registrado (${newTokenRecord.id}).`);
                        logAndEmit(roomRecord.id, 'SUCCESS', 'Novo token gerado automaticamente — reiniciando sala...');

                        restartToken = newTokenValue;
                        restartRetry = 0;
                    } catch (genErr: any) {
                        logger.error(`Sala "${botFileName}": falha ao gerar token automaticamente: ${genErr.message}`);
                        logAndEmit(roomRecord.id, 'CRASH', `Falha ao gerar token automaticamente: ${genErr.message}`);
                        await notifier.send('no-token-available',
                            new EmbedBuilder()
                                .setTitle('🔑 Falha ao Gerar Token Automaticamente')
                                .setColor('#E74C3C')
                                .setDescription(
                                    `A sala **${botFileName}** caiu, o token expirou e a geração automática falhou.\n\n` +
                                    `**Erro:** ${genErr.message}\n\n` +
                                    `Registre um novo token manualmente e use \`!open\` para reabrir.`
                                )
                                .setTimestamp()
                        );
                        return;
                    }
                } else {
                    logger.error(`Sala "${botFileName}": token expirado e nenhum token disponível. Encerrando.`);
                    logAndEmit(roomRecord.id, 'CRASH', 'Token expirado — nenhum token de reposição disponível');
                    await notifier.send('no-token-available',
                        new EmbedBuilder()
                            .setTitle('🔑 Sem Tokens Disponíveis')
                            .setColor('#E74C3C')
                            .setDescription(
                                `A sala **${botFileName}** caiu e o token expirou.\n` +
                                `Não há tokens de reposição disponíveis e \`CAPTCHA_API_KEY\` não está configurado.\n\n` +
                                `Registre um novo token em **haxball.com/headlesstoken** e use \`!open\` para reabrir.`
                            )
                            .setTimestamp()
                    );
                    return;
                }
            } else {
                restartToken = fallback.value;
                restartRetry = 0;
                logger.warn(`Sala "${botFileName}": token expirado. Reiniciando com token alternativo.`);
                logAndEmit(roomRecord.id, 'INFO', `Token expirado — usando token alternativo para reiniciar`);
            }
        } else if (retryCount >= MAX_RETRIES) {
            logger.error(`Sala "${botFileName}" atingiu o limite de ${MAX_RETRIES} reinicializações. Interrompendo.`);
            const fatalEmbed = new EmbedBuilder()
                .setTitle('💀 Sala Encerrada Definitivamente')
                .setColor('#E74C3C')
                .setDescription(
                    `A sala **${botFileName}** atingiu o limite de **${MAX_RETRIES}** reinicializações automáticas e foi encerrada permanentemente.\n\n` +
                    `**Último motivo:** ${crashReason}\n\n` +
                    `Use \`!open\` para reabri-la manualmente quando o problema for resolvido.`
                )
                .setTimestamp();
            try {
                const channel = await client.channels.fetch(channelId).catch(() => null) as TextChannel | null;
                if (channel && 'send' in channel) {
                    await channel.send({ embeds: [fatalEmbed] });
                } else {
                    await notifier.send('room-fatal', fatalEmbed);
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
                        : `A sala **${botFileName}** caiu inesperadamente.\n**Motivo:** ${crashReason}\nReiniciando... (tentativa **${restartRetry}/${MAX_RETRIES}**)`
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
                await notifier.send('room-restart', restartEmbed);
                const io        = getIO();
                const requestId = randomUUID();
                statusMsg       = io ? new WebStatusMessage(io, requestId) : { edit: async () => {} } as IStatusMessage;
            }
            await createPage(restartToken, statusMsg, botFileName, channelId, restartRetry);
        } catch (err: any) {
            logger.error(`Falha ao reiniciar a sala "${botFileName}": ${err.message}`);
        }
    });

    // ── 9. Injeção do script Haxball ──────────────────────────────────────────
    const botRecord = await botRepo.findByName(botFileName);
    if (!botRecord) {
        throw new Error(`Script "${botFileName}" não encontrado no banco. Rode: npx prisma db seed`);
    }
    const botCode = botRecord.scriptContent;

    try {
        await page.goto('https://www.haxball.com/headless', { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForFunction('typeof HBInit === "function"', { timeout: 30000 });

        await page.evaluate(`
            (function(name) {
                var origHBInit = window.HBInit;
                window.HBInit = function(config) {
                    var room = origHBInit(config);
                    var userHandler = null;
                    Object.defineProperty(room, 'onRoomLink', {
                        get: function() { return userHandler; },
                        set: function(fn) {
                            userHandler = function(url) {
                                window.sendLinkToDiscord(url, config.roomName || name);
                                if (typeof fn === 'function') fn(url);
                            };
                        },
                        configurable: true
                    });
                    return room;
                };
            })(${JSON.stringify(botFileName)})
        `);

        await page.evaluate((code: string, t: string) => {
            try {
                const runBot = new Function(
                    'haxToken',
                    'const module = { exports: {} }; ' + code + '; module.exports(haxToken);'
                );
                runBot(t);
            } catch (e: any) {
                (window as any).sendErrorToDiscord(e.message || 'Erro desconhecido no script');
            }
        }, botCode, token);

    } catch (e: any) {
        logger.error(`Falha ao iniciar sala "${botFileName}": ${e.message}`);
        // Libera o token e fecha o registro se o Puppeteer falhar antes do link
        crashReason = `falha na inicialização: ${e.message}`;
        await roomRepo.closeRoom(roomRecord.id, 'CRASHED').catch(() => {});
        await logRepo.add(roomRecord.id, 'CRASH', `Falha no Puppeteer: ${e.message}`).catch(() => {});
        if (!page.isClosed()) await page.close();
    }
}

// ─── Comandos Discord ─────────────────────────────────────────────────────────
client.on('messageCreate', async (msg) => {
    try {
        if (msg.author.bot || !msg.content.startsWith(PREFIX)) return;
        const args    = msg.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();
        if (command) {
            await handleCommands(msg, command, args, createPage);
        }
    } catch (err: any) {
        logger.error(`Erro ao processar comando: ${err.message}`);
    }
});

// ─── Restaura salas persistidas após reinício ──────────────────────────────────
// Lê do PostgreSQL (substitui o antigo rooms.json).
// Salas com status ONLINE no banco são aquelas que estavam rodando antes do
// bot parar — o token ainda está marcado como IN_USE, então podemos reabri-las
// diretamente sem passar pelo checkoutToken (que rejeitaria IN_USE).
client.once('clientReady', async (c) => {
    logger.success(`Bot Online: ${c.user.tag}`);
    startWebServer(createPage);

    // Elimina processos Chromium órfãos de uma execução anterior que não foi
    // encerrada limpa (crash do Node, kill -9, reinício abrupto do servidor).
    // Sem isso, múltiplos Chromium zumbis acumulam e levam a CPU a 100%.
    try {
        await execAsync("pkill -f 'chromium.*--no-sandbox' 2>/dev/null || true");
        logger.info('Limpeza inicial: processos Chromium órfãos encerrados.');
    } catch { /* não crítico */ }

    // Corrige tokens presos como IN_USE sem sala ativa — efeito de shutdown abrupto.
    const fixed = await tokenRepo.releaseOrphaned().catch(() => 0);
    if (fixed > 0) logger.warn(`Tokens órfãos no startup: ${fixed} token(s) sem sala ativa marcados como EXPIRED.`);

    const onlineRooms = await roomRepo.findAllOnline().catch(() => []);
    if (!onlineRooms.length) return;

    logger.info(`Restaurando ${onlineRooms.length} sala(s) do banco de dados...`);

    for (const record of onlineRooms) {
        // Token pode ter expirado enquanto o bot estava offline
        if (!record.token || record.token.status === 'EXPIRED') {
            await roomRepo.closeRoom(record.id, 'OFFLINE').catch(() => {});
            await logRepo.add(record.id, 'WARN', 'Sala não restaurada: token expirado ou ausente').catch(() => {});
            continue;
        }

        try {
            // Fecha o registro antigo (que ficou ONLINE quando o bot parou)
            // e libera o token — checkoutToken precisa encontrá-lo como AVAILABLE.
            await roomRepo.closeRoom(record.id, 'OFFLINE').catch(() => {});
            await logRepo.add(record.id, 'INFO', 'Sala encerrada por reinício do bot — será restaurada').catch(() => {});

            if (!record.channelId) continue;
            const channel = await client.channels.fetch(record.channelId).catch(() => null) as TextChannel | null;
            if (!channel || !('send' in channel)) continue;

            const restoreEmbed = new EmbedBuilder()
                .setTitle('🔄 Restaurando Sala')
                .setDescription(`Reabrindo **${record.scriptName}** após reinício do bot...`)
                .setColor('#E67E22');

            const statusMsg = await channel.send({ embeds: [restoreEmbed] });

            // createPage fará checkoutToken normalmente — o token já foi liberado acima.
            await createPage(record.token.value, statusMsg, record.scriptName, record.channelId);
            logger.success(`Sala "${record.scriptName}" restaurada com sucesso.`);
        } catch (err: any) {
            logger.error(`Falha ao restaurar sala "${record.scriptName}": ${err.message}`);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
