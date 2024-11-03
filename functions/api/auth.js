export async function onRequest(context) {
    const { request, env } = context;

    const client_id = 'Ov23liZ5TIua5TWCaTnr';
    const client_secret = 'ca7aa3853da9389560c036f82cd5e30ec017464e';


    try {
        const url = new URL(request.url);
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
