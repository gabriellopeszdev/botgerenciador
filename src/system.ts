import os from 'os';

/**
 * Calcula o uso de CPU em percentual tirando duas amostras com 500ms de intervalo.
 */
export function getCpuUsagePercent(): Promise<number> {
    return new Promise((resolve) => {
        const cpus1 = os.cpus();
        setTimeout(() => {
            const cpus2 = os.cpus();
            let totalIdle = 0, totalTick = 0;
            for (let i = 0; i < cpus1.length; i++) {
                const c1 = cpus1[i]!.times;
                const c2 = cpus2[i]!.times;
                for (const key of Object.keys(c1) as (keyof typeof c1)[]) {
                    totalTick += c2[key] - c1[key];
                }
                totalIdle += c2.idle - c1.idle;
            }
            const usage = totalTick === 0 ? 0 : 100 - (100 * totalIdle / totalTick);
            resolve(parseFloat(usage.toFixed(1)));
        }, 500);
    });
}
