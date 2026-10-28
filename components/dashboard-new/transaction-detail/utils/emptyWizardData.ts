import type { WizardData } from "@/components/dashboard-new/TransactionWizard";

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function emptyWizardData(): WizardData {
  return {
    type: "outcome",
    amount: 0,
    title: "",
    categoryId: null,
    paymentSourceId: null,
    walletId: null,
    date: todayString(),
    notes: "",
  };
}