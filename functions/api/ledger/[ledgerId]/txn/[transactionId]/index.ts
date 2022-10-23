import * as Model from '@lib/model';
import { BadRequestError } from '@server/errors';
import { LedgerManager } from '@server/ledger';

export const onRequestPut: PagesFunction<Env, ParamsTxn, AuthenticatedData> = async ({
  env,
  data,
  request,
  params
}) => {
  const ledgerMgr = new LedgerManager(env);
  const txn = Model.transactionNoIdSchema.parse(await request.json());

  if (typeof params.ledgerId !== 'string' || typeof params.transactionId !== 'string')
    throw new BadRequestError();

  await ledgerMgr.updateTransaction(
    data.currentUser.userId,
    params.ledgerId,
    params.transactionId,
    txn
  );

  return new Response(JSON.stringify('success'));
};
