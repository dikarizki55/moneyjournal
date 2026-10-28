import type { WizardData } from "@/components/dashboard-new/TransactionWizard";

export type EditableField =
  | "type"
  | "amount"
  | "title"
  | "category"
  | "source"
  | "wallet"
  | "date"
  | "notes";

export function validateField(
  field: EditableField,
  data: WizardData,
): string | null {
  switch (field) {
    case "amount":
      return data.amount > 0 ? null : "Amount must be greater than 0";
    case "title":
      return data.title.trim() ? null : "Title is required";
    case "category":
      return data.categoryId ? null : "Category is required";
    case "source":
      return data.paymentSourceId ? null : "Payment source is required";
    case "wallet":
      return null;
    case "date":
      return data.date ? null : "Date is required";
    case "type":
      return null;
    case "notes":
      return null;
    default:
      return null;
  }
}