import type { Request, Response, NextFunction } from 'express';
import { applicationService } from './application.service.js';

/*POST /api/v1/applications */
export async function createApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name } = req.body as { name: unknown };

    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'name is required and must be a non-empty string',
          requestId: req.id,
        },
      });
      return;
    }

    const result = await applicationService.createApplication({ name });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err); // passes to globalErrorHandler
  }
}

/* GET /api/v1/applications/:id */
export async function getApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };

    const application = await applicationService.getApplicationById(id);

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (err) {
    next(err);
  }
}
