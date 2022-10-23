import * as D from 'io-ts/Decoder';
import * as G from 'io-ts/Guard';
import { Schemable } from 'io-ts/lib/Schemable';
import * as S from 'io-ts/Schema';
import * as TD from 'io-ts/TaskDecoder';

const transactionS = <F>(S: Schemable<F>) =>
  S.struct({
    transactionId: S.string,
    date: S.number,
    credit: S.nullable(S.string),
    debit: S.nullable(S.string),
    amount: S.number,
    amountCredit: S.number,
    amountDebit: S.number,
    notes: S.string
  });
export const transactionSchema = S.make(transactionS);

export const transactionDecoder = S.interpreter(D.Schemable)(transactionSchema);
export const transactionGuard = S.interpreter(G.Schemable)(transactionSchema);
export const transactionTaskDecoder = S.interpreter(TD.Schemable)(transactionSchema);
export type Transaction = S.TypeOf<typeof transactionSchema>;

export const transactionListSchema = S.make((S) => S.array(transactionS(S)));
export const transactionListDecoder = S.interpreter(D.Schemable)(transactionListSchema);
export const transactionListGuard = S.interpreter(G.Schemable)(transactionListSchema);
export const transactionListTaskDecoder = S.interpreter(TD.Schemable)(transactionListSchema);
export type TransactionList = S.TypeOf<typeof transactionListSchema>;

export const transactionNoIdSchema = S.make((S) =>
  S.struct({
    date: S.number,
    credit: S.nullable(S.string),
    debit: S.nullable(S.string),
    amount: S.number,
    amountCredit: S.number,
    amountDebit: S.number,
    notes: S.string
  })
);

export const transactionNoIdDecoder = S.interpreter(D.Schemable)(transactionNoIdSchema);
export const transactionNoIdGuard = S.interpreter(G.Schemable)(transactionNoIdSchema);
export const transactionNoIdTaskDecoder = S.interpreter(TD.Schemable)(transactionNoIdSchema);
export type TransactionNoId = S.TypeOf<typeof transactionNoIdSchema>;
