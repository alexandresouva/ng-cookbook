import { z } from 'zod';

export const productDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number().default(0),
  category: z.string().default('Uncategorized'),
  createdAt: z.string(),
});

export type ProductDto = z.infer<typeof productDtoSchema>;
