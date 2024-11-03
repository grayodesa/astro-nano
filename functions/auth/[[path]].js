export async function onRequest({ request, env }) {
  const clientId = env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = env.OAUTH_GITHUB_CLIENT_SECRET;
  const url = new URL(request.url);
  
  console.log('Auth function called:', url.pathname); // Debug log

  // Handle the initial auth request
  if (url.pathname.endsWith('/admin/auth')) {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user`;
    return Response.redirect(redirectUrl);
  }

  // Handle the callback
  if (url.pathname.endsWith('/admin/callback')) {
    const code = url.searchParams.get('code');
    
    try {
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
      
      if (data.error) {
        console.error('GitHub OAuth error:', data);
        return new Response(JSON.stringify(data), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Redirect back to the admin interface with the token
      return Response.redirect(`/admin/#access_token=${data.access_token}`);
    } catch (error) {
      console.error('Auth callback error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Return 404 for unhandled routes
  return new Response('Not Found', { 
    status: 404,
    headers: { 'Content-Type': 'text/plain' }
  });
}