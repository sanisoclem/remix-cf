import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { useBoolean } from '~/hooks';
import { z } from 'zod';
import { LoaderFunction, redirect } from '@remix-run/cloudflare';
import * as Model from '~lib/model';
import { fetchJson } from '~lib/utils';

export const loaderDataSchema = Model.ledgerListSchema;
export type LoaderData = Model.LedgerList;

export const loader: LoaderFunction = async ({
  request
}): Promise<LoaderData | Response | null> => {
  const url = new URL(request.url);
  const ledgers = await fetchJson(
    `${url.origin}/api/ledger`,
    undefined,
    Model.ledgerListSchema,
    request
  );

  if (ledgers.length === 0) return redirect('/newLedger');

  return ledgers;
};

export default function Ledgers() {
  const ledgerList = loaderDataSchema.parse(useLoaderData());
  return (
    <>
      <p className={'mb-5'}>Pick a ledger to get started.</p>
      <div className={'flex flex-col gap-2 items-stretch text-center w-full'}>
        <ul className={'flex flex-col gap-2 w-full items-stretch'}>
          {ledgerList.map((ledger) => (
            <li key={ledger.ledgerId}>
              <Link to={`/ledger/${ledger.ledgerId}`} className={'btn btn-accent w-full'}>
                {ledger.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/newLedger" className={'btn btn-outline btn-primary'}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={'w-5 h-5'}
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </Link>
      </div>
    </>
  );
}
