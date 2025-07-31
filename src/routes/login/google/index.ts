import { google } from '@/lib/server/oauth';
import { setCookie } from '@/lib/server/cookie';
import { createModuleLogger } from '@/lib/logger';
import { generateState, generateCodeVerifier } from 'arctic';
import { createServerFileRoute } from '@tanstack/react-start/server';

const authLogger = createModuleLogger('auth');

export const ServerRoute = createServerFileRoute('/login/google/').methods({
  GET: async () => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const authUrl = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

    setCookie('google_oauth_state', state, { maxAge: 60 * 10 });
    setCookie('google_code_verifier', codeVerifier, { maxAge: 60 * 10 });

    authLogger.info('Initiating Google OAuth flow');
    throw new Response(null, {
      status: 302,
      headers: {
        Location: authUrl.toString(),
      },
    });
  },
});
