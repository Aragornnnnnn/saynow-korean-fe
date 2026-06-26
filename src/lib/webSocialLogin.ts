import type { SocialProvider } from './api/auth';
import { generateRandomHex } from './crypto';

type PendingSocialLogin = {
  provider: SocialProvider;
  nonce: string;
  state: string;
  redirectUri: string;
  codeVerifier?: string;
};

export const SOCIAL_LOGIN_STORAGE_KEY = 'landit-social-login';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export async function startWebSocialLogin(provider: SocialProvider, nonce: string) {
  const state = generateRandomHex(16);
  const redirectUri = getRedirectUri(provider);
  const codeVerifier = provider === 'GOOGLE' ? generateCodeVerifier() : undefined;
  const codeChallenge = codeVerifier ? await createCodeChallenge(codeVerifier) : undefined;

  const pending: PendingSocialLogin = {
    provider,
    nonce,
    state,
    redirectUri,
    codeVerifier,
  };
  sessionStorage.setItem(SOCIAL_LOGIN_STORAGE_KEY, JSON.stringify(pending));

  window.location.assign(createGoogleAuthorizationUrl(pending, codeChallenge));
}

export function readPendingSocialLogin(): PendingSocialLogin | null {
  const raw = sessionStorage.getItem(SOCIAL_LOGIN_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingSocialLogin;
  } catch {
    return null;
  }
}

export function clearPendingSocialLogin() {
  sessionStorage.removeItem(SOCIAL_LOGIN_STORAGE_KEY);
}

function createGoogleAuthorizationUrl(
  pending: PendingSocialLogin,
  codeChallenge?: string,
) {
  const clientId = firstNonEmpty(
    process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  );

  if (!clientId) {
    throw new Error('The Google OAuth client ID is not configured.');
  }
  if (!codeChallenge) {
    throw new Error('Failed to generate the Google OAuth code challenge.');
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: pending.redirectUri,
    scope: 'openid email profile',
    nonce: pending.nonce,
    state: pending.state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

function getRedirectUri(provider: SocialProvider) {
  const configured = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
  const currentOriginRedirectUri = `${window.location.origin}/auth/${provider.toLowerCase()}/callback`;

  if (!configured) return currentOriginRedirectUri;

  try {
    const configuredUrl = new URL(configured);
    const currentHostname = window.location.hostname;

    if (
      isLoopbackHostname(configuredUrl.hostname) &&
      configuredUrl.hostname !== currentHostname &&
      (isLoopbackHostname(currentHostname) || isPrivateLanHostname(currentHostname))
    ) {
      return currentOriginRedirectUri;
    }
  } catch {
    return currentOriginRedirectUri;
  }

  return configured;
}

function isLoopbackHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function isPrivateLanHostname(hostname: string) {
  return (
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}


function generateCodeVerifier() {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
}

async function createCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function firstNonEmpty(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean);
}
