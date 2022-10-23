import { LedgerManager } from '@server/ledger';
import * as Model from '@lib/model';
import { valueOrFirst } from '@lib/utils';
import { BadRequestError } from '@server/errors';

export const onRequestGet: PagesFunction<Env, ParamsLedger, AuthenticatedData> = async ({
  env,
  data,
  params
}) => {
  const ledgerMgr = new LedgerManager(env);

  return new Response(
    JSON.stringify(
      await ledgerMgr.getLedger(data.currentUser.userId, valueOrFirst(params.ledgerId))
    )
  );
};

export const onRequestPut: PagesFunction<Env, ParamsLedger, AuthenticatedData> = async ({
  env,
  data,
  request,
  params
}) => {
  const ledgerMgr = new LedgerManager(env);

  const payload = await request.json();
  if (!Model.ledgerGuard.is(payload)) throw new BadRequestError();

  await ledgerMgr.updateLedger(data.currentUser.userId, valueOrFirst(params.ledgerId), payload);

  return new Response('success');
};
