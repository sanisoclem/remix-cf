import * as Model from '@lib/model';
import { LedgerManager } from '@server/ledger';
import { toInt } from '@lib/utils';
import { BadRequestError } from '@server/errors';

export const onRequestGet: PagesFunction<Env, ParamsLedger, AuthenticatedData> = async ({
  env,
  data,
  params,
  request
}) => {
  const url = new URL(request.url);
  const ledgerMgr = new LedgerManager(env);

  if (typeof params.ledgerId !== 'string') throw new BadRequestError();

  const txns = await ledgerMgr.getTransactions(
    data.currentUser.userId,
    params.ledgerId,
    url.searchParams.getAll('accountId'),
    toInt(url.searchParams.get('skip'), undefined),
    toInt(url.searchParams.get('take'), undefined)
  );

  return new Response(JSON.stringify(txns));
};

export const onRequestPost: PagesFunction<Env, ParamsLedger, AuthenticatedData> = async ({
  env,
  data,
  request,
  params
}) => {
  const ledgerMgr = new LedgerManager(env);
  const txn = Model.transactionNoIdSchema.parse(await request.json());

  if (typeof params.ledgerId !== 'string') throw new BadRequestError();

  await ledgerMgr.postTransaction(data.currentUser.userId, params.ledgerId, txn);

  return new Response(JSON.stringify('success'));
};
