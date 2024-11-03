export async function onRequest(context) {
    const { request, env } = context;

    if (!env.GITHUB_CLIENT_ID) {
        return new Response('GitHub Client ID is not configured', {
            status: 500
        });
    }

    try {
        const url = new URL(request.url);
        const redirectUrl = new URL('https://github.com/login/oauth/authorize');
        redirectUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
        redirectUrl.searchParams.set('redirect_uri', url.origin + '/api/callback');
        redirectUrl.searchParams.set('scope', 'repo user');
        redirectUrl.searchParams.set(
            'state',
            Array.from(crypto.getRandomValues(new Uint8Array(12))).join('')
        );
        return Response.redirect(redirectUrl.href, 301);
    } catch (error) {
        console.error('Auth error:', error);
        return new Response(`Authentication error: ${error.message}`, {
            status: 500
        });
    }
}
