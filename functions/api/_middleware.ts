import { BadRequestError } from '@server/errors';
import { COOKIE_NAME, TokenManager } from '@server/jwt';

const getCookie = (cookieString: string | null, key: string): string | null => {
  if (cookieString === null) return null;

  const allCookies = cookieString.split('; ');
  const targetCookie = allCookies.find((cookie) => cookie.includes(key));
  if (targetCookie === undefined) return null;

  const [, value] = targetCookie.split('=');
  return value ?? null;
};

export const onRequest: Array<PagesFunction<Env, any, Data>> = [
  async (context) => {
    context.data.timestamp = Date.now();
    const res = await context.next();
    const delta = Date.now() - (context.data.timestamp as number);
    res.headers.set('x-response-timing', delta.toString());
    return res;
  },
  async (context) => {
    try {
      return await context.next();
    } catch (err) {
      if (err instanceof BadRequestError) {
        return new Response(err.message, { status: 400 });
      } else if (err instanceof Error) {
        return new Response(err.message, { status: 500 });
      } else {
        return new Response('An unknown error has occured', { status: 500 });
      }
    }
  },
  async ({ request, next, data, env }) => {
    const url = new URL(request.url);

    const getUser = async () => {
      try {
        const cookies = request.headers.get('Cookie');
        const authToken = getCookie(cookies, COOKIE_NAME);
        if (authToken === null) return null;
        const claims = await TokenManager(env).validateToken(authToken);
        if (claims === null) return null;
        return claims;
      } catch {
        return null;
      }
    };

    const isAuthRoute = url.pathname.startsWith('/api/auth/');
    const isApiRoute = url.pathname.startsWith('/api');
    const isSession = url.pathname.startsWith('/api/session');
    const isHome = url.pathname === '/';

    data.currentUser = isAuthRoute ? null : await getUser();

    const validUser = data.currentUser?.allow === true;

    if (!validUser && !isHome && !isApiRoute) {
      return Response.redirect(`${url.origin}/`);
    }
    if (!validUser && isApiRoute && !isAuthRoute && !isSession) {
      return new Response('Unauthorized', { status: 403 });
    }

    return await next();
  }
];
