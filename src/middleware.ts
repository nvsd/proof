import { createMiddleware } from '@tanstack/react-start';
import { getCookie, getWebRequest, setCookie } from '@tanstack/react-start/server';
import { env } from '@/lib/server/env';
import { logger, createModuleLogger } from '@/lib/logger';

const serverLogger = createModuleLogger('server');

export const loggingMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const request = getWebRequest();
  const startTime = Date.now();

  try {
    const response = await next();
    const duration = Date.now() - startTime;

    const status = response instanceof Response ? response.status : 200;
    const message = `${request.method} ${request.url} ${status} (${duration}ms)`;

    if (status >= 400) {
      logger.error(message);
    } else if (status >= 300) {
      logger.warn(message);
    } else {
      logger.info(message);
    }

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`${request.method} ${request.url} 500 (${duration}ms)`);
    serverLogger.error('Request failed:', error);
    throw error;
  }
});

export const sessionMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const request = getWebRequest();

  if (request.method === 'GET') {
    const token = getCookie('session');

    if (token) {
      setCookie('session', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: true,
        secure: !env.isDev,
      });
    }

    return next();
  }

  const originHeader = request.headers.get('Origin');
  const hostHeader = request.headers.get('Host');

  if (originHeader === null || hostHeader === null) {
    serverLogger.warn('CSRF check failed: missing Origin or Host header');
    throw new Response(null, { status: 403 });
  }

  let origin: URL;
  try {
    origin = new URL(originHeader);
  } catch {
    serverLogger.warn('CSRF check failed: invalid Origin header');
    throw new Response(null, { status: 403 });
  }

  if (origin.host !== hostHeader) {
    serverLogger.warn(`CSRF check failed: Origin ${origin.host} does not match Host ${hostHeader}`);
    throw new Response(null, { status: 403 });
  }

  return next();
});
