import app from './app.js';
import { env } from './config/env.js';
import logger from './config/logger.js';

const server = app.listen(env.port, () => {
  logger.info({ port: env.port, env: env.nodeEnv }, `Server running on http://localhost:${env.port}`);
});


function shutdown(signal: string): void {
  logger.info(`${signal} received — starting graceful shutdown`);

  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Error during server close');
      process.exit(1);
    }

    logger.info('Server closed — process exiting');
    process.exit(0);
  });

  setTimeout(() => {
    logger.warn('Graceful shutdown timed out after 10s — forcing exit');
    process.exit(1);
  }, 10_000).unref(); // .unref() so this timer doesn't keep the process alive on its own
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;

