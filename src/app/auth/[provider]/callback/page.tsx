'use client';

import { Suspense, use, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { socialLogin, type SocialProvider } from '@/lib/api';
import {
  clearPendingSocialLogin,
  readPendingSocialLogin,
} from '@/lib/webSocialLogin';
import { useAuthStore } from '@/store/authStore';
import { updateNativeAuthSession } from '@/bridge/commands';
import { shouldShowOnboarding } from '@/lib/onboarding';
import { track, EVENTS } from '@/lib/analytics';

export default function SocialCallbackPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const { provider } = use(params);

  return (
    <Suspense fallback={<CallbackLoading />}>
      <SocialCallbackContent provider={provider.toUpperCase()} />
    </Suspense>
  );
}

function SocialCallbackContent({ provider }: { provider: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    let cancelled = false;

    async function completeLogin() {
      function redirectWithError(message: string) {
        clearPendingSocialLogin();
        router.replace(`/login?error=${encodeURIComponent(message)}`);
      }

      try {
        if (!isSocialProvider(provider)) {
          return redirectWithError('This social login provider is not supported.');
        }

        const error = searchParams.get('error');
        if (error) {
          // 사용자가 취소한 경우 — 에러 메시지 없이 복귀
          if (error === 'access_denied') {
            clearPendingSocialLogin();
            router.replace('/login');
            return;
          }
          return redirectWithError('Social login was canceled.');
        }

        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const pending = readPendingSocialLogin();

        if (!code || !state || !pending) {
          return redirectWithError('We couldn’t find your login request. Please try again.');
        }
        if (pending.provider !== provider || pending.state !== state) {
          return redirectWithError('Login request verification didn’t match.');
        }

        const tokenResponse = await fetch('/auth/oauth-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            code,
            redirectUri: pending.redirectUri,
            codeVerifier: pending.codeVerifier,
          }),
        });
        const tokenJson = (await tokenResponse.json()) as { idToken?: string; error?: string };

        if (!tokenResponse.ok || !tokenJson.idToken) {
          return redirectWithError(tokenJson.error ?? 'Social login token exchange failed.');
        }

        const data = await socialLogin(provider, tokenJson.idToken, pending.nonce);
        if (cancelled) return;

        clearPendingSocialLogin();
        track(EVENTS.LOGIN_COMPLETED, { provider: data.user.provider.toLowerCase() });
        setAuth(data.accessToken, data.refreshToken, data.user);
        updateNativeAuthSession(data.accessToken, data.refreshToken, data.user);
        router.replace(shouldShowOnboarding(data.user) ? '/onboarding' : '/home');
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
          clearPendingSocialLogin();
          router.replace(`/login?error=${encodeURIComponent(message)}`);
        }
      }
    }

    completeLogin();

    return () => {
      cancelled = true;
    };
  }, [provider, router, searchParams, setAuth]);

  return <CallbackLoading />;
}

function CallbackLoading() {
  return (
    <main className="flex h-dvh items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </main>
  );
}

function isSocialProvider(provider: string): provider is SocialProvider {
  return provider === 'GOOGLE';
}
