import { GithubClient } from '@server/github';
import { UserManager } from '@server/user';
import { TokenManager, COOKIE_NAME } from '@server/jwt';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');

  if (code === null || state === null) {
    return new Response('Invalid auth callback', { status: 400 });
  }

  const ghClient = GithubClient(env);
  const savedState = await ghClient.getAuthRequest(state);

  if (savedState === null) {
    return new Response('Invalid auth callback', { status: 400 });
  }

  const tokenData = await ghClient.getAccessToken(code);
  const userData = await ghClient.getUserInfo(tokenData);

  const user = await UserManager(env).getOrCreateUser({
    userId: userData.id,
    name: userData.name,
    providers: {
      github: {
        token: tokenData.access_token,
        profile: userData
      }
    }
  });

  const token = await TokenManager(env).createToken(user);

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.origin}${savedState.returnUrl}`,
      'Set-Cookie': `${COOKIE_NAME}=${token}; path=/; secure; HttpOnly; SameSite=lax`
    }
  });
};
