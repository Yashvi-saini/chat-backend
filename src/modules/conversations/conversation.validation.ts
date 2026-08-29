import { z } from 'zod';

const createDirectConversationSchema = z.object({
  type: z.literal('DIRECT'),
  recipientId: z.string().uuid('recipientId must be a valid UUID'),
});

const createGroupConversationSchema = z.object({
  type: z.literal('GROUP'),
  name: z.string().trim().min(1, 'Group name is required').max(100),
  memberIds: z
    .array(z.string().uuid('Each memberId must be a valid UUID'))
    .min(1, 'At least one additional member is required for a group conversation'),
});

export const createConversationSchema = z.discriminatedUnion('type', [
  createDirectConversationSchema,
  createGroupConversationSchema,
]);

export type CreateConversationBody = z.infer<typeof createConversationSchema>;
