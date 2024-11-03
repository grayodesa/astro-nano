export async function onRequest({ request, env }) {
  const clientId = env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = env.OAUTH_GITHUB_CLIENT_SECRET;

  // Handle OAuth requests
  const url = new URL(request.url);
  if (url.pathname === '/auth/github/callback') {
    // Handle the OAuth callback
    const code = url.searchParams.get('code');
    // Exchange code for token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const data = await tokenResponse.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Return 404 for other routes
  return new Response('Not Found', { status: 404 });
}