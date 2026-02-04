import pino from 'pino';
import environment from '../config/environment';

const logger = pino({
    level: environment.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: environment.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
        },
    } : undefined,
    base: {
        env: environment.NODE_ENV,
    },
});

export default logger;
