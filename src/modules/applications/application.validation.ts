import { z } from 'zod';

export const createApplicationSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(100, 'name must be 100 characters or fewer'),
});

export type CreateApplicationBody = z.infer<typeof createApplicationSchema>;
