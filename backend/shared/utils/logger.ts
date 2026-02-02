/**
 * Simple Logger Utility
 * Wraps console methods with timestamp and formatting
 */

const getTimestamp = () => new Date().toISOString();

export const logger = {
    info: (message: string, meta?: any) => {
        console.log(`[${getTimestamp()}] [INFO]: ${message}`, meta ? JSON.stringify(meta) : '');
    },

    error: (message: string, error?: any) => {
        console.error(`[${getTimestamp()}] [ERROR]: ${message}`, error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : '');
    },

    warn: (message: string, meta?: any) => {
        console.warn(`[${getTimestamp()}] [WARN]: ${message}`, meta ? JSON.stringify(meta) : '');
    },

    debug: (message: string, meta?: any) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(`[${getTimestamp()}] [DEBUG]: ${message}`, meta ? JSON.stringify(meta) : '');
        }
    }
};
