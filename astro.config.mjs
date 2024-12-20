import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://tg.blognot.co",
  integrations: [
    mdx(), 
    sitemap(), 
    tailwind(),
 
  ],
  postsPerPage: 15,
  output: 'static',
  
  build: {
    inlineStylesheets: 'auto',
    splitting: true,
    moduleCache: true
  }
});
