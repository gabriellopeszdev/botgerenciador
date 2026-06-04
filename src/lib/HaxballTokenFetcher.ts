import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin   from 'puppeteer-extra-plugin-stealth';
import type { Page, Frame } from 'puppeteer';

puppeteerExtra.use(StealthPlugin());

const HAXBALL_URL = 'https://www.haxball.com/headlesstoken';
// Token format: thr1.XXXXXXXX.XXXXXXXX — inclui pontos internos
const TOKEN_REGEX = /thr\d?\.[A-Za-z0-9_.]{20,}/;

export class HaxballTokenFetcher {
    async fetch(): Promise<string> {
        const apiKey = process.env.CAPTCHA_API_KEY?.trim();

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
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                'Chrome/124.0.0.0 Safari/537.36',
            );
            await page.setViewport({ width: 1280, height: 800 });

            await page.goto(HAXBALL_URL, { waitUntil: 'networkidle2', timeout: 60_000 });

            if (apiKey) {
                await this.solveWith2Captcha(page, apiKey);
            } else {
                await this.solveWithStealth(page);
            }

            // Submete o formulário com o token já injetado no g-recaptcha-response
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

            return await this.waitForToken(page);
        } finally {
            await browser.close();
        }
    }

    /**
     * Resolve o reCAPTCHA via 2captcha API v2.
     * Extrai o sitekey da página, envia para 2captcha, aguarda resolução
     * e injeta o token de resposta no campo g-recaptcha-response.
     */
    private async solveWith2Captcha(page: Page, apiKey: string): Promise<void> {
        // 1. Aguarda o reCAPTCHA carregar e extrai o sitekey
        await page.waitForFunction(
            () => !!document.querySelector('[data-sitekey]'),
            { timeout: 30_000 },
        );
        const siteKey = await page.evaluate(
            () => (document.querySelector('[data-sitekey]') as HTMLElement | null)?.dataset.sitekey ?? null,
        );
        if (!siteKey) throw new Error('2captcha: sitekey do reCAPTCHA não encontrado na página.');

        // 2. Envia tarefa para o 2captcha API v2
        // RecaptchaV2EnterpriseTaskProxyless pois o Haxball usa reCAPTCHA Enterprise
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
        if (createData.errorId !== 0 || !createData.taskId) {
            throw new Error(`2captcha rejeitou a tarefa: ${createData.errorDescription ?? 'erro desconhecido'}`);
        }
        const taskId = createData.taskId;

        // 3. Aguarda resolução — espera inicial de 20s, depois poll a cada 5s (max 120s)
        await delay(20_000);
        let solvedToken: string | null = null;
        const deadline = Date.now() + 100_000;

        while (Date.now() < deadline) {
            const resultRes  = await fetch('https://api.2captcha.com/getTaskResult', {
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

            if (resultData.errorId !== 0) {
                throw new Error(`2captcha erro ao resolver: ${resultData.errorDescription ?? 'erro desconhecido'}`);
            }
            if (resultData.status === 'ready' && resultData.solution?.gRecaptchaResponse) {
                solvedToken = resultData.solution.gRecaptchaResponse;
                break;
            }
            await delay(5_000);
        }

        if (!solvedToken) throw new Error('2captcha: timeout de 120s aguardando resolução do captcha.');

        // 4. Injeta o token na página
        await page.evaluate((t: string) => {
            const ta = document.getElementById('g-recaptcha-response') as HTMLTextAreaElement | null;
            if (ta) { ta.style.display = 'block'; ta.value = t; }
        }, solvedToken);
    }

    /**
     * Tenta resolver o reCAPTCHA clicando diretamente no checkbox via Puppeteer stealth.
     * Funciona apenas quando o Google não exige desafio de imagem.
     */
    private async solveWithStealth(page: Page): Promise<void> {
        await page.waitForFunction(
            () => Array.from(document.querySelectorAll('iframe'))
                       .some(f => f.src.includes('recaptcha')),
            { timeout: 30_000 },
        );

        const rcFrame = await this.waitForCheckboxFrame(page, 12_000);
        if (!rcFrame) throw new Error('Frame do checkbox do reCAPTCHA não encontrado (timeout).');

        await rcFrame.waitForSelector('#recaptcha-anchor', { timeout: 10_000 });
        await rcFrame.click('#recaptcha-anchor');

        const passed = await this.waitForCaptchaResult(page, rcFrame);
        if (!passed) {
            throw new Error(
                'reCAPTCHA exigiu desafio de imagem e não há CAPTCHA_API_KEY configurado. ' +
                'Configure a chave do 2captcha no .env ou adicione o token manualmente.',
            );
        }
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
        const deadline = Date.now() + 20_000;
        while (Date.now() < deadline) {
            const text  = await page.evaluate(() => document.body.innerText ?? '');
            const match = TOKEN_REGEX.exec(text);
            if (match) return match[0];
            await delay(500);
        }
        throw new Error('Token não encontrado na página após envio do formulário.');
    }
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
