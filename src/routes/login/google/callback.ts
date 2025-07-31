import { z } from 'zod';
import { google } from '@/lib/server/oauth';
import { createUser } from '@/lib/server/db/repo/users';
import { logger, createModuleLogger } from '@/lib/logger';
import { decodeIdToken, type OAuth2Tokens } from 'arctic';
import { setSessionTokenCookie } from '@/lib/server/sessions';
import { getUserByGoogleId } from '@/lib/server/db/repo/users';
import { generateSessionToken, createSession } from '@/lib/server/sessions';
import { createServerFileRoute, getCookie, getWebRequest, setCookie } from '@tanstack/react-start/server';

const authLogger = createModuleLogger('auth');

export const ServerRoute = createServerFileRoute('/login/google/callback').methods({
  GET: async () => {
    const request = getWebRequest();
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = getCookie('google_oauth_state') ?? null;
    const codeVerifier = getCookie('google_code_verifier') ?? null;

    const validatedParams = validateOAuthParameters({ code, state, storedState, codeVerifier });

    const tokens = await validateAuthorizationCode(validatedParams.code, validatedParams.codeVerifier);
    const userClaims = parseUserClaims(tokens);

    setCookie('google_oauth_state', '', { maxAge: 0 });
    setCookie('google_code_verifier', '', { maxAge: 0 });

    const existingUser = await getUserByGoogleId(userClaims.googleId);
    if (!existingUser.success) throw new Error('Failed to get user', { cause: existingUser.error });

    if (existingUser.data !== null) {
      return handleExistingUserLogin(existingUser.data);
    }

    return handleNewUserCreation(userClaims);
  },
});

const googleClaimsSchema = z.object({
  sub: z.string(),
  name: z.string(),
  picture: z.string(),
  email: z.string().email(),
});

type OAuthParameters = {
  code: string | null;
  state: string | null;
  storedState: string | null;
  codeVerifier: string | null;
};

type ValidatedOAuthParameters = {
  code: string;
  state: string;
  storedState: string;
  codeVerifier: string;
};

function validateOAuthParameters({
  code,
  state,
  storedState,
  codeVerifier,
}: OAuthParameters): ValidatedOAuthParameters {
  if (code === null || state === null || storedState === null || codeVerifier === null) {
    authLogger.warn('Auth failed: Missing OAuth parameters', {
      code: !!code,
      state: !!state,
      storedState: !!storedState,
      codeVerifier: !!codeVerifier,
    });
    throw new Response('Please restart the process.', {
      status: 400,
    });
  }
  if (state !== storedState) {
    authLogger.warn('Auth failed: OAuth state mismatch', {
      received: state,
      stored: storedState,
    });
    throw new Response('Please restart the process.', {
      status: 400,
    });
  }

  return { code, state, storedState, codeVerifier };
}

async function validateAuthorizationCode(code: string, codeVerifier: string): Promise<OAuth2Tokens> {
  try {
    return await google.validateAuthorizationCode(code, codeVerifier);
  } catch (error) {
    authLogger.warn('Auth failed: Failed to validate authorization code', error);
    throw new Response('Please restart the process.', {
      status: 400,
    });
  }
}

type UserClaims = {
  googleId: string;
  email: string;
  name: string;
  picture: string;
};

function parseUserClaims(tokens: OAuth2Tokens): UserClaims {
  const claims = decodeIdToken(tokens.idToken());
  const parsedClaims = googleClaimsSchema.parse(claims);
  return {
    googleId: parsedClaims.sub,
    name: parsedClaims.name,
    picture: parsedClaims.picture,
    email: parsedClaims.email,
  };
}

type UserWithId = {
  id: number;
};

async function handleExistingUserLogin(user: UserWithId) {
  authLogger.success(`User logged in: ${user.id.toString()} via google`);
  const sessionToken = generateSessionToken();
  if (!sessionToken.success) throw new Error('Failed to generate session token', { cause: sessionToken.error });

  const session = await createSession(sessionToken.data, user.id);
  if (!session.success) throw new Error('Failed to create session', { cause: session.error });

  const expiresAt = new Date(session.data.createdAt.getTime() + 1000 * 60 * 60 * 24 * 30);
  setSessionTokenCookie(sessionToken.data, expiresAt);
  throw new Response(null, {
    status: 302,
    headers: {
      Location: '/',
    },
  });
}

async function handleNewUserCreation(userClaims: UserClaims) {
  try {
    const user = await createUser({
      googleId: userClaims.googleId,
      email: userClaims.email,
      name: userClaims.name,
      picture: userClaims.picture,
    });
    if (!user.success) throw new Error('Failed to create user', { cause: user.error });

    authLogger.success(`User logged in: ${user.data.id.toString()} via google`);
    const sessionToken = generateSessionToken();
    if (!sessionToken.success) throw new Error('Failed to generate session token', { cause: sessionToken.error });

    const session = await createSession(sessionToken.data, user.data.id);
    if (!session.success) throw new Error('Failed to create session', { cause: session.error });

    const expiresAt = new Date(session.data.createdAt.getTime() + 1000 * 60 * 60 * 24 * 30);
    setSessionTokenCookie(sessionToken.data, expiresAt);
    throw new Response(null, {
      status: 302,
      headers: {
        Location: '/',
      },
    });
  } catch (error) {
    logger.error(`[Google OAuth user creation] ${error instanceof Error ? error.message : 'Unknown error'}`, error);
    throw new Response('Authentication failed', {
      status: 500,
    });
  }
}
