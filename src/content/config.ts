import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    source: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
});

export const collections = { posts: postsCollection };
