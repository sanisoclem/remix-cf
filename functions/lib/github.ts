import { v4 } from 'uuid';

export interface TokenData {
  access_token: string;
  token_type: string;
}
export interface GithubUser {
  id: number;
  name: string;
}
export interface AuthRequest {
  returnUrl: string;
}

export const GithubClient = (env: Env) => {
  const clientId = env.AUTH_GITHUB_CLIENT_ID;
  const clientSecret = env.AUTH_GITHUB_CLIENT_SECRET;
  const callbackUri = env.AUTH_GITHUB_CALLBACK_URI;

  return {
    getAccessToken: async (code: string): Promise<TokenData> => {
      const resp = await fetch(
        'https://github.com/login/oauth/access_token?' +
          new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: callbackUri
          }).toString(),
        {
          method: 'POST',
          headers: new Headers({
            Accept: 'application/json'
          })
        }
      );
      return await resp.json();
    },
    getUserInfo: async (td: TokenData): Promise<GithubUser> => {
      const userResp = await fetch('https://api.github.com/user', {
        headers: new Headers({
          Accept: 'application/json',
          Authorization: `${td.token_type} ${td.access_token}`,
          'User-Agent': 'Empire Builder'
        })
      });
      return await userResp.json();
    },
    createAuthRequest: async (returnUrl: string, expirySeconds = 120): Promise<string> => {
      const state = v4();
      await env.EB.put(
        `auth:github:${state}`,
        JSON.stringify({
          returnUrl
        }),
        {
          expirationTtl: expirySeconds
        }
      );
      return `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
        clientId
      )}&redirect_uri=${encodeURIComponent(
        callbackUri
      )}&scope=user%3Aemail&state=${encodeURIComponent(state)}`;
    },
    getAuthRequest: async (state: string): Promise<AuthRequest | null> => {
      return await env.EB.get(`auth:github:${state}`, { type: 'json' });
    }
  };
};
