export async function onRequest({ request, env }) {
  const clientId = env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = env.OAUTH_GITHUB_CLIENT_SECRET;
  const url = new URL(request.url);
  
  // Handle the initial auth request
  if (url.pathname === '/admin/auth') {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user`;
    return Response.redirect(redirectUrl);
  }

  // Handle the callback
  if (url.pathname === '/admin/callback') {
    const code = url.searchParams.get('code');
    
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
    return Response.redirect(`/admin/#${data.access_token}`);
  }

  return new Response('Not Found', { status: 404 });
}