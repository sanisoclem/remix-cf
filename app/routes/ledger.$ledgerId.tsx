import { NavLink, Outlet } from '@remix-run/react';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { useBoolean } from '~/hooks';
import { z } from 'zod';
import { LoaderFunction, redirect } from '@remix-run/cloudflare';
import * as Model from '~lib/model';
import { fetchJson } from '~lib/utils';

export const loaderDataSchema = z.object({
  ledgerId: z.string(),
  accountBalances: z.array(
    z
      .object({
        accountId: z.string(),
        balance: z.object({
          credits: z.number(),
          debits: z.number()
        })
      })
      .merge(Model.accountSchema)
  ),
  ledger: Model.ledgerSchema
});
export type LoaderData = z.infer<typeof loaderDataSchema>;

export const loader: LoaderFunction = async ({
  request,
  params
}): Promise<LoaderData | Response | null> => {
  const url = new URL(request.url);
  if (params.ledgerId === undefined) throw new Error('cannot find ledgerId');

  const ledger = await fetchJson(
    `${url.origin}/api/ledger/${params.ledgerId}`,
    undefined,
    Model.ledgerSchema,
    request
  );
  const accountBalances = Object.entries(ledger.accounts).map(([accountId, account]) => ({
    accountId,
    ...account,
    balance: ledger.balances.accounts[accountId] ?? { credits: 0, debits: 0 }
  }));

  return {
    ledgerId: params.ledgerId,
    accountBalances,
    ledger
  };
};

export default function LedgerLayout() {
  const ledgerState = loaderDataSchema.parse(useLoaderData());
  return (
    <div className={'drawer drawer-mobile'}>
      <input id="my-drawer-2" type="checkbox" className={'drawer-toggle'} />
      <div className={'drawer-content'}>
        <div className={'navbar bg-base-100'}>
          <div className={'flex-none'}>
            <label htmlFor="my-drawer-2" className={'btn btn-square btn-ghost lg:hidden'}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className={'inline-block w-5 h-5 stroke-current'}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
          <div className={'flex-1'}>
            <a className={'btn btn-ghost normal-case text-xl'}>{ledgerState.ledger.name}</a>
          </div>
          <div className={'flex-none'}>
            <button className={'btn btn-square btn-ghost'}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className={'inline-block w-5 h-5 stroke-current'}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </button>
          </div>
        </div>
        <Outlet />
      </div>
      <div className={'drawer-side'}>
        <label htmlFor="my-drawer-2" className={'drawer-overlay'} />
        <div
          className={'p-4 overflow-y-auto w-80 bg-base-200 text-base-content flex flex-col gap-4'}
        >
          <div className={'dropdown dropdown-hover'}>
            <label tabIndex={0} className={'btn m-1 w-full'}>
              {ledgerState.ledger.name}
            </label>
            <ul
              tabIndex={0}
              className={'dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full'}
            >
              <li>
                <Link to="/ledgers">Open Ledger</Link>
              </li>
              <li>
                <Link to={`/ledger/${ledgerState.ledgerId}/account-new`}>New Account</Link>
              </li>
            </ul>
          </div>
          <Link
            to={`/ledger/${ledgerState.ledgerId}`}
            className={'hover:shadow block stats w-full'}
          >
            <div className={'stat'}>
              <div className={'stat-figure text-secondary'}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className={'inline-block w-10 h-10 stroke-current'}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className={'stat-title'}>Net Worth</div>
              <div className={'stat-value text-secondary'}>125.2K</div>
              <div className={'stat-desc'}>21% more than last month</div>
            </div>
          </Link>
          <div className={'flex justify-between items-center'}>
            <p>Accounts</p>
            <Link
              role="button"
              className={'btn-circle btn-xs'}
              to={`/ledger/${ledgerState.ledgerId}/account-new`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={'w-5 h-5'}
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
          <ul className={'menu'}>
            {ledgerState.accountBalances.map((act) => (
              <li key={act.accountId}>
                <NavLink
                  className={'flex flex-row justify-between'}
                  to={`/ledger/${ledgerState.ledgerId}/account/${act.accountId}/transactions`}
                >
                  <span>{act.name}</span>
                  <span>{act.balance.credits - act.balance.debits}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
