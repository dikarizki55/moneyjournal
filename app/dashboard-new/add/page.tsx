"use client";

import TransactionWizard from "@/components/dashboard-new/TransactionWizard";
import { useRouter } from "next/navigation";

export default function AddTransactionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <TransactionWizard
        mode="create"
        onClose={() => router.push("/dashboard-new")}
        onSaved={() => router.push("/dashboard-new/history")}
      />
    </div>
  );
}
