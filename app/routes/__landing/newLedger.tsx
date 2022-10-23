import { z } from 'zod';
import { ActionFunction, redirect } from '@remix-run/cloudflare';
import { Link } from '@remix-run/react';
import { fetchJson } from '~lib/utils';

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const form = await request.formData();
  const name = z.string().parse(form.get('name'));

  const ledgerId = await fetchJson(
    `${url.origin}/api/ledger`,
    {
      method: 'POST',
      body: JSON.stringify(name)
    },
    z.string(),
    request
  );

  return redirect(`/ledger/${ledgerId}`);
};

export default function NewLedger() {
  return (
    <>
      <p className={'mb-5'}>Create a new ledger.</p>
      <form method="POST" className={'flex flex-col items-stretch gap-2'}>
        <div className={'form-control'}>
          <input
            type="text"
            name="name"
            placeholder="Ledger name"
            className={'input input-bordered'}
          />
        </div>
        <div className={'flex justify-between'}>
          {
            <Link className={'btn btn-outline'} to={'/ledgers'}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={'w-5 h-5'}
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          }
          <button type="submit" className={'btn btn-primary'}>
            Create
          </button>
        </div>
      </form>
    </>
  );
}
