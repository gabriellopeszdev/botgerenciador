# Gerenciador de Salas Haxball

Bot Discord para abrir, monitorar e controlar múltiplas salas Haxball via Puppeteer, com persistência em PostgreSQL (Prisma) e isolamento de erros entre salas.

## Visão geral

Cada `!open` abre uma aba do Chromium (via Puppeteer) que carrega a página headless do Haxball e injeta o script da pasta `/bots`. O bot intercepta automaticamente o `onRoomLink` sem exigir modificações nos scripts e envia o link de entrada para o Discord via embed.

Toda a state das salas, tokens, métricas e logs é persistida em PostgreSQL através do Prisma, permitindo histórico completo de sessões, auditoria de ações e base para dashboards futuros.

## Arquitetura

```
Discord (commands)
      │
      ▼
  index.ts  ──►  manager.ts  ──►  browser.ts (Puppeteer / Chromium)
      │               │
      ▼               ▼
  commands.ts     persistence.ts
                      │
                      ▼
              repositories/
         ┌────────────────────────┐
         │  RoomRepository        │
         │  TokenRepository       │
         │  BotRepository         │
         │  LogRepository         │
         │  MetricRepository      │
         └────────────────────────┘
                      │
                      ▼
              PostgreSQL (Prisma)
```

### Modelos de banco

| Modelo | Descrição |
|---|---|
| `Room` | Sala ativa ou histórica — script, URL, status, jogadores, ping, retries |
| `Token` | Token Haxball com ciclo de vida (AVAILABLE / IN_USE / EXPIRED / RATE_LIMITED) |
| `Bot` | Catálogo dos scripts em `/bots` com conteúdo, nome in-game e descrição |
| `RoomLog` | Logs de eventos por sala (INFO, WARN, ERROR, CRASH, TOKEN_EXPIRED) |
| `AuditLog` | Auditoria de ações de usuários e do sistema (OPEN_ROOM, CLOSE_ROOM…) |
| `ServerMetric` | Snapshots de CPU, RAM e salas online — base para gráficos futuros |

## Pré-requisitos

- Node.js 22+
- PostgreSQL 14+
- Docker (opcional, recomendado para produção)
- Token do Discord Bot
- Token Haxball (obtido em [haxball.com/headlesstoken](https://www.haxball.com/headlesstoken))

## Instalação

```bash
git clone <url-do-repo>
cd testeSalas

npm install

# Aplica as migrations e gera o Prisma Client
npx prisma migrate deploy
npx prisma generate
```

## Configuração

Edite o arquivo `.env` na raiz do projeto:

```env
# Bot Discord
DISCORD_TOKEN=seu_token_aqui

# Prefixo dos comandos (padrão: !)
PREFIX=!

# Seu ID do Discord — apenas você poderá usar os comandos
# Discord > Configurações > Avançado > Modo Desenvolvedor ON > clique direito no usuário > Copiar ID
OWNER_ID=seu_id_aqui

# Limite máximo de salas abertas ao mesmo tempo (padrão: 10)
MAX_ROOMS=10

# Percentual de CPU que dispara o alerta de carga (padrão: 80)
CPU_ALERT_THRESHOLD=80

# String de conexão PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/haxball
```

## Scripts das salas

Coloque os arquivos `.js` na pasta `/bots`. Cada script deve exportar uma função que recebe o token:

```js
module.exports = function(haxToken) {
    var room = HBInit({
        roomName: "Minha Sala",
        maxPlayers: 16,
        public: true,
        token: haxToken
    });

    room.onRoomLink = function(url) {
        // O bot captura este evento automaticamente
        // e envia o link pro Discord
    };
};
```

Scripts disponíveis atualmente:
- `arenaZK` — Arena ZK
- `arenaCorno` — Arena Corno
- `salaTeste` — Sala de testes

## Executando

### Desenvolvimento

```bash
npm run dev
```

### Produção (local)

```bash
npm start
```

### Produção (Docker)

```bash
docker-compose up -d

# Logs em tempo real
docker-compose logs -f

# Parar
docker-compose down
```

O `docker-compose.yml` monta `/bots` como volume — edite os scripts sem reconstruir a imagem. Para ajustar o limite de memória, edite `mem_limit` (padrão: `1024m`).

## Comandos Discord

Todos os comandos exigem que seu ID esteja em `OWNER_ID`.

| Comando | Descrição |
|---|---|
| `!open <script> <token>` | Abre uma nova sala com o script indicado |
| `!bots` | Lista os scripts disponíveis em `/bots` |
| `!salas` | Lista salas ativas com jogadores e tempo online |
| `!players` | Contagem de jogadores por sala |
| `!close <índice>` | Encerra a sala pelo número da lista |
| `!closeall` | Encerra todas as salas de uma vez |
| `!broadcast <msg>` | Envia anúncio para todas as salas abertas |
| `!status` | RAM, CPU, uptime do bot + uptime individual e ping médio por sala |
| `!ping` | Latência do bot com o Discord |
| `!help` | Lista de comandos |

### Exemplo

```
!open arenaZK thr1.AAAAAGngMAiU2GrwmNpYRw.kqBhnFuxcRc
```

O bot responde com um embed de carregamento e, quando a sala estiver pronta, atualiza com o link de entrada.

## Funcionalidades de segurança e monitoramento

**Proteção de token** — O `!open` bloqueia automaticamente se o token já estiver em uso por outra sala ativa. Se uma sala cair com token inválido ou expirado, o bot envia uma DM ao `OWNER_ID` com o link para gerar um novo token.

**Alerta de carga** — Um loop interno verifica a CPU a cada 2 minutos. Se ultrapassar `CPU_ALERT_THRESHOLD`% o bot envia uma DM com RAM, CPU e número de salas ativas. Cooldown de 10 minutos evita spam.

**`!status` aprimorado** — Exibe uso de CPU com cor dinâmica (verde < 60%, laranja < 80%, vermelho ≥ 80%), uptime individual e ping médio por sala.

**Audit log** — Toda ação relevante (abrir/fechar sala, token expirado, comandos) é registrada em `AuditLog` com o ID do usuário Discord e contexto completo.

**Métricas de servidor** — Snapshots periódicos de CPU, RAM e salas online são gravados em `ServerMetric`, prontos para integração com dashboards.

## Estrutura do projeto

```
testeSalas/
├── bots/                        # Scripts das salas Haxball (.js)
│   ├── arenaZK.js
│   ├── arenaCorno.js
│   └── salaTeste.js
├── prisma/
│   ├── schema.prisma            # Modelos PostgreSQL (Room, Token, Bot, logs, métricas)
│   ├── migrations/              # Histórico de migrations
│   └── seed.ts                  # Dados iniciais
├── src/
│   ├── browser.ts               # Singleton do Puppeteer com auto-reconexão
│   ├── commands.ts              # Handlers dos comandos Discord
│   ├── manager.ts               # Registro em memória das salas ativas
│   ├── persistence.ts           # Camada de persistência (sincroniza memória ↔ banco)
│   ├── system.ts                # Monitoramento de CPU/RAM
│   ├── db/
│   │   └── prisma.ts            # Cliente Prisma singleton
│   ├── repositories/
│   │   ├── RoomRepository.ts
│   │   ├── TokenRepository.ts
│   │   ├── BotRepository.ts
│   │   ├── LogRepository.ts
│   │   ├── MetricRepository.ts
│   │   └── index.ts
│   └── lib/
│       └── logger.ts            # Logger colorido com timestamp
├── index.ts                     # Entry point — cliente Discord e ciclo de vida
├── dockerfile
├── docker-compose.yml
├── .env
├── package.json
└── tsconfig.json
```
