function renderBody(status, content) {
    const html = `
    <script>
      const receiveMessage = (message) => {
        window.opener.postMessage(
          'authorization:github:${status}:${JSON.stringify(content)}',
          message.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    </script>
    `;
    return new Blob([html], { type: 'text/html' });
}

export async function onRequest(context) {
    const { request, env } = context;



    try {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const client_id = 'Ov23liZ5TIua5TWCaTnr';
        const client_secret = 'ca7aa3853da9389560c036f82cd5e30ec017464e';
        
        // Validate code parameter
        if (!code) {
            return new Response(renderBody('error', { error: 'No code provided' }), {
                headers: { 'content-type': 'text/html;charset=UTF-8' },
                status: 400
            });
        }

        const response = await fetch(
            'https://github.com/login/oauth/access_token',
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'user-agent': 'cloudflare-functions-github-oauth-login-demo',
                    'accept': 'application/json',
                },
                body: JSON.stringify({ client_id, client_secret, code }),
            },
        );
        const result = await response.json();
        if (result.error) {
            return new Response(renderBody('error', result), {
                headers: {
                    'content-type': 'text/html;charset=UTF-8',
                },
                status: 401 
            });
        }
        const token = result.access_token;
        const provider = 'github';
        const responseBody = renderBody('success', {
            token,
            provider,
        });
        return new Response(responseBody, { 
            headers: {
                'content-type': 'text/html;charset=UTF-8',
            },
            status: 200 
        });

    } catch (error) {
        console.error(error);
        return new Response(error.message, {
            headers: {
                'content-type': 'text/html;charset=UTF-8',
            },
            status: 500,
        });
    }
}
