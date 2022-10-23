import { z } from 'zod';

export const transactionNoIdSchema = z.object({
  date: z.number(),
  credit: z.nullable(z.string()),
  debit: z.nullable(z.string()),
  amount: z.number(),
  amountCredit: z.number(),
  amountDebit: z.number(),
  notes: z.string()
});
export type TransactionNoId = z.infer<typeof transactionNoIdSchema>;

const transactionSchema = z
  .object({
    transactionId: z.string()
  })
  .merge(transactionNoIdSchema);
export type Transaction = z.infer<typeof transactionSchema>;

export const transactionListSchema = z.array(transactionSchema);
export type TransactionList = z.infer<typeof transactionListSchema>;
