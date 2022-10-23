import { z } from 'zod';
import { ActionFunction, redirect } from '@remix-run/cloudflare';
import { fetchJson } from '~lib/utils';
import * as Model from '~lib/model';
import { useParentData } from '~/hooks';
import { loaderDataSchema as ledgerDataSchema } from '~/routes/ledger.$ledgerId';
import { useParams } from '@remix-run/react';

export const action: ActionFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const ledgerId = params.ledgerId;
  const accountId = params.accountId;
  const form = await request.formData();
  let data: Record<string, unknown> = {};

  for (let [k, v] of form.entries()) {
    data[k] = v;
  }

  if (ledgerId === undefined || accountId === undefined)
    throw new Error("Can't find ledgerId/accountId");
  const account = Model.accountSchema.parse({ ...data, closed: false });

  const ledger = await fetchJson(
    `${url.origin}/api/ledger/${ledgerId}`,
    undefined,
    Model.ledgerSchema,
    request
  );
  const oldAccount = ledger.accounts[accountId];
  if (oldAccount === undefined) throw new Error('account not found');

  ledger.accounts[accountId] = {
    ...oldAccount,
    ...account
  };

  await fetchJson(
    `${url.origin}/api/ledger/${ledgerId}`,
    {
      method: 'PUT',
      body: JSON.stringify(ledger)
    },
    z.string(),
    request
  );

  return redirect(`/ledger/${ledgerId}/act/${accountId}`);
};

export default function AccountEdit() {
  const ledgerState = ledgerDataSchema.parse(useParentData('routes/ledger.$ledgerId'));
  const accountId = useParams().accountId;

  if (accountId === undefined) throw new Error('accountId not found');
  const account = ledgerState.ledger.accounts[accountId];
  if (account === undefined) throw new Error('account not found');

  return (
    <form method="POST" className={'flex flex-col items-stretch gap-2 p-4 max-w-md'}>
      <div className={'form-control'}>
        <input
          type="text"
          name="name"
          defaultValue={account.name}
          placeholder="Account Name"
          className={'input input-primary input-bordered'}
        />
      </div>
      <div className={'form-control'}>
        <input
          type="text"
          name="denomination"
          defaultValue={account.denomination}
          placeholder="Denomination"
          className={'input input-primary input-bordered'}
        />
      </div>

      <div className={'form-control'}>
        <label className={'label cursor-pointer'}>
          <span className={'label-text'}>Asset</span>
          <input
            type="radio"
            defaultChecked={account.accountType === 'asset'}
            name="accountType"
            className={'radio'}
            value="asset"
            checked
          />
        </label>
      </div>
      <div className={'form-control'}>
        <label className={'label cursor-pointer'}>
          <span className={'label-text'}>Liability</span>
          <input
            type="radio"
            name="accountType"
            className={'radio checked:bg-red-500'}
            defaultChecked={account.accountType === 'liability'}
            value="liability"
          />
        </label>
      </div>
      <div className={'form-control'}>
        <label className={'label cursor-pointer'}>
          <span className={'label-text'}>Income</span>
          <input
            type="radio"
            name="accountType"
            className={'radio'}
            defaultChecked={account.accountType === 'income'}
            value="income"
          />
        </label>
      </div>
      <div className={'form-control'}>
        <label className={'label cursor-pointer'}>
          <span className={'label-text'}>Expense</span>
          <input
            type="radio"
            name="accountType"
            className={'radio checked:bg-red-500'}
            defaultChecked={account.accountType === 'expense'}
            value="expense"
          />
        </label>
      </div>
      <button type="submit" className={'btn btn-primary'}>
        Update Account
      </button>
    </form>
  );
}
