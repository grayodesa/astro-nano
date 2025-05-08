import { defineCollection, z } from 'astro:content';

// Helper to handle empty or null string values
const emptyStringToUndefined = z.preprocess(
  (val) => (val === '' || val === null ? undefined : val),
  z.string().optional()
);

const postsCollection = defineCollection({
  schema: ({ image }) => z.object({
    title: emptyStringToUndefined,
    date: z.union([
      z.date(),
      z.string().transform((str) => new Date(str))
    ]),
    source: emptyStringToUndefined,
    description: emptyStringToUndefined,
    draft: z.boolean().optional(),
    forwarded_from: emptyStringToUndefined,
    images: z.preprocess(
      // Handle empty arrays, null, or undefined values
      (val) => {
        // If images is undefined, null, or an empty array, return an empty array
        if (!val || (Array.isArray(val) && val.length === 0) || 
            (Array.isArray(val) && val.some(item => item === null || item === ''))) {
          return [];
        }
        return val;
      },
      z.array(
        z.string()
          .transform((str) => {
            if (!str) return undefined;
            const imagePath = str.startsWith('/') ? str.slice(1) : str;
            return `/src/assets/${imagePath}`;
          })
          .pipe(image())
      )
    ).default([]),
    url: emptyStringToUndefined,
  })
});

export const collections = {
  posts: postsCollection,
};
