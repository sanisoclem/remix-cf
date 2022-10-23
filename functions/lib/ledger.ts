import { v4 } from 'uuid';
import * as Model from '@lib/model';
import { BadRequestError, NotFoundError } from './errors';

const updateBalance = (
  bal: Model.Balances,
  txn: Model.TransactionNoId,
  op: (a: number, b: number) => number = (a, b) => a + b
): Model.Balances => {
  if (txn.credit === null) {
    bal.floating.credits = bal.floating.credits + txn.amountCredit;
  } else {
    const b = bal.accounts[txn.credit];
    bal.accounts[txn.credit] = {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      credits: op(b?.credits || 0, txn.amountCredit),
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      debits: b?.debits || 0
    };
  }

  if (txn.debit === null) {
    bal.floating.debits = bal.floating.debits + txn.amountDebit;
  } else {
    const b = bal.accounts[txn.debit];
    bal.accounts[txn.debit] = {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      credits: b?.credits || 0,
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      debits: op(b?.debits || 0, txn.amountDebit)
    };
  }
  return bal;
};

export class LedgerManager {
  constructor(private readonly env: Env) {}

  static ledgerListKey(userId: string) {
    return `u:${userId}:ledgers`;
  }

  static ledgerIdKey(userId: string, ledgerId: string) {
    return `u:${userId}:ledger:${ledgerId}`;
  }

  static txnIndexKey(userId: string, ledgerId: string) {
    return `u:${userId}:txn:${ledgerId}`;
  }

  async getLedgerIds(userId: string): Promise<Model.LedgerIdList> {
    const ledgerIds = await this.env.EB.get(LedgerManager.ledgerListKey(userId), { type: 'json' });
    if (ledgerIds === null) return [];
    return Model.ledgerIdListSchema.parse(ledgerIds);
  }

  async getLedger(userId: string, ledgerId: string): Promise<Model.Ledger> {
    const val = await this.env.EB.get(LedgerManager.ledgerIdKey(userId, ledgerId), {
      type: 'json'
    });
    if (val === null) throw new NotFoundError();
    return Model.ledgerSchema.parse(val);
  }

  async getLedgers(userId: string): Promise<Ledger[]> {
    const ledgerIds = await this.getLedgerIds(userId);
    const hydrated = await Promise.all(
      ledgerIds.map(async (ledgerId) => {
        const l = await this.getLedger(userId, ledgerId);
        if (l === null) return null;
        return {
          ledgerId,
          name: l.name
        };
      })
    );
    return hydrated.filter((l): l is Ledger => l != null);
  }

  async createLedger(userId: string, name: string): Promise<string> {
    const ledgerId = v4();
    const ledger: Model.Ledger = {
      name,
      accounts: {},
      balances: {
        floating: {
          credits: 0,
          debits: 0
        },
        accounts: {}
      }
    };
    const ledgerIds = await this.getLedgerIds(userId);
    await this.env.EB.put(
      LedgerManager.ledgerListKey(userId),
      JSON.stringify([...ledgerIds, ledgerId])
    );
    await this.env.EB.put(LedgerManager.ledgerIdKey(userId, ledgerId), JSON.stringify(ledger));
    return ledgerId;
  }

  async updateLedger(userId: string, ledgerId: string, ledger: Model.Ledger): Promise<void> {
    await this.env.EB.put(LedgerManager.ledgerIdKey(userId, ledgerId), JSON.stringify(ledger));
  }

  async postTransaction(
    userId: string,
    ledgerId: string,
    txn: Model.TransactionNoId
  ): Promise<void> {
    const ledger = await this.getLedger(userId, ledgerId);
    if (ledger === null) throw new BadRequestError();

    const doc = await this.env.EB.get(LedgerManager.txnIndexKey(userId, ledgerId), {
      type: 'json'
    });
    const allTxns = doc == null ? [] :  Model.transactionListSchema.parse(doc);
    const sorted: Model.Transaction[] = [...allTxns, { ...txn, transactionId: v4() }].sort(
      (a, b) => a.date - b.date
    );

    ledger.balances = updateBalance(ledger.balances, txn);

    await this.env.EB.put(LedgerManager.txnIndexKey(userId, ledgerId), JSON.stringify(sorted));
    await this.env.EB.put(LedgerManager.ledgerIdKey(userId, ledgerId), JSON.stringify(ledger));
  }

  async updateTransaction(
    userId: string,
    ledgerId: string,
    txnId: string,
    txn: Model.TransactionNoId
  ): Promise<void> {
    const ledger = await this.getLedger(userId, ledgerId);
    if (ledger === null) throw new BadRequestError();;

    const doc = await this.env.EB.get(LedgerManager.txnIndexKey(userId, ledgerId), {
      type: 'json'
    });

    const allTxns = doc == null ? [] :  Model.transactionListSchema.parse(doc);

    const [oldTxn] = allTxns.splice(
      allTxns.findIndex((t) => t.transactionId === txnId),
      1
    );
    const sorted: Model.Transaction[] = [...allTxns, { ...txn, transactionId: txnId }].sort(
      (a, b) => a.date - b.date
    );

    if (oldTxn === undefined) throw new BadRequestError();

    ledger.balances = updateBalance(ledger.balances, oldTxn, (a, b) => a - b);
    ledger.balances = updateBalance(ledger.balances, txn);

    await this.env.EB.put(LedgerManager.txnIndexKey(userId, ledgerId), JSON.stringify(sorted));
    await this.env.EB.put(LedgerManager.ledgerIdKey(userId, ledgerId), JSON.stringify(ledger));
  }

  async getTransactions(
    userId: string,
    ledgerId: string,
    accountIds: string[] | undefined = undefined,
    skip = 0,
    take = 50
  ): Promise<Model.Transaction[]> {
    const doc = await this.env.EB.get(LedgerManager.txnIndexKey(userId, ledgerId), {
      type: 'json'
    });
    const allTxns = doc == null ? [] :  Model.transactionListSchema.parse(doc);

    const filteredTxns = allTxns.filter(
      (t) =>
        accountIds === undefined ||
        accountIds.length === 0 ||
        (t.credit != null && accountIds.includes(t.credit)) ||
        (t.debit != null && accountIds.includes(t.debit))
    );
    return filteredTxns.slice(skip, skip + take);
  }
}
