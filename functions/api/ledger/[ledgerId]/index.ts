import { LedgerManager } from '@server/ledger';
import * as Model from '@lib/model';
import { BadRequestError } from '@server/errors';

export const onRequestGet: PagesFunction<Env, ParamsLedger, AuthenticatedData> = async ({
  env,
  data,
  params
}) => {
  const ledgerMgr = new LedgerManager(env);
  if (typeof params.ledgerId !== 'string') throw new BadRequestError();

  return new Response(
    JSON.stringify(await ledgerMgr.getLedger(data.currentUser.userId, params.ledgerId))
  );
};

export const onRequestPut: PagesFunction<Env, ParamsLedger, AuthenticatedData> = async ({
  env,
  data,
  request,
  params
}) => {
  const ledgerMgr = new LedgerManager(env);
  const payload = Model.ledgerSchema.parse(await request.json());

  if (typeof params.ledgerId !== 'string') throw new BadRequestError();

  await ledgerMgr.updateLedger(data.currentUser.userId, params.ledgerId, payload);

  return new Response(JSON.stringify('OK'));
};
