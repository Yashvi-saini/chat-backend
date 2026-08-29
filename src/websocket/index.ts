import { Server as HttpServer } from 'http';
import { Server, ServerOptions } from 'socket.io';
import { socketAuthMiddleware, type AuthenticatedSocket } from './socket.auth.js';
import { registerSocketEvents } from './socket.events.js';
import { env } from '../config/env.js';
import logger from '../config/logger.js';

let ioInstance: Server | null = null;

export function initWebSocketServer(httpServer: HttpServer): Server {
  const options: Partial<ServerOptions> = {
    cors: {
      origin: env.corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  };

  const io = new Server(httpServer, options);

  // Register authentication middleware
  io.use(socketAuthMiddleware);

  // Register connection listener
  io.on('connection', (socket) => {
    registerSocketEvents(io, socket as AuthenticatedSocket);
  });

  ioInstance = io;
  logger.info('[socket] Socket.io WebSocket server initialized');
  return io;
}

export function getIO(): Server {
  if (!ioInstance) {
    throw new Error('Socket.io server has not been initialized');
  }
  return ioInstance;
}
