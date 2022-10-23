import { z } from 'zod';
import * as D from 'io-ts/Decoder';
import * as G from 'io-ts/Guard';
import type { Schemable } from 'io-ts/lib/Schemable';
import * as S from 'io-ts/Schema';
import * as TD from 'io-ts/TaskDecoder';

const balanceS = <F>(S: Schemable<F>) =>
  S.struct({
    credits: S.number,
    debits: S.number
  });

const balancesS = <F>(S: Schemable<F>) =>
  S.struct({
    floating: balanceS(S),
    accounts: S.record(balanceS(S))
  });

export const ledgerSchema = S.make((S) =>
  S.struct({
    name: S.string,
    accounts: S.record(
      S.struct({
        name: S.string,
        accountType: S.literal('asset', 'liability', 'expense', 'income', 'security'),
        denomination: S.string,
        closed: S.boolean
      })
    ),
    balances: balancesS(S)
  })
);

export const ledgerDecoder = S.interpreter(D.Schemable)(ledgerSchema);
export const ledgerGuard = S.interpreter(G.Schemable)(ledgerSchema);
export const ledgerTaskDecoder = S.interpreter(TD.Schemable)(ledgerSchema);
export type Ledger = S.TypeOf<typeof ledgerSchema>;

export const balancesSchema = S.make(balancesS);
export type Balances = S.TypeOf<typeof balancesSchema>;

export const accountSchema = S.make((S) =>
  S.struct({
    name: S.string,
    accountType: S.literal('asset', 'liability', 'expense', 'income', 'security'),
    denomination: S.string,
    closed: S.boolean
  })
);

export const accountDecoder = S.interpreter(D.Schemable)(accountSchema);
export const accountGuard = S.interpreter(G.Schemable)(accountSchema);
export const accountTaskDecoder = S.interpreter(TD.Schemable)(accountSchema);
export type Account = S.TypeOf<typeof accountSchema>;

export const ledgerIdListSchema = S.make((S) => S.array(S.string));

export const ledgerIdListDecoder = S.interpreter(D.Schemable)(ledgerIdListSchema);
export const ledgerIdListGuard = S.interpreter(G.Schemable)(ledgerIdListSchema);
export const ledgerIdListTaskDecoder = S.interpreter(TD.Schemable)(ledgerIdListSchema);
export type LedgerIdList = S.TypeOf<typeof ledgerIdListSchema>;

export const ledgerListItemSchema = z.object({
  ledgerId: z.string(),
  name: z.string()
});
export const ledgerListSchema = z.array(ledgerListItemSchema);

export type LedgerList = z.infer<typeof ledgerListSchema>;
export type LedgerListItem = z.infer<typeof ledgerListItemSchema>;