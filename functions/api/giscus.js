export async function onRequest(context) {
  const url = new URL(context.request.url);
  const term = url.searchParams.get('term');

  if (!term) {
    return new Response('Missing term parameter', { status: 400 });
  }

  try {
    const response = await fetch(
      `https://giscus.app/api/discussions?repo=grayodesa/tg-comments&term=${encodeURIComponent(term)}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 