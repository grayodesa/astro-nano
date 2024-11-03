export async function onRequest({ request, env }) {
  try {
    const url = new URL(request.url);
    // Remove /api/tina from the pathname to get the actual API path
    const apiPath = url.pathname.replace('/api/tina', '');
    const tinaApiUrl = `https://content.tinajs.io${apiPath}${url.search}`;
    
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