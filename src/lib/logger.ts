export const logger = {
    info: (msg: string) => console.log(`[${new Date().toLocaleTimeString()}] 🔵 [INFO]: ${msg}`),
    success: (msg: string) => console.log(`[${new Date().toLocaleTimeString()}] 🟢 [SUCCESS]: ${msg}`),
    warn: (msg: string) => console.warn(`[${new Date().toLocaleTimeString()}] 🟡 [WARN]: ${msg}`),
    error: (msg: string, err?: any) => {
        console.error(`[${new Date().toLocaleTimeString()}] 🔴 [ERROR]: ${msg}`);
        if (err) console.error(err);
    }
};