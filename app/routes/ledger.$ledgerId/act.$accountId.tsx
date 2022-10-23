import { Link, Outlet, useParams } from '@remix-run/react';

export default function AccountHome() {
  const { ledgerId, accountId } = useParams();
  if (ledgerId === undefined || accountId === undefined)
    throw new Error('Cannot find ledger/account id');
  return (
    <div className="p-4">
      <div className="navbar bg-gray-800">
        <div className="flex-1">
          <Link
            to={`/ledger/${ledgerId}/act/${accountId}`}
            className="btn btn-ghost normal-case text-xl"
          >
            Account
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal p-0">
            <li>
              <Link to={`/ledger/${ledgerId}/act/${accountId}`}>Overview</Link>
            </li>
            <li>
              <Link to={`/ledger/${ledgerId}/act/${accountId}/txn`}>Transactions</Link>
            </li>
            <li>
              <Link to={`/ledger/${ledgerId}/act/${accountId}/edit`}>Edit</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-4 p-4">
        <Outlet />
      </div>
    </div>
  );
}
