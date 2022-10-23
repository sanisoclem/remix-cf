import * as Model from '@lib/model';
import { valueOrFirst } from '@lib/utils';
import { BadRequestError } from '@server/errors';
import { LedgerManager } from '@server/ledger';

export const onRequestPut: PagesFunction<Env, ParamsTxn, AuthenticatedData> = async ({
  env,
  data,
  request,
  params
}) => {
  const ledgerMgr = new LedgerManager(env);

  const txn = await request.json();

  if (!Model.transactionNoIdGuard.is(txn)) throw new BadRequestError();

  await ledgerMgr.updateTransaction(
    data.currentUser.userId,
    valueOrFirst(params.ledgerId),
    valueOrFirst(params.transactionId),
    txn
  );

  return new Response('success');
};
