import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

export default defineConfig({
  site: "https://astro-nano-demo.vercel.app",
  integrations: [
    mdx(), 
    sitemap(), 
    tailwind(),
 
  ],
  postsPerPage: 15,
  output: 'server',
  adapter: node({
    mode: "standalone"
  }),
  
  build: {
    inlineStylesheets: 'auto',
    splitting: true,
    moduleCache: true
  }
});
