/// <reference types="vite/client" />

import { HeadContent, Scripts, createRootRoute, Outlet, redirect } from '@tanstack/react-router';

import appCss from '@/styles/app.css?url';
import { getCurrentSession } from '@/lib/server/sessions';

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const result = await getCurrentSession();
    if (!result.success) throw redirect({ to: '/login' });
    if (result.success && location.pathname === '/login') throw redirect({ to: '/' });
  },
  head,
  component() {
    return (
      <html>
        <head>
          <HeadContent />
        </head>
        <body>
          <Outlet />
          <Scripts />
        </body>
      </html>
    );
  },
});

function head() {
  return {
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: emoji,
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: emoji,
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: emoji,
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: emoji },
    ],
  };
}

const emoji =
  'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔥</text></svg>';
