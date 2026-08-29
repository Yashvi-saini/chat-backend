import pino from 'pino';
import { env } from './env.js';

const logger = pino(
  env.nodeEnv === 'production'
    ? {
        level: 'info',
      }
    : {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      },
);

export default logger;
