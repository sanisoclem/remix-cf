import { Link, useFetcher } from '@remix-run/react';
import { useBoolean } from '~/hooks';
import * as Model from '~lib/model';

interface Props {
  ledgerList: Model.LedgerListItem[];
}

export default function LedgerSelect({ ledgerList }: Props) {
  const fetcher = useFetcher();
  const { value: formShown, setTrue: showForm, setFalse: hideForm } = useBoolean(false);

  return ledgerList.length === 0 || formShown ? (
    <>
      <p className={'mb-5'}>Create a new ledger.</p>
      <form className={'flex flex-col items-stretch gap-2'}>
        <div className={'form-control'}>
          <input
            type="text"
            name="name"
            placeholder="Ledger name"
            className={'input input-bordered'}
          />
        </div>
        <div className={'flex justify-between'}>
          <button type="button" className={'btn btn-outline'} onClick={() => hideForm()}>
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
          </button>
          <button
            type="submit"
            disabled={fetcher.state === 'submitting'}
            className={'btn btn-primary'}
          >
            {fetcher.state === 'submitting' ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </>
  ) : (
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
        <button type="button" className={'btn btn-outline btn-primary'} onClick={() => showForm()}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={'w-5 h-5'}
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </button>
      </div>
    </>
  );
}
