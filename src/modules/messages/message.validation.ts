import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message content cannot be empty').max(5000, 'Message exceeds 5000 characters limit'),
  messageType: z.enum(['TEXT', 'IMAGE', 'FILE', 'SYSTEM']).default('TEXT'),
  replyToId: z.string().uuid('replyToId must be a valid UUID').optional(),
});

export type SendMessageBody = z.infer<typeof sendMessageSchema>;

export const getMessagesQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type GetMessagesQuery = z.infer<typeof getMessagesQuerySchema>;
