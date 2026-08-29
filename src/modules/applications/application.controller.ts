import type { Request, Response } from 'express';
import { applicationService } from './application.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import type { CreateApplicationBody } from './application.validation.js';

/* POST /api/v1/applications */
export const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body as CreateApplicationBody;
  const result = await applicationService.createApplication({ name });
  res.status(201).json({ success: true, data: result });
});

/* GET /api/v1/applications/:id */
export const getApplication = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const application = await applicationService.getApplicationById(id);
  res.status(200).json({ success: true, data: application });
});
