import * as jose from 'jose';
import type { User } from './user';

export const TokenManager = (env: Env) => {
  const publicKey = env.AUTH_JWT_PUBLIC_KEY;
  const signingKey = env.AUTH_JWT_PRIVATE_KEY;
  const iss = env.AUTH_JWT_ISSUER;
  const aud = env.AUTH_JWT_AUDIENCE;

  return {
    createToken: async (user: User): Promise<string> =>
      await new jose.SignJWT({
        allow: user.userId === 758633 || user.userId === 9562381,
        name: user.name
      })
        .setSubject(user.userId.toString())
        .setIssuer(iss)
        .setAudience(aud)
        .setProtectedHeader({ alg: 'ES384' })
        .setExpirationTime('2h')
        .sign(await jose.importPKCS8(signingKey, 'ES384')),
    validateToken: async (token: string): Promise<TokenPayload | null> => {
      const { payload } = await jose.jwtVerify(token, await jose.importSPKI(publicKey, 'ES384'), {
        issuer: iss,
        audience: aud
      });
      if (
        payload.sub === undefined ||
        payload.allow === undefined ||
        payload.allow === null ||
        typeof payload.name !== 'string'
      )
        return null;
      return {
        userId: payload.sub,
        allow: payload.allow === true,
        name: `${payload.name}`
      };
    }
  };
};

export const COOKIE_NAME = 'authToken';
