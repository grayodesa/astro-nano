import { defineCollection, z } from "astro:content";
import { image } from "astro:assets";

const postsCollection = defineCollection({
  type: "content",
  schema: ({ image }) => z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    source: z.string().optional(),
    images: z.array(
      z.string()
        .transform((str) => {
          if (!str) return undefined;
          const imagePath = str.startsWith('/') ? str.slice(1) : str;
          return `/src/assets/${imagePath}`;
        })
        .pipe(image())
    ).optional(),
  }),
});

export const collections = { posts: postsCollection };
