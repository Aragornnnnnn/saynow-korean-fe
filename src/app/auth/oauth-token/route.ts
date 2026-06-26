import { NextResponse } from 'next/server';
import type { SocialProvider } from '@/lib/api/auth';

type OAuthTokenRequest = {
  provider: SocialProvider;
  code: string;
  redirectUri: string;
  codeVerifier?: string;
};

type OAuthTokenResponse = {
  id_token?: string;
  idToken?: string;
  error?: string;
  error_description?: string;
};

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<OAuthTokenRequest>;

  if (!body.provider || !body.code || !body.redirectUri) {
    return NextResponse.json({ error: 'The request is missing required values.' }, { status: 400 });
  }

  try {
    const idToken = await exchangeCodeForIdToken(body as OAuthTokenRequest);
    return NextResponse.json({ idToken });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Social login token exchange failed.' },
      { status: 400 },
    );
  }
}

async function exchangeCodeForIdToken(body: OAuthTokenRequest) {
  const tokenResponse = await exchangeGoogleCode(body);

  const idToken = tokenResponse.id_token ?? tokenResponse.idToken;
  if (!idToken) {
    throw new Error(tokenResponse.error_description ?? tokenResponse.error ?? 'No ID token was returned.');
  }

  return idToken;
}

async function exchangeGoogleCode(body: OAuthTokenRequest) {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId) {
    throw new Error('Google OAuth client ID is not configured.');
  }
  if (!body.codeVerifier) {
    throw new Error('Google OAuth code verifier is missing.');
  }

  const params: Record<string, string> = {
    grant_type: 'authorization_code',
    client_id: clientId,
    code: body.code,
    redirect_uri: body.redirectUri,
    code_verifier: body.codeVerifier,
  };

  if (clientSecret) {
    params.client_secret = clientSecret;
  }

  return postTokenRequest(GOOGLE_TOKEN_URL, params);
}

async function postTokenRequest(url: string, params: Record<string, string>) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: new URLSearchParams(params),
  });
  const json = (await response.json()) as OAuthTokenResponse;

  if (!response.ok) {
    throw new Error(json.error_description ?? json.error ?? 'Social login token exchange failed.');
  }

  return json;
}
