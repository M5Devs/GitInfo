interface EventContext<Env, P extends string, Data> {
  request: Request;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  waitUntil: (promise: Promise<any>) => void;
}

export interface Env {
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequest(context: EventContext<Env, any, any>): Promise<Response> {
  if (context.request.method === 'OPTIONS') {
    return onRequestOptions();
  }

  const url = new URL(context.request.url);
  let code = url.searchParams.get('code');

  if (!code && context.request.method === 'POST') {
    try {
      const body = await context.request.json<{ code?: string }>();
      code = body?.code || null;
    } catch {
      // Body parsing failed or empty
    }
  }

  if (!code) {
    return new Response(
      JSON.stringify({ error: 'Missing OAuth authorization code' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  const clientId = context.env.GITHUB_CLIENT_ID;
  const clientSecret = context.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(
      JSON.stringify({ error: 'GitHub OAuth is not configured on the server (missing Client ID or Secret).' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'GitInfo-OAuth-App',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json<{
      access_token?: string;
      token_type?: string;
      scope?: string;
      error?: string;
      error_description?: string;
    }>();

    if (tokenData.error || !tokenData.access_token) {
      return new Response(
        JSON.stringify({
          error: tokenData.error || 'Failed to obtain access token from GitHub',
          error_description: tokenData.error_description || 'Invalid or expired code',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        token_type: tokenData.token_type || 'bearer',
        scope: tokenData.scope || 'read:user',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: 'Failed to exchange authorization code with GitHub',
        details: err?.message || String(err),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}
