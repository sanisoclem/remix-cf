export {};

declare global {
  interface Env {
    EB: KVNamespace;
    AUTH_GITHUB_CLIENT_ID: string;
    AUTH_GITHUB_CLIENT_SECRET: string;
    AUTH_GITHUB_CALLBACK_URI: string;
    AUTH_JWT_PRIVATE_KEY: string;
    AUTH_JWT_PUBLIC_KEY: string;
    AUTH_JWT_ISSUER: string;
    AUTH_JWT_AUDIENCE: string;
  }
  type AuthenticatedData = {
    currentUser: TokenPayload;
  } & Record<string, unknown>;

  type Data = {
    currentUser: TokenPayload | null;
  } & Record<string, unknown>;

  type ParamsLedger = 'ledgerId';
  type ParamsTxn = 'ledgerId' | 'transactionId';

  interface Ledger {
    ledgerId: string;
    name: string;
  }

  interface TokenPayload {
    userId: string;
    allow: boolean;
    name: string;
  }
}
