import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin   from 'puppeteer-extra-plugin-stealth';
import type { Page, Frame } from 'puppeteer';

puppeteerExtra.use(StealthPlugin());

const HAXBALL_URL = 'https://www.haxball.com/headlesstoken';
const TOKEN_REGEX = /thr\d?\.[A-Za-z0-9_.]{20,}/;

function log(msg: string) {
    console.log(`[TokenFetcher] ${new Date().toISOString()} ${msg}`);
}

export class HaxballTokenFetcher {
    async fetch(): Promise<string> {
        const apiKey = process.env.CAPTCHA_API_KEY?.trim();
        log(`Iniciando. CAPTCHA_API_KEY: ${apiKey ? `presente (${apiKey.slice(0,6)}...)` : 'ausente — modo stealth'}`);

        const browser = await puppeteerExtra.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
            ],
        });

        try {
            const page = await browser.newPage();

            page.on('console', m => log(`[browser-console] ${m.type()}: ${m.text()}`));
            page.on('pageerror', e => log(`[browser-error] ${e.message}`));
            page.on('framenavigated', f => { if (f === page.mainFrame()) log(`[navegação] → ${f.url()}`); });

            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                'Chrome/124.0.0.0 Safari/537.36',
            );
            await page.setViewport({ width: 1280, height: 800 });

            log(`Navegando para ${HAXBALL_URL} (timeout 60s)...`);
            await page.goto(HAXBALL_URL, { waitUntil: 'networkidle2', timeout: 60_000 });
            log('Página carregada.');

            if (apiKey) {
                await this.solveWith2Captcha(page, apiKey);
            } else {
                await this.solveWithStealth(page);
            }

            log('Disparando callback / submit do formulário...');
            await page.evaluate(() => {
                const cbAttr = document.querySelector('[data-callback]')?.getAttribute('data-callback');
                if (cbAttr && typeof (window as any)[cbAttr] === 'function') {
                    const resp = (document.getElementById('g-recaptcha-response') as HTMLTextAreaElement | null)?.value ?? '';
                    (window as any)[cbAttr](resp);
                    return;
                }
                const form = document.querySelector('form');
                if (form) { form.submit(); return; }
                document.querySelector<HTMLElement>('[type="submit"], button')?.click();
            });

            // Aguarda a navegação resultante do submit antes de ler o token
            log('Aguardando navegação pós-submit (até 15s)...');
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15_000 })
                .then(() => log(`Navegação concluída → ${page.url()}`))
                .catch(e  => log(`waitForNavigation ignorado (${e.message}) — lendo página atual`));

            return await this.waitForToken(page);
        } finally {
            await browser.close();
        }
    }

    private async solveWith2Captcha(page: Page, apiKey: string): Promise<void> {
        log('Aguardando [data-sitekey] carregar (30s)...');
        await page.waitForFunction(
            () => !!document.querySelector('[data-sitekey]'),
            { timeout: 30_000 },
        );

        const siteKey = await page.evaluate(
            () => (document.querySelector('[data-sitekey]') as HTMLElement | null)?.dataset.sitekey ?? null,
        );
        if (!siteKey) throw new Error('2captcha: sitekey do reCAPTCHA não encontrado na página.');
        log(`sitekey extraído: ${siteKey}`);

        log('Enviando tarefa para 2captcha (RecaptchaV2EnterpriseTaskProxyless)...');
        const createRes = await fetch('https://api.2captcha.com/createTask', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientKey: apiKey,
                task: {
                    type:       'RecaptchaV2EnterpriseTaskProxyless',
                    websiteURL: HAXBALL_URL,
                    websiteKey: siteKey,
                },
            }),
        });
        const createData = await createRes.json() as { errorId: number; taskId?: number; errorDescription?: string };
        log(`2captcha createTask resposta: errorId=${createData.errorId} taskId=${createData.taskId ?? 'N/A'} desc=${createData.errorDescription ?? '-'}`);

        if (createData.errorId !== 0 || !createData.taskId) {
            throw new Error(`2captcha rejeitou a tarefa: ${createData.errorDescription ?? 'erro desconhecido'}`);
        }
        const taskId = createData.taskId;

        log(`Tarefa criada (id=${taskId}). Aguardando 20s antes do primeiro poll...`);
        await delay(20_000);

        let solvedToken: string | null = null;
        const deadline = Date.now() + 100_000;
        let poll = 0;

        while (Date.now() < deadline) {
            poll++;
            const resultRes = await fetch('https://api.2captcha.com/getTaskResult', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientKey: apiKey, taskId }),
            });
            const resultData = await resultRes.json() as {
                errorId: number;
                status:  'processing' | 'ready';
                solution?: { gRecaptchaResponse: string };
                errorDescription?: string;
            };
            log(`Poll #${poll}: errorId=${resultData.errorId} status=${resultData.status}`);

            if (resultData.errorId !== 0) {
                throw new Error(`2captcha erro ao resolver: ${resultData.errorDescription ?? 'erro desconhecido'}`);
            }
            if (resultData.status === 'ready' && resultData.solution?.gRecaptchaResponse) {
                solvedToken = resultData.solution.gRecaptchaResponse;
                log(`Captcha resolvido! Token de resposta: ${solvedToken.slice(0, 30)}...`);
                break;
            }
            await delay(5_000);
        }

        if (!solvedToken) throw new Error('2captcha: timeout aguardando resolução do captcha.');

        log('Injetando token no g-recaptcha-response...');
        await page.evaluate((t: string) => {
            const ta = document.getElementById('g-recaptcha-response') as HTMLTextAreaElement | null;
            if (ta) { ta.style.display = 'block'; ta.value = t; }
        }, solvedToken);
        log('Token injetado.');
    }

    private async solveWithStealth(page: Page): Promise<void> {
        log('Modo stealth: aguardando iframe do reCAPTCHA (30s)...');
        await page.waitForFunction(
            () => Array.from(document.querySelectorAll('iframe'))
                       .some(f => f.src.includes('recaptcha')),
            { timeout: 30_000 },
        );
        log('iframe encontrado. Procurando frame do checkbox...');

        const rcFrame = await this.waitForCheckboxFrame(page, 12_000);
        if (!rcFrame) throw new Error('Frame do checkbox do reCAPTCHA não encontrado (timeout).');
        log('Frame do checkbox encontrado. Clicando...');

        await rcFrame.waitForSelector('#recaptcha-anchor', { timeout: 10_000 });
        await rcFrame.click('#recaptcha-anchor');
        log('Clique realizado. Aguardando resultado...');

        const passed = await this.waitForCaptchaResult(page, rcFrame);
        if (!passed) {
            throw new Error(
                'reCAPTCHA exigiu desafio de imagem e não há CAPTCHA_API_KEY configurado.',
            );
        }
        log('reCAPTCHA stealth: checkbox marcado com sucesso.');
    }

    private async waitForCheckboxFrame(page: Page, timeoutMs: number): Promise<Frame | undefined> {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            const frame = page.frames().find(f => {
                const url = f.url();
                return url.includes('recaptcha') && url.includes('anchor') && !url.includes('bframe');
            });
            if (frame) return frame;
            await delay(400);
        }
        return undefined;
    }

    private async waitForCaptchaResult(page: Page, rcFrame: Frame): Promise<boolean> {
        const deadline = Date.now() + 25_000;
        while (Date.now() < deadline) {
            const checked = await rcFrame.evaluate(() => {
                const el = document.querySelector('#recaptcha-anchor');
                return el?.getAttribute('aria-checked') === 'true';
            }).catch(() => false);
            if (checked) return true;

            const hasChallenge = page.frames().some(
                f => f.url().includes('recaptcha') && f.url().includes('bframe'),
            );
            if (hasChallenge) return false;

            await delay(500);
        }
        return false;
    }

    private async waitForToken(page: Page): Promise<string> {
        log(`Procurando token na página (${page.url()})...`);
        const deadline = Date.now() + 20_000;
        while (Date.now() < deadline) {
            const text = await page.evaluate(() => document.body.innerText ?? '').catch(() => '');
            if (text) log(`Conteúdo da página (primeiros 200 chars): ${text.slice(0, 200).replace(/\n/g, ' ')}`);
            const match = TOKEN_REGEX.exec(text);
            if (match) {
                log(`Token encontrado: ${match[0]}`);
                return match[0];
            }
            await delay(500);
        }
        throw new Error('Token não encontrado na página após envio do formulário.');
    }
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
