import puppeteer, { Browser } from 'puppeteer';
import { logger } from './lib/logger';

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

export function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)] ?? USER_AGENTS[0]!;
}

const ROOM_BROWSER_ARGS = [
    // Segurança / sandbox
    '--no-sandbox',
    '--disable-setuid-sandbox',
    // Memória e processo
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-zygote',
    '--js-flags=--max-old-space-size=256',
    // Anti-detecção
    '--disable-blink-features=AutomationControlled',
    '--disable-infobars',
    // Desabilita tudo que não é necessário para Haxball headless
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-domain-reliability',
    '--disable-features=IsolateOrigins,site-per-process,AudioServiceOutOfProcess,TranslateUI',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-renderer-backgrounding',
    '--disable-sync',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-first-run',
    '--password-store=basic',
    '--safebrowsing-disable-auto-update',
    '--use-mock-keychain',
];

let browserInstance: Browser | null = null;
// Promise pendente evita race condition: múltiplas salas abrindo ao mesmo tempo
// não lançam múltiplos processos do Chromium simultaneamente
let launchPromise: Promise<Browser> | null = null;

export async function getBrowser(): Promise<Browser> {
    if (browserInstance) return browserInstance;
    if (launchPromise) return launchPromise;

    const proxyUrl = process.env.PROXY_URL;

    launchPromise = puppeteer.launch({
        headless: true,
        args: [
            ...ROOM_BROWSER_ARGS,
            ...(proxyUrl ? [`--proxy-server=${proxyUrl}`] : []),
        ],
    }).then(browser => {
        browserInstance = browser;
        launchPromise = null;
        logger.success('Instância do navegador Chrome iniciada.');

        browser.on('disconnected', () => {
            browserInstance = null;
            launchPromise = null;
            logger.warn('Navegador desconectado. Será recriado na próxima requisição.');
        });

        return browser;
    }).catch(err => {
        launchPromise = null;
        throw err;
    });

    return launchPromise;
}

/**
 * Launches a fresh, isolated Chromium instance for a single room.
 * Each room gets its own process — a crash affects only that room.
 */
export async function launchRoomBrowser(): Promise<Browser> {
    const proxyUrl = process.env.PROXY_URL;
    return puppeteer.launch({
        headless: true,
        args: [
            ...ROOM_BROWSER_ARGS,
            ...(proxyUrl ? [`--proxy-server=${proxyUrl}`] : []),
        ],
    });
}

/**
 * Encerra o browser com timeout de 5s; se travar, força SIGKILL no processo.
 * Evita Chromium zumbi acumulando CPU quando browser.close() falha silenciosamente.
 */
export async function closeBrowser(browser: Browser): Promise<void> {
    const pid = browser.process()?.pid;
    try {
        await Promise.race([
            browser.close(),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('browser-close-timeout')), 5000)
            ),
        ]);
    } catch {
        if (pid) {
            try { process.kill(pid, 'SIGKILL'); } catch {}
        }
    }
}
