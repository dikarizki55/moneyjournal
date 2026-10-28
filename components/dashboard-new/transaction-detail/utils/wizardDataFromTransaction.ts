import type { TransactionItem } from "@/lib/dashboard-new-types";
import type { WizardData } from "@/components/dashboard-new/TransactionWizard";

export function wizardDataFromTransaction(tx: TransactionItem): WizardData {
  return {
    type: tx.type,
    amount: Number(tx.amount),
    title: tx.title,
    categoryId: tx.category_id ?? null,
    paymentSourceId: tx.payment_source_id ?? null,
    walletId: tx.wallet_id ?? null,
    date: tx.date
      ? new Date(tx.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    notes: tx.notes ?? "",
  };
}