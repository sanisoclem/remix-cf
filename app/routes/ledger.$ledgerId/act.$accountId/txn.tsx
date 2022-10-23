import { z } from 'zod';
import { ActionFunction, LoaderFunction } from '@remix-run/cloudflare';
import { fetchJson, getFormInt } from '~lib/utils';
import * as Model from '~lib/model';
import { useParentData } from '~/hooks';
import { loaderDataSchema as ledgerDataSchema } from '~/routes/ledger.$ledgerId';
import { useFetcher, useLoaderData, useParams } from '@remix-run/react';
import { MutableRefObject, useEffect, useRef, useState } from 'react';

export const action: ActionFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const data = await request.formData();
  const transactionId = data.get('transactionId');
  const amount = getFormInt(data, 'amount');
  const txn = Model.transactionNoIdSchema.parse({
    date: getFormInt(data, 'date'),
    amount,
    amountCredit: getFormInt(data, 'amountCredit') ?? amount,
    amountDebit: getFormInt(data, 'amountDebit') ?? amount,
    credit: data.get('credit') ?? null,
    debit: data.get('debit') ?? null,
    notes: data.get('notes') ?? ''
  });

  if (params.ledgerId === undefined) throw new Error('cannot find ledgerId');

  if (typeof transactionId === 'string') {
    await fetchJson(
      `${url.origin}/api/ledger/${params.ledgerId}/txn/${transactionId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ ...txn, transactionId })
      },
      z.any(),
      request
    );
  } else {
    await fetchJson(
      `${url.origin}/api/ledger/${params.ledgerId}/txn`,
      {
        method: 'POST',
        body: JSON.stringify(txn)
      },
      z.any(),
      request
    );
  }

  return null;
};

export const loaderDataSchema = z.object({
  txns: Model.transactionListSchema
});
export type LoaderData = z.infer<typeof loaderDataSchema>;

export const loader: LoaderFunction = async ({
  request,
  params
}): Promise<LoaderData | Response | null> => {
  const url = new URL(request.url);
  const skip = url.searchParams.get('skip');
  const take = url.searchParams.get('take');

  if (params.ledgerId === undefined) throw new Error('cannot find ledgerId');
  if (params.accountId === undefined) throw new Error('cannot find accountId');

  const txns = await fetchJson(
    `${url.origin}/api/ledger/${params.ledgerId}/txn?` +
      new URLSearchParams({
        accountId: params.accountId,
        ...(skip !== null ? { skip } : {}),
        ...(take !== null ? { take } : {})
      }).toString(),
    undefined,
    Model.transactionListSchema,
    request
  );

  return {
    txns
  };
};

type ComponentState =
  | {
      formState: 'new';
    }
  | {
      formState: 'edit';
      txnId: string;
    }
  | {
      formState: 'none';
    };

export default function AccountTransactions() {
  const { ledgerId, accountId } = useParams();
  const { txns } = loaderDataSchema.parse(useLoaderData());
  const fetchTxn = useFetcher();
  const ledgerState = ledgerDataSchema.parse(useParentData('routes/ledger.$ledgerId'));
  const formRef = useRef() as MutableRefObject<HTMLFormElement | null>;
  const [state, setState] = useState<ComponentState>({
    formState: 'none'
  });

  if (ledgerId === undefined || accountId === undefined)
    throw new Error('Cannot find ledger/account id');

  useEffect(() => {
    if (fetchTxn.type === 'done') {
      formRef.current?.reset();
      setState({ formState: 'none' });
    }
  }, [fetchTxn, setState]);

  const newTransaction = () => {
    setState({ formState: 'new' });
  };
  const startEdit = (txnId: string) => () => {
    setState({ txnId, formState: 'edit' });
  };

  const cancelEdit = () => {
    setState({ formState: 'none' });
  };

  return (
    <>
      <button type="button" className={'btn'} onClick={newTransaction}>
        New Transaction
      </button>
      <fetchTxn.Form
        ref={formRef}
        method="post"
        action={`/ledger/${ledgerId}/act/${accountId}/txn`}
      >
        <div className={'overflow-x-auto'}>
          <table className={'table table-zebra w-full'}>
            <thead>
              <tr>
                <th />
                <th>Date</th>
                <th>Credit</th>
                <th>Debit</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {state.formState === 'new' && (
                <tr>
                  <td>
                    <button type="submit">Create</button>
                  </td>
                  <td>
                    <div className={'form-control'}>
                      <input
                        type="text"
                        name="date"
                        placeholder="Date"
                        className={'input input-primary input-bordered'}
                      />
                    </div>
                  </td>
                  <td>
                    <div className={'form-control'}>
                      <select name="credit" className={'select select-bordered w-full max-w-xs'}>
                        <option disabled selected>
                          Credit
                        </option>
                        {Object.entries(ledgerState.ledger.accounts).map(([accountId, account]) => (
                          <option key={accountId} value={accountId}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td>
                    <div className={'form-control'}>
                      <select name="debit" className={'select select-bordered w-full max-w-xs'}>
                        <option disabled selected>
                          Debit
                        </option>
                        {Object.entries(ledgerState.ledger.accounts).map(([accountId, account]) => (
                          <option key={accountId} value={accountId}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td>
                    <div className={'form-control'}>
                      <input
                        type="text"
                        name="amount"
                        placeholder="Amount"
                        className={'input input-primary input-bordered'}
                      />
                    </div>
                  </td>
                </tr>
              )}

              {txns.map((txn) => (
                <tr key={txn.transactionId}>
                  {state.formState === 'edit' && state.txnId === txn.transactionId ? (
                    <>
                      <td>
                        <button type="submit" className="btn">
                          Save
                        </button>
                        <a className="btn" onClick={cancelEdit}>
                          Cancel
                        </a>
                        <input type="hidden" name="transactionId" value={txn.transactionId} />
                      </td>
                      <td>
                        <div className={'form-control'}>
                          <input
                            type="text"
                            name="date"
                            defaultValue={txn.date}
                            placeholder="Date"
                            className={'input input-primary input-bordered'}
                          />
                        </div>
                      </td>
                      <td>
                        <div className={'form-control'}>
                          <select
                            name="credit"
                            defaultValue={txn.credit ?? undefined}
                            className={'select select-bordered w-full max-w-xs'}
                          >
                            <option disabled selected>
                              Credit
                            </option>
                            {Object.entries(ledgerState.ledger.accounts).map(
                              ([accountId, account]) => (
                                <option key={accountId} value={accountId}>
                                  {account.name}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className={'form-control'}>
                          <select
                            name="debit"
                            defaultValue={txn.debit ?? undefined}
                            className={'select select-bordered w-full max-w-xs'}
                          >
                            <option disabled selected>
                              Debit
                            </option>
                            {Object.entries(ledgerState.ledger.accounts).map(
                              ([accountId, account]) => (
                                <option key={accountId} value={accountId}>
                                  {account.name}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                      </td>
                      <td>
                        <div className={'form-control'}>
                          <input
                            type="text"
                            name="amount"
                            defaultValue={txn.amount}
                            placeholder="Amount"
                            className={'input input-primary input-bordered'}
                          />
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <a className="btn" onClick={startEdit(txn.transactionId)}>
                          Edit
                        </a>
                      </td>
                      <td>{txn.date}</td>
                      <td>{txn.credit}</td>
                      <td>{txn.debit}</td>
                      <td>{txn.amount}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fetchTxn.Form>
    </>
  );
}
