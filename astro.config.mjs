import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import Compress from "astro-compress";

export default defineConfig({
  site: "https://astro-nano-demo.vercel.app",
  integrations: [
    mdx(), 
    sitemap(), 
    tailwind(),
    Compress({
      img: true,
      css: true,
      js: true,
      html: false,
    })
  ],
  postsPerPage: 15,
  output: 'static',
  
  build: {
    inlineStylesheets: 'auto',
    splitting: true,
    moduleCache: true
  }
});
