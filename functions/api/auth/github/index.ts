import { GithubClient } from '@server/github';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const url = new URL(request.url);
  const returnUrl = url.searchParams.get('returnUrl');
  const redirectUri = await GithubClient(env).createAuthRequest(
    returnUrl === null ? '/' : returnUrl
  );

  return Response.redirect(redirectUri);
};
