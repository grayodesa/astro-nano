import { defineCollection, z } from 'astro:content';

const postsCollection = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string().optional(),
    date: z.union([
      z.date(),
      z.string().transform((str) => new Date(str))
    ]),
    source: z.string().optional(),
    description: z.string().optional(),
    draft: z.boolean().optional(),
    images: z.array(
      z.string()
        .transform((str) => {
          if (!str) return undefined;
          const imagePath = str.startsWith('/') ? str.slice(1) : str;
          return `/src/assets/${imagePath}`;
        })
        .pipe(image())
    ).optional(),
    url: z.string().optional(),
  })
});

export const collections = {
  posts: postsCollection,
};
