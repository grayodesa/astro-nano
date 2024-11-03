export async function onRequest({ request, env }) {
    try {
      const url = new URL(request.url);
      const tinaApiUrl = `https://content.tinajs.io${url.pathname}${url.search}`;
      
      // Forward the request to Tina's API
      return fetch(tinaApiUrl, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.TINA_TOKEN}`,
        },
        body: request.body,
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }