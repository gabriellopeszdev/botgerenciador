# Usa a versão estável do Node 22 (slim para ser mais leve)
FROM node:22-slim

# Instala o Chromium do sistema (evita incompatibilidade de pacotes no Bookworm)
# e dependências mínimas necessárias para rodar headless
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Diz ao Puppeteer para usar o Chromium do sistema em vez de baixar o próprio
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Define o diretório de trabalho dentro do contentor
WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (otimiza o cache do Docker)
COPY package*.json ./


# Instala as dependências do projeto
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Gera o Prisma client usando a versão local
RUN ./node_modules/.bin/prisma generate

# Aplica migrations pendentes e inicia o bot
CMD ["sh", "-c", "until ./node_modules/.bin/prisma migrate deploy; do echo 'Migration falhou, tentando em 5s...'; sleep 5; done && npm start"]
