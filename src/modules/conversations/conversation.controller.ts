import type { Request, Response } from 'express';
import { conversationService } from './conversation.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import type { CreateConversationBody } from './conversation.validation.js';

/* POST /api/v1/conversations */
export const createConversation = asyncHandler(async (req: Request, res: Response) => {
  const { userId, applicationId } = req.user!;
  const result = await conversationService.createConversation(
    userId,
    applicationId,
    req.body as CreateConversationBody,
  );
  res.status(201).json({
    success: true,
    data: result,
  });
});

/*GET /api/v1/conversations */
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const { userId, applicationId } = req.user!;
  const result = await conversationService.getUserConversations(userId, applicationId);
  res.status(200).json({
    success: true,
    data: result,
  });
});

/* GET /api/v1/conversations/:id */
export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const { userId, applicationId } = req.user!;
  const { id } = req.params as { id: string };
  const result = await conversationService.getConversationById(id, userId, applicationId);
  res.status(200).json({
    success: true,
    data: result,
  });
});
