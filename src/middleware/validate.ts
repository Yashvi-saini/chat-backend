import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          requestId: req.id,
          details: errors,
        },
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
