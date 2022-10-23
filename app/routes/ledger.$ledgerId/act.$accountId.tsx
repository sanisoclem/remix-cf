import { Link, Outlet, useParams } from '@remix-run/react';

export default function AccountHome() {
  const params = useParams();
  return (
    <div className="p-4">
      <div className="navbar bg-gray-800">
        <div className="flex-1">
          <Link to={`/ledger/${params.ledgerId}/act/${params.accountId}`} className="btn btn-ghost normal-case text-xl">
            Account
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal p-0">
            <li>
              <Link to={`/ledger/${params.ledgerId}/act/${params.accountId}`}>Overview</Link>
            </li>
            <li>
              <Link to={`/ledger/${params.ledgerId}/act/${params.accountId}/txn`}>Transactions</Link>
            </li>
            <li>
              <Link to={`/ledger/${params.ledgerId}/act/${params.accountId}/edit`}>Edit</Link>
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
