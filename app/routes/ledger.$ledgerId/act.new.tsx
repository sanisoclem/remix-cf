import { z } from 'zod';
import { ActionFunction, redirect } from '@remix-run/cloudflare';
import { fetchJson } from '~lib/utils';
import * as Model from '~lib/model';
import { v4 } from 'uuid';

export const action: ActionFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const ledgerId = params.ledgerId;
  const form = await request.formData();
  const data: Record<string, unknown> = {};

  for (const [k, v] of form.entries()) {
    data[k] = v;
  }

  if (ledgerId === undefined) throw new Error("Can't find ledgerId");
  const account = Model.accountSchema.parse({ ...data, closed: false });
  const accountId = v4();

  const ledger = await fetchJson(
    `${url.origin}/api/ledger/${ledgerId}`,
    undefined,
    Model.ledgerSchema,
    request
  );
  ledger.accounts = {
    ...ledger.accounts,
    [accountId]: account
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

export default function AccountNew() {
  return (
    <form method="POST" className={'flex flex-col items-stretch gap-2 p-4 max-w-md'}>
      <div className={'form-control'}>
        <input
          type="text"
          name="name"
          placeholder="Account Name"
          className={'input input-primary input-bordered'}
        />
      </div>
      <div className={'form-control'}>
        <input
          type="text"
          name="denomination"
          placeholder="Denomination"
          className={'input input-primary input-bordered'}
        />
      </div>

      <div className={'form-control'}>
        <label className={'label cursor-pointer'}>
          <span className={'label-text'}>Asset</span>
          <input type="radio" name="accountType" className={'radio'} value="asset" checked />
        </label>
      </div>
      <div className={'form-control'}>
        <label className={'label cursor-pointer'}>
          <span className={'label-text'}>Liability</span>
          <input
            type="radio"
            name="accountType"
            className={'radio checked:bg-red-500'}
            value="liability"
          />
        </label>
      </div>
      <div className={'form-control'}>
        <label className={'label cursor-pointer'}>
          <span className={'label-text'}>Income</span>
          <input type="radio" name="accountType" className={'radio'} value="income" />
        </label>
      </div>
      <div className={'form-control'}>
        <label className={'label cursor-pointer'}>
          <span className={'label-text'}>Expense</span>
          <input
            type="radio"
            name="accountType"
            className={'radio checked:bg-red-500'}
            value="expense"
          />
        </label>
      </div>
      <button type="submit" className={'btn btn-primary'}>
        Create Account
      </button>
    </form>
  );
}
