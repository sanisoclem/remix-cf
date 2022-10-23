import { LedgerManager } from '@server/ledger';

export const onRequestGet: PagesFunction<Env, any, AuthenticatedData> = async ({ env, data }) => {
  const ledgerMgr = new LedgerManager(env);

  return new Response(JSON.stringify(await ledgerMgr.getLedgers(data.currentUser.userId)));
};

export const onRequestPost: PagesFunction<Env, any, AuthenticatedData> = async ({
  env,
  data,
  request
}) => {
  const ledgerMgr = new LedgerManager(env);

  const name = await request.json();
  if (typeof name !== 'string' || name === '') return new Response('Invalid data', { status: 400 });

  const ledgerId = await ledgerMgr.createLedger(data.currentUser.userId, name);

  return new Response(JSON.stringify(ledgerId));
};
