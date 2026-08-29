import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError.js';
import logger from '../config/logger.js';
import { env } from '../config/env.js';


export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {

  if (err instanceof AppError) {
    logger.warn(
      {
        requestId: req.id,
        errorCode: err.errorCode,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
      },
      err.message,
    );

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        requestId: req.id,
      },
    });
    return;
  }

  logger.error(
    {
      requestId: req.id,
      path: req.path,
      method: req.method,
      err, 
    },
    'Unhandled error',
  );

  const message =
    env.nodeEnv === 'development' && err instanceof Error
      ? err.message
      : 'An unexpected error occurred';

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      requestId: req.id,
    },
  });
}
