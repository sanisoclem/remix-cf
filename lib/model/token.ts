import { z } from 'zod';

export const tokenPayloadSchema = z.object({
  userId: z.string(),
  allow: z.boolean(),
  name: z.string()
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
