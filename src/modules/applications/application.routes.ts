import { Router } from 'express';
import { createApplication, getApplication } from './application.controller.js';

const router = Router();

// POST /api/v1/applications — create a new application (tenant)
router.post('/', createApplication);

// GET /api/v1/applications/:id — get application by ID
router.get('/:id', getApplication);

export default router;
