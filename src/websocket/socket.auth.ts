import type { Socket } from 'socket.io';
import { verifyAccessToken } from '../shared/utils/jwt.js';
import logger from '../config/logger.js';

export interface AuthenticatedSocketData {
  user: {
    userId: string;
    applicationId: string;
  };
}

export type AuthenticatedSocket = Socket<any, any, any, AuthenticatedSocketData>;

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void): void {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      logger.warn({ socketId: socket.id }, '[socket] Rejected connection: missing auth token');
      return next(new Error('Authentication token required'));
    }

    const payload = verifyAccessToken(token);
    socket.data.user = {
      userId: payload.userId,
      applicationId: payload.applicationId,
    };

    next();
  } catch (err) {
    logger.warn({ socketId: socket.id, error: err }, '[socket] Rejected connection: invalid token');
    next(new Error('Invalid or expired token'));
  }
}
