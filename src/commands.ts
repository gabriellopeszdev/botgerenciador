import { Message, EmbedBuilder } from 'discord.js';
import os from 'os';
import { manager } from './manager';
import { logger } from './lib/logger';
import { getCpuUsagePercent } from './system';
import { botRepo, logRepo, tokenRepo, roomRepo, allowedUserRepo } from './repositories/index';
import type { IStatusMessage } from './types';

type PageCreator = (token: string, statusMsg: IStatusMessage, botFileName: string, channelId: string) => Promise<void>;

function formatUptime(startedAt: Date): string {
    const totalSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

function formatProcessUptime(): string {
    const totalSeconds = Math.floor(process.uptime());
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

export default async function handleCommands(
    message: Message,
    command: string,
    args: string[],
    pageCreator: PageCreator
): Promise<void> {
    const createErrorEmbed = (title: string, description: string) =>
        new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor('#E74C3C')
            .setTimestamp();

    const ownerIds = (process.env.OWNER_ID ?? '').split(',').map(id => id.trim()).filter(Boolean);
    const isOwner = ownerIds.includes(message.author.id);
    if (!isOwner) {
        const allowed = await allowedUserRepo.isAllowed(message.author.id);
        if (!allowed) {
            return (void message.reply({
                embeds: [createErrorEmbed('🔒 Sem Permissão', 'Você não tem autorização para usar estes comandos.')]
            }));
        }
    }

    switch (command) {
        case 'ping': {
            const sent = await message.reply('🏓 Calculando...');
            const latency = sent.createdTimestamp - message.createdTimestamp;
            await sent.edit({
                content: '',
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🏓 Pong!')
                        .setColor('#3498DB')
                        .addFields(
                            { name: 'Latência', value: `${latency}ms`, inline: true },
                            { name: 'API Discord', value: `${message.client.ws.ping}ms`, inline: true }
                        )
                ]
            });
            break;
        }

        case 'help': {
            const helpEmbed = new EmbedBuilder()
                .setTitle('🛠️ Central de Comando - Gerenciador de Salas')
                .setDescription('Gerencie seus bots de Haxball diretamente pelo Discord.')
                .setColor('#F1C40F')
                .addFields(
                    { name: '🚀 `!open <script> <token>`', value: 'Inicia uma nova sala. O script deve estar na pasta `/bots`.' },
                    { name: '🔁 `!reload <índice>`', value: 'Fecha e reabre a sala com a versão mais recente do script.' },
                    { name: '📂 `!bots`', value: 'Lista todos os scripts disponíveis na pasta `/bots`.' },
                    { name: '🌐 `!salas`', value: 'Lista todas as salas online com jogadores e tempo de atividade.' },
                    { name: '🛑 `!close <índice>`', value: 'Encerra uma sala específica baseada no número da lista.' },
                    { name: '🔴 `!closeall`', value: 'Encerra todas as salas ativas de uma vez.' },
                    { name: '👥 `!players`', value: 'Verifica a quantidade de jogadores em cada sala ativa.' },
                    { name: '📢 `!broadcast <msg>`', value: 'Envia um aviso global para todas as salas abertas.' },
                    { name: '📊 `!status`', value: 'Exibe a saúde do servidor e uso de memória.' },
                    { name: '🏓 `!ping`', value: 'Verifica a latência do bot com o Discord.' },
                    { name: '📋 `!logs <índice>`', value: 'Exibe os últimos eventos de uma sala ativa.' },
                    { name: '🔑 `!tokens`', value: 'Lista todos os tokens e seus status atuais.' },
                    { name: '➕ `!addtoken <token>`', value: 'Cadastra ou reativa um token Haxball.' },
                    { name: '🗑️ `!removetoken <índice>`', value: 'Expira um token pelo índice do `!tokens`.' },
                    { name: '🔧 `!fixtokens`', value: 'Libera tokens presos como IN_USE sem sala ativa (somente dono).' },
                    { name: '📜 `!history`', value: 'Exibe as últimas 10 salas encerradas.' },
                    { name: '👥 `!users`', value: 'Lista os usuários do Discord autorizados a usar o bot.' },
                    { name: '➕ `!adduser <id> [apelido]`', value: 'Autoriza um usuário pelo ID do Discord (somente dono).' },
                    { name: '🗑️ `!removeuser <id>`', value: 'Remove a autorização de um usuário (somente dono).' }
                )
                .setFooter({ text: 'Gerenciador de Salas Haxball' });
            message.reply({ embeds: [helpEmbed] });
            break;
        }

        case 'status': {
            const salas = manager.listar();
            const [cpuPercent, roomPings] = await Promise.all([
                getCpuUsagePercent(),
                Promise.all(
                    salas.map(s =>
                        s.page.isClosed() ? Promise.resolve(null) :
                        s.page.evaluate(() => {
                            if (!(window as any).room) return null;
                            const players: any[] = (window as any).room.getPlayerList();
                            const pings = players.map((p: any) => p.ping).filter((p: number) => p > 0);
                            return pings.length
                                ? Math.round(pings.reduce((a: number, b: number) => a + b, 0) / pings.length)
                                : null;
                        }).catch(() => null)
                    )
                ),
            ]);

            const memUsage = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
            const cpuColor = cpuPercent > 80 ? '#E74C3C' : cpuPercent > 60 ? '#E67E22' : '#2ECC71';

            const statusEmbed = new EmbedBuilder()
                .setTitle('📊 Saúde do Servidor')
                .setColor(cpuColor as `#${string}`)
                .addFields(
                    { name: '💾 Memória RAM', value: `${memUsage} MB`, inline: true },
                    { name: '🖥️ CPU', value: `${cpuPercent}%`, inline: true },
                    { name: '🌐 Salas Ativas', value: `${salas.length}`, inline: true },
                    { name: '⏱️ Uptime do Bot', value: formatProcessUptime(), inline: true },
                )
                .setTimestamp();

            if (salas.length) {
                statusEmbed.addFields({ name: '\u200B', value: '**― Detalhe por Sala ―**', inline: false });
                salas.forEach((s, i) => {
                    const ping = roomPings[i];
                    statusEmbed.addFields({
                        name: `${i + 1}. ${s.name}`,
                        value: `📂 \`${s.botFile}.js\` · ⏱️ ${formatUptime(s.startedAt)} · 🏓 ${ping !== null ? `${ping}ms avg` : 'sem jogadores'}`,
                        inline: false,
                    });
                });
            }

            message.reply({ embeds: [statusEmbed] });
            break;
        }

        case 'bots': {
            const bots = await botRepo.findAllActive();
            if (!bots.length) {
                return (void message.reply({ embeds: [createErrorEmbed('📭 Sem Scripts', 'Nenhum script cadastrado no banco de dados.')] }));
            }
            const botsEmbed = new EmbedBuilder()
                .setTitle('📂 Scripts Disponíveis')
                .setColor('#3498DB')
                .setDescription(
                    bots.map((b, i) =>
                        `**${i + 1}.** \`${b.scriptName}\` — ${b.displayName}` +
                        (b.description ? `\n ↳ *${b.description}*` : '')
                    ).join('\n')
                )
                .setFooter({ text: 'Use !open <nome> <token> para abrir uma sala.' })
                .setTimestamp();
            message.reply({ embeds: [botsEmbed] });
            break;
        }

        case 'broadcast': {
            const broadcastMsg = args.join(' ');
            if (!broadcastMsg) {
                return (void message.reply({
                    embeds: [createErrorEmbed('⚠️ Erro de Argumento', 'Você precisa digitar a mensagem que deseja enviar.\n\n**Exemplo:** `!broadcast Olá a todos!`')]
                }));
            }
            const salasParaBroadcast = manager.listar();
            if (!salasParaBroadcast.length) {
                return (void message.reply({ embeds: [createErrorEmbed('📭 Sem Salas', 'Não há salas ativas para enviar a mensagem.')] }));
            }
            // Envia para todas as salas em paralelo (ignora páginas já fechadas)
            await Promise.all(
                salasParaBroadcast.map(s => {
                    if (s.page.isClosed()) return Promise.resolve();
                    return s.page.evaluate((m) => {
                        if ((window as any).room) (window as any).room.sendAnnouncement('[GLOBAL] ' + m, null, 0xFFEB3B, 'bold', 2);
                    }, broadcastMsg).catch((err: Error) => logger.warn(`Broadcast falhou na sala "${s.name}": ${err.message}`));
                })
            );
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('📢 Broadcast Enviado')
                        .setColor('#F39C12')
                        .addFields(
                            { name: 'Mensagem', value: broadcastMsg, inline: false },
                            { name: 'Salas Notificadas', value: `${salasParaBroadcast.length}`, inline: true }
                        )
                        .setTimestamp()
                ]
            });
            break;
        }

        case 'players': {
            const activeSalas = manager.listar();
            if (!activeSalas.length) {
                return (void message.reply({ embeds: [createErrorEmbed('📭 Sem Atividade', 'Não há nenhuma sala rodando no momento.')] }));
            }
            // Busca contagem de jogadores de todas as salas em paralelo (pula páginas fechadas)
            const counts = await Promise.all(
                activeSalas.map(s =>
                    s.page.isClosed() ? Promise.resolve(0) :
                    s.page.evaluate(() =>
                        (window as any).room ? (window as any).room.getPlayerList().length : 0
                    ).catch(() => 0)
                )
            );
            const playersEmbed = new EmbedBuilder()
                .setTitle('👥 Jogadores Online')
                .setColor('#9B59B6')
                .setTimestamp();
            activeSalas.forEach((s, i) => {
                playersEmbed.addFields({ name: `${i + 1}. ${s.name}`, value: `👤 **${counts[i]}** jogador(es)`, inline: false });
            });
            message.reply({ embeds: [playersEmbed] });
            break;
        }

        case 'open': {
            const maxRooms = parseInt(process.env.MAX_ROOMS || '10');
            if (manager.listar().length >= maxRooms) {
                return (void message.reply({
                    embeds: [createErrorEmbed('⚠️ Limite Atingido', `Já há **${maxRooms}** salas abertas simultaneamente.\nUse \`!close\` para encerrar uma antes de abrir outra.`)]
                }));
            }
            const [file, token] = args;
            if (!file || !token) {
                return (void message.reply({
                    embeds: [createErrorEmbed('⚠️ Comando Incompleto', 'Faltam informações para abrir a sala.\n\n**Uso:** `!open <nome_do_arquivo> <hax_token>`')]
                }));
            }
            if (manager.isTokenInUse(token)) {
                return (void message.reply({
                    embeds: [createErrorEmbed('🔑 Token em Uso', 'Este token já está sendo usado por uma sala ativa.\n\nUse `!salas` para ver quais salas estão abertas, ou `!close <índice>` para encerrar uma delas primeiro.')]
                }));
            }
            const bot = await botRepo.findByName(file);
            if (!bot) {
                return (void message.reply({
                    embeds: [createErrorEmbed('❌ Bot Não Encontrado', `O script \`${file}\` não está cadastrado no banco.\n\nUse \`!bots\` para ver os disponíveis.`)]
                }));
            }
            const loadingEmbed = new EmbedBuilder()
                .setTitle('⚙️ Iniciando Processo')
                .setDescription(`Preparando ambiente para o script **${file}**...\n\nAguardando o Haxball inicializar...`)
                .setColor('#E67E22');
            const statusMsg = await message.reply({ embeds: [loadingEmbed] });
            try {
                await pageCreator(token, statusMsg, file, message.channelId);
                logger.info(`Comando de abertura executado: ${file}`);
            } catch (err: any) {
                logger.error(`Falha ao abrir sala ${file}`, err);
                await statusMsg.edit({ embeds: [createErrorEmbed('💥 Erro Crítico', `Ocorreu uma falha ao tentar injetar o script.\n\n**Erro:** \`${err.message}\``)] });
            }
            break;
        }

        case 'close': {
            const targetRaw = args.join(' ').trim();
            if (!targetRaw) {
                return (void message.reply({
                    embeds: [createErrorEmbed('⚠️ Falta o Índice ou Nome', 'Informe o número (ex: `!close 1`) ou o nome da sala que deseja fechar (ex: `!close ARENA SPIRIT`).')]
                }));
            }

            let salaParaFechar = null as any;

            // Se o usuário passou um número, trata como índice
            if (/^\d+$/.test(targetRaw)) {
                const index = parseInt(targetRaw, 10) - 1;
                salaParaFechar = manager.buscarPorIndex(index);
                if (!salaParaFechar) {
                    return (void message.reply({
                        embeds: [createErrorEmbed('❌ Sala Inválida', `Não encontramos nenhuma sala com o índice **${targetRaw}**.\n\nUse \`!salas\` para ver a lista atual.`)]
                    }));
                }
            } else {
                // Procura por nome ou nome do script (case-insensitive / parcial)
                const q = targetRaw.toLowerCase();
                const todas = manager.listar();
                const matches = todas
                    .map((s, i) => ({ s, i }))
                    .filter(({ s }) =>
                        s.name.toLowerCase() === q ||
                        s.botFile.toLowerCase() === q ||
                        s.name.toLowerCase().includes(q) ||
                        s.botFile.toLowerCase().includes(q)
                    );

                if (matches.length === 0) {
                    return (void message.reply({
                        embeds: [createErrorEmbed('❌ Sala Inválida', `Não encontramos nenhuma sala com o nome **${targetRaw}**.\n\nUse \`!salas\` para ver a lista atual.`)]
                    }));
                }

                if (matches.length > 1) {
                    const list = matches.map(m => `**${m.i + 1}.** ${m.s.name} — \`${m.s.botFile}.js\``).join('\n');
                    return (void message.reply({
                        embeds: [createErrorEmbed('⚠️ Nome Ambíguo', `Foram encontradas múltiplas salas para **${targetRaw}**:\n\n${list}\n\nUse \`!close <índice>\` para encerrar a desejada.`)]
                    }));
                }

                salaParaFechar = matches[0]!.s;
            }

            const { name: salaName, botFile, startedAt } = salaParaFechar;
            salaParaFechar.manualClose = true;
            await salaParaFechar.page.close();
            logger.warn(`Sala encerrada manualmente: ${salaName}`);
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🛑 Sala Encerrada')
                        .setColor('#E74C3C')
                        .addFields(
                            { name: 'Nome', value: salaName, inline: true },
                            { name: 'Script', value: `\`${botFile}.js\``, inline: true },
                            { name: 'Ficou online por', value: formatUptime(startedAt), inline: true }
                        )
                        .setTimestamp()
                ]
            });
            break;
        }

        case 'closeall': {
            const todasParaFechar = manager.listar();
            if (!todasParaFechar.length) {
                return (void message.reply({ embeds: [createErrorEmbed('📭 Sem Salas', 'Não há salas ativas para encerrar.')] }));
            }
            // Marca todas como fechamento manual antes de fechar (evita auto-restart)
            todasParaFechar.forEach(s => { s.manualClose = true; });
            await Promise.all(todasParaFechar.map(s => s.page.close().catch(() => {})));
            logger.warn(`Todas as ${todasParaFechar.length} sala(s) foram encerradas manualmente.`);
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🔴 Todas as Salas Encerradas')
                        .setColor('#E74C3C')
                        .setDescription(`**${todasParaFechar.length}** sala(s) foram encerradas com sucesso.`)
                        .addFields(
                            { name: 'Salas encerradas', value: todasParaFechar.map((s, i) => `**${i + 1}.** ${s.name}`).join('\n'), inline: false }
                        )
                        .setTimestamp()
                ]
            });
            break;
        }

        case 'reload': {
            const targetId = args[0];
            if (!targetId) {
                return (void message.reply({
                    embeds: [createErrorEmbed('⚠️ Falta o Índice', 'Informe o número da sala que deseja recarregar.\n\n**Uso:** `!reload <índice>`')]
                }));
            }
            const index = parseInt(targetId) - 1;
            const salaParaReload = manager.buscarPorIndex(index);
            if (!salaParaReload) {
                return (void message.reply({
                    embeds: [createErrorEmbed('❌ Sala Inválida', `Não encontramos nenhuma sala com o índice **${targetId}**.\n\nUse \`!salas\` para ver a lista atual.`)]
                }));
            }
            const { token: salaToken, botFile: salaFile, channelId } = salaParaReload;
            salaParaReload.manualClose = true;
            await salaParaReload.page.close();
            // Aguarda o handler assíncrono de close liberar o token no banco antes de recheckout.
            // 400ms era insuficiente com banco remoto ou CPU alta — aumentado para 1500ms.
            await new Promise(resolve => setTimeout(resolve, 1500));

            const reloadEmbed = new EmbedBuilder()
                .setTitle('🔁 Recarregando Sala')
                .setDescription(`Reiniciando **${salaFile}** com a versão mais recente do script...`)
                .setColor('#E67E22');
            const statusMsg = await message.reply({ embeds: [reloadEmbed] });
            try {
                await pageCreator(salaToken, statusMsg, salaFile, channelId);
                logger.info(`Sala "${salaFile}" recarregada manualmente.`);
            } catch (err: any) {
                logger.error(`Falha ao recarregar sala "${salaFile}": ${err.message}`);
                await statusMsg.edit({ embeds: [createErrorEmbed('💥 Erro ao Recarregar', `\`${err.message}\``)] });
            }
            break;
        }

        case 'salas': {
            const todasSalas = manager.listar();
            if (!todasSalas.length) {
                return (void message.reply({ embeds: [createErrorEmbed('📭 Lista Vazia', 'Nenhuma sala está sendo gerenciada no momento.')] }));
            }
            // Busca contagem de jogadores de todas as salas em paralelo (pula páginas fechadas)
            const counts = await Promise.all(
                todasSalas.map(s =>
                    s.page.isClosed() ? Promise.resolve(0) :
                    s.page.evaluate(() =>
                        (window as any).room ? (window as any).room.getPlayerList().length : 0
                    ).catch(() => 0)
                )
            );
            const listaEmbed = new EmbedBuilder()
                .setTitle('🌐 Salas Gerenciadas')
                .setColor('#2ECC71')
                .setFooter({ text: `Total de ${todasSalas.length} sala(s) online.` })
                .setTimestamp();
            todasSalas.forEach((s, i) => {
                listaEmbed.addFields({
                    name: `${i + 1}. ${s.name}`,
                    value: `🔗 [Entrar na Sala](${s.url})\n👤 **${counts[i]}** jogador(es) · ⏱️ Online há **${formatUptime(s.startedAt)}**\n📂 \`${s.botFile}.js\``,
                    inline: false
                });
            });
            message.reply({ embeds: [listaEmbed] });
            break;
        }

        case 'addtoken': {
            const newToken = args[0];
            if (!newToken) {
                return (void message.reply({
                    embeds: [createErrorEmbed('⚠️ Falta o Token', 'Informe o valor do token.\n\n**Uso:** `!addtoken <hax_token>`')]
                }));
            }
            try {
                const t = await tokenRepo.register(newToken);
                const isNew = t.lastUsedAt === null;
                message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(isNew ? '✅ Token Cadastrado' : '♻️ Token Reativado')
                            .setColor('#2ECC71')
                            .setDescription(isNew
                                ? 'O token foi cadastrado e está disponível para uso.'
                                : 'O token já existia e foi reativado para **AVAILABLE**.')
                            .setTimestamp()
                    ]
                });
            } catch (err: any) {
                message.reply({ embeds: [createErrorEmbed('❌ Erro', err.message)] });
            }
            break;
        }

        case 'removetoken': {
            const rmTarget = args[0];
            if (!rmTarget || !/^\d+$/.test(rmTarget)) {
                return (void message.reply({
                    embeds: [createErrorEmbed('⚠️ Falta o Índice', 'Informe o número do token (veja `!tokens`).\n\n**Uso:** `!removetoken <índice>`')]
                }));
            }
            const allTk = await tokenRepo.listAll();
            const tkIndex = parseInt(rmTarget, 10) - 1;
            const tkToRemove = allTk[tkIndex];
            if (!tkToRemove) {
                return (void message.reply({
                    embeds: [createErrorEmbed('❌ Índice Inválido', `Não há token no índice **${rmTarget}**. Use \`!tokens\` para ver a lista.`)]
                }));
            }
            if (tkToRemove.status === 'IN_USE') {
                return (void message.reply({
                    embeds: [createErrorEmbed('⚠️ Token em Uso', 'Este token está sendo usado por uma sala ativa.\nEncerrre a sala primeiro com `!close` e depois remova o token.')]
                }));
            }
            await tokenRepo.markAsExpired(tkToRemove.id);
            const masked = tkToRemove.value.length > 8
                ? `${tkToRemove.value.slice(0, 4)}••••${tkToRemove.value.slice(-4)}`
                : '••••••••';
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('🗑️ Token Expirado')
                        .setColor('#E74C3C')
                        .setDescription(`O token \`${masked}\` foi marcado como **EXPIRED** e não pode mais ser usado.`)
                        .setTimestamp()
                ]
            });
            break;
        }

        case 'history': {
            const recentRooms = await roomRepo.findRecent(10);
            if (!recentRooms.length) {
                return (void message.reply({
                    embeds: [createErrorEmbed('📭 Sem Histórico', 'Nenhuma sala encerrada encontrada no banco.')]
                }));
            }
            const historyEmbed = new EmbedBuilder()
                .setTitle('📜 Histórico de Salas')
                .setColor('#95A5A6')
                .setFooter({ text: `Últimas ${recentRooms.length} salas encerradas` })
                .setTimestamp();

            recentRooms.forEach((r, i) => {
                const statusEmoji = r.status === 'CRASHED' ? '💥' : '🔴';
                const duration = r.finishedAt
                    ? Math.round((r.finishedAt.getTime() - r.startedAt.getTime()) / 60000)
                    : null;
                const durationStr = duration !== null ? `${duration}min` : '—';
                const date = r.startedAt.toLocaleDateString('pt-BR');
                historyEmbed.addFields({
                    name: `${i + 1}. ${r.roomName}`,
                    value: `${statusEmoji} **${r.status}** · 📂 \`${r.scriptName}.js\` · ⏱️ ${durationStr} · 📅 ${date}`,
                    inline: false,
                });
            });
            message.reply({ embeds: [historyEmbed] });
            break;
        }

        case 'logs': {
            const logTarget = args[0];
            if (!logTarget || !/^\d+$/.test(logTarget)) {
                return (void message.reply({
                    embeds: [createErrorEmbed('⚠️ Falta o Índice', 'Informe o número da sala.\n\n**Uso:** `!logs <índice>`')]
                }));
            }
            const logIndex = parseInt(logTarget, 10) - 1;
            const salaLogs = manager.buscarPorIndex(logIndex);
            if (!salaLogs) {
                return (void message.reply({
                    embeds: [createErrorEmbed('❌ Sala Inválida', `Não encontramos nenhuma sala com o índice **${logTarget}**.\n\nUse \`!salas\` para ver a lista atual.`)]
                }));
            }
            const roomLogs = await logRepo.findByRoom(salaLogs.dbId, 10);
            if (!roomLogs.length) {
                return (void message.reply({
                    embeds: [createErrorEmbed('📭 Sem Logs', 'Nenhum log registrado para esta sala.')]
                }));
            }
            const typeEmoji: Record<string, string> = {
                INFO: 'ℹ️', WARN: '⚠️', ERROR: '❌', CRASH: '💥', TOKEN_EXPIRED: '🔑', COMMAND: '🖥️',
            };
            const logsEmbed = new EmbedBuilder()
                .setTitle(`📋 Logs — ${salaLogs.name}`)
                .setColor('#3498DB')
                .setDescription(
                    roomLogs.map(l => {
                        const emoji = typeEmoji[l.type] ?? '•';
                        const ts = new Date(l.createdAt).toLocaleTimeString('pt-BR');
                        return `${emoji} \`${ts}\` ${l.message}`;
                    }).join('\n')
                )
                .setFooter({ text: `Últimos ${roomLogs.length} eventos · ${salaLogs.botFile}.js` })
                .setTimestamp();
            message.reply({ embeds: [logsEmbed] });
            break;
        }

        case 'tokens': {
            const allTokens = await tokenRepo.listAll();
            if (!allTokens.length) {
                return (void message.reply({
                    embeds: [createErrorEmbed('📭 Sem Tokens', 'Nenhum token cadastrado no banco.')]
                }));
            }
            const statusEmoji: Record<string, string> = {
                AVAILABLE: '🟢', IN_USE: '🔵', EXPIRED: '🔴', RATE_LIMITED: '🟡',
            };
            const tokensEmbed = new EmbedBuilder()
                .setTitle('🔑 Tokens Cadastrados')
                .setColor('#9B59B6')
                .setDescription(
                    allTokens.map((t, i) => {
                        const emoji = statusEmoji[t.status] ?? '⚪';
                        const masked = t.value.length > 8
                            ? `${t.value.slice(0, 4)}••••${t.value.slice(-4)}`
                            : '••••••••';
                        return `**${i + 1}.** ${emoji} \`${masked}\` — **${t.status}**`;
                    }).join('\n')
                )
                .setFooter({ text: `${allTokens.length} token(s) no banco` })
                .setTimestamp();
            message.reply({ embeds: [tokensEmbed] });
            break;
        }

        case 'adduser': {
            if (!isOwner) {
                return (void message.reply({
                    embeds: [createErrorEmbed('🔒 Sem Permissão', 'Apenas o dono do bot pode adicionar usuários autorizados.')]
                }));
            }
            const [newDiscordId, ...labelParts] = args;
            if (!newDiscordId || !/^\d{17,20}$/.test(newDiscordId)) {
                return (void message.reply({
                    embeds: [createErrorEmbed('⚠️ ID Inválido', 'Informe um ID do Discord válido.\n\n**Uso:** `!adduser <discord_id> [apelido]`')]
                }));
            }
            const label = labelParts.join(' ') || undefined;
            const { created } = await allowedUserRepo.add(newDiscordId, label);
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(created ? '✅ Usuário Autorizado' : '⚠️ Já Cadastrado')
                        .setColor(created ? '#2ECC71' : '#E67E22')
                        .setDescription(
                            created
                                ? `O ID \`${newDiscordId}\`${label ? ` (${label})` : ''} agora pode usar os comandos do bot.`
                                : `O ID \`${newDiscordId}\` já está na lista de autorizados.`
                        )
                        .setTimestamp()
                ]
            });
            break;
        }

        case 'removeuser': {
            if (!isOwner) {
                return (void message.reply({
                    embeds: [createErrorEmbed('🔒 Sem Permissão', 'Apenas o dono do bot pode remover usuários autorizados.')]
                }));
            }
            const targetDiscordId = args[0];
            if (!targetDiscordId || !/^\d{17,20}$/.test(targetDiscordId)) {
                return (void message.reply({
                    embeds: [createErrorEmbed('⚠️ ID Inválido', 'Informe um ID do Discord válido.\n\n**Uso:** `!removeuser <discord_id>`')]
                }));
            }
            const removed = await allowedUserRepo.remove(targetDiscordId);
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(removed ? '🗑️ Usuário Removido' : '❌ Não Encontrado')
                        .setColor(removed ? '#E74C3C' : '#95A5A6')
                        .setDescription(
                            removed
                                ? `O ID \`${targetDiscordId}\` foi removido e não pode mais usar os comandos.`
                                : `O ID \`${targetDiscordId}\` não estava na lista de autorizados.`
                        )
                        .setTimestamp()
                ]
            });
            break;
        }

        case 'users': {
            const authorizedUsers = await allowedUserRepo.listAll();
            const embed = new EmbedBuilder()
                .setTitle('👥 Usuários Autorizados')
                .setColor('#9B59B6')
                .setTimestamp();
            if (!authorizedUsers.length) {
                embed.setDescription('Nenhum usuário extra autorizado além do dono.');
            } else {
                embed.setDescription(
                    authorizedUsers.map((u, i) =>
                        `**${i + 1}.** \`${u.discordId}\`${u.label ? ` — ${u.label}` : ''}`
                    ).join('\n')
                ).setFooter({ text: `${authorizedUsers.length} usuário(s) cadastrado(s)` });
            }
            message.reply({ embeds: [embed] });
            break;
        }

        case 'fixtokens': {
            if (!isOwner) {
                return (void message.reply({
                    embeds: [createErrorEmbed('🔒 Sem Permissão', 'Apenas o dono do bot pode executar este comando.')]
                }));
            }
            const fixed = await tokenRepo.releaseOrphaned();
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(fixed > 0 ? '🔧 Tokens Corrigidos' : '✅ Nenhum Token Preso')
                        .setColor(fixed > 0 ? '#E67E22' : '#2ECC71')
                        .setDescription(
                            fixed > 0
                                ? `**${fixed}** token(s) estavam presos como \`IN_USE\` sem sala ativa e foram marcados como \`EXPIRED\`.`
                                : 'Todos os tokens estão consistentes. Nenhuma correção necessária.'
                        )
                        .setTimestamp()
                ]
            });
            break;
        }

        default:
            message.reply('❓ Comando desconhecido. Use `!help` para ver a lista de comandos disponíveis.');
            break;
    }
}
