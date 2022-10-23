import * as Model from '@lib/model';
import { LedgerManager } from '@server/ledger';
import { toInt, valueOrFirst } from '@lib/utils';
import { BadRequestError } from '@server/errors';

export const onRequestGet: PagesFunction<Env, ParamsLedger, AuthenticatedData> = async ({
  env,
  data,
  params,
  request
}) => {
  const url = new URL(request.url);
  const ledgerMgr = new LedgerManager(env);

  const txns = await ledgerMgr.getTransactions(
    data.currentUser.userId,
    valueOrFirst(params.ledgerId),
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

  const txn = await request.json();
  if (!Model.transactionNoIdGuard.is(txn)) throw new BadRequestError();

  await ledgerMgr.postTransaction(data.currentUser.userId, valueOrFirst(params.ledgerId), txn);

  return new Response('success');
};
