import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  schema: z.object({
    date: z.date(),
    draft: z.boolean().optional().default(false),
    url: z.string().optional(),
    images: z.array(z.any()).optional(),
    imageAlts: z.array(z.string()).optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    source: z.string().optional()
  })
});

export const collections = {
  posts
};
