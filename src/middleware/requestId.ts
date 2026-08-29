import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';


export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-request-id'];
  const requestId =
    typeof incomingId === 'string' && incomingId.trim() !== ''
      ? incomingId.trim()
      : `req_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
}
