import { z } from 'zod';

const balanceSchema = z.object({
  credits: z.number(),
  debits: z.number()
});

export const balancesSchema = z.object({
  floating: balanceSchema,
  accounts: z.record(z.string(), balanceSchema)
});
export type Balances = z.infer<typeof balancesSchema>;

export const accountSchema = z.object({
  name: z.string(),
  accountType: z.union([
    z.literal('asset'),
    z.literal('liability'),
    z.literal('expense'),
    z.literal('income'),
    z.literal('security')
  ]),
  denomination: z.string(),
  closed: z.boolean()
});
export type Account = z.infer<typeof accountSchema>;

export const ledgerSchema = z.object({
  name: z.string(),
  accounts: z.record(z.string(), accountSchema),
  balances: balancesSchema
});
export type Ledger = z.infer<typeof ledgerSchema>;


export const ledgerIdListSchema = z.array(z.string());
export type LedgerIdList = z.infer<typeof ledgerIdListSchema>;

export const ledgerListItemSchema = z.object({
  ledgerId: z.string(),
  name: z.string()
});
export const ledgerListSchema = z.array(ledgerListItemSchema);

export type LedgerList = z.infer<typeof ledgerListSchema>;
export type LedgerListItem = z.infer<typeof ledgerListItemSchema>;
