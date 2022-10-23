import { useParentData } from "~/hooks";
import { loaderDataSchema as ledgerDataSchema } from "../ledger.$ledgerId";

export default function LedgerHome() {
  const ledgerState = ledgerDataSchema.parse(useParentData('routes/ledger.$ledgerId'));
  return (
    <div className={"hero min-h-screen"}>
      <div className={"hero-overlay bg-opacity-60"} />
      <div className={"hero-content text-center text-neutral-content"}>
        <div>
          <h1 className={"mb-5 text-5xl font-bold"}>{ledgerState.ledger.name}</h1>

          <div className={"stats shadow mb-8 text-left"}>
            <div className={"stat"}>
              <div className={"stat-figure text-primary"}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className={"inline-block w-8 h-8 stroke-current"}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div className={"stat-title"}>Net Worth</div>
              <div className={"stat-value text-primary"}>25.6K</div>
              <div className={"stat-desc"}>21% more than last month</div>
            </div>
            <div className={"stat"}>
              <div className={"stat-figure text-secondary"}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className={"inline-block w-8 h-8 stroke-current"}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className={"stat-title"}>Free cash</div>
              <div className={"stat-value text-secondary"}>2.6M</div>
              <div className={"stat-desc"}>21% more than last month</div>
            </div>
            <div className={"stat"}>
              <div className={"stat-figure text-secondary"}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className={"inline-block w-10 h-10 stroke-current"}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className={"stat-value"}>86%</div>
              <div className={"stat-title"}>Cash to Debt Ratio</div>
              <div className={"stat-desc text-secondary"}>$400 in uncovered debt</div>
            </div>
          </div>

          <div
            className={"flex flex-col text-left gap-2 p-4  text-white border-solid border-2 border-slate-400 rounded-2xl"}
          >
            <div className={"flex gap-2 items-center"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={"w-5 h-5 text-amber-400"}
              >
                <path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
              </svg>
              <p>Insights</p>
            </div>
            <div className={"pl-7"}>
              <p className={"text-sm text-slate-200"}>Blablablablabla</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
