import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../shared/utils/jwt.js';
import { AppError } from '../shared/errors/AppError.js';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication token required', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError('Authentication token missing', 401, 'UNAUTHORIZED');
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      applicationId: payload.applicationId,
    };
    next();
  } catch (_err) {
    throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
  }
}
