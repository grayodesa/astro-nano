import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { HOME, SITE } from "@consts";
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';

export async function GET() {
  const posts = (await getCollection("posts"))
    .filter(post => !post.data.draft);

  const items = [...posts]
    .sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf())
    .slice(0, 25);

  return rss({
    title: HOME.TITLE,
    description: HOME.DESCRIPTION,
    site: SITE.URL,
    items: items.map((item) => {
      const html = marked(item.body) as string;
      return {
        title: item.data.title || 'Untitled',
        description: sanitizeHtml(html, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt']
          }
        }),
        pubDate: item.data.date,
        link: `${SITE.URL}/${item.collection}/${item.slug}/`,
      };
    }),
  });
}
