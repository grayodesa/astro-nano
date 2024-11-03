export async function onRequest(context) {
    const { request, env } = context;

    


    try {
        const url = new URL(request.url);
        const client_id = 'Ov23liZ5TIua5TWCaTnr';
        const redirectUrl = new URL('https://github.com/login/oauth/authorize');
        redirectUrl.searchParams.set('client_id', client_id);
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
