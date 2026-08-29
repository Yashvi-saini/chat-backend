import type { Request, Response } from 'express';
import { messageService } from './message.service.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import type { SendMessageBody, GetMessagesQuery } from './message.validation.js';

/*POST /api/v1/conversations/:conversationId/messages */
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { conversationId } = req.params as { conversationId: string };

  const result = await messageService.sendMessage(
    userId,
    conversationId,
    req.body as SendMessageBody,
  );

  res.status(201).json({
    success: true,
    data: result,
  });
});

/* GET /api/v1/conversations/:conversationId/messages */
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { conversationId } = req.params as { conversationId: string };
  const { limit, cursor } = req.query as unknown as GetMessagesQuery;

  const result = await messageService.getMessages(
    userId,
    conversationId,
    Number(limit || 50),
    cursor ? String(cursor) : undefined,
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});
