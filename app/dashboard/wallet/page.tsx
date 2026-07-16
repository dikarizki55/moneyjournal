"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatRupiah } from "../RupiahInput";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  Plus,
  Trash2,
  Wallet,
  Loader2,
  Pencil,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  CreditCard,
  List,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import RupiahInput from "../RupiahInput";
import { Label } from "@/components/ui/label";
import IconPicker, {
  DynamicIcon,
  isValidIcon,
} from "@/components/ui/icon-picker";
import PaymentSourceCombobox from "@/components/ui/payment-source-combobox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentSourceBalance {
  name: string;
  balance: number;
}

interface PaymentSourceInfo {
  id: string | null;
  name: string;
  icon: string | null;
  amount: number;
}

interface MonthlyOutcome {
  id: string;
  title: string;
  amount: number;
  category: string;
  icon?: string | null;
  spent: number;
  balance: number;
  totalFunded: number;
  totalSpent: number;
  thisMonthFunded: number;
  thisMonthSpent: number;
  default_payment_source_id?: string | null;
  paymentSources?: PaymentSourceInfo[];
}

export default function WalletPage() {
  const [outcomes, setOutcomes] = useState<MonthlyOutcome[]>([]);
  const [globalBalance, setGlobalBalance] = useState(0);
  const [globalPaymentSourceBalances, setGlobalPaymentSourceBalances] = useState<
    Record<string, { name: string; balance: number }>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSources, setPaymentSources] = useState<
    { id: string; name: string; icon?: string | null }[]
  >([]);
  const [paymentSourceTotals, setPaymentSourceTotals] = useState<
    { uuid: string; paymentSource: string; amount: number; icon: string | null }[]
  >([]);
  const [containerSourceBalances, setContainerSourceBalances] = useState<
    Record<string, Record<string, PaymentSourceBalance>>
  >({});
  const [newOutcome, setNewOutcome] = useState({
    title: "",
    amount: 0,
    category: "",
    icon: "",
    defaultPaymentSourceId: "",
  });
  const [editingOutcome, setEditingOutcome] = useState<MonthlyOutcome | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [fundDialog, setFundDialog] = useState<{
    open: boolean;
    outcome: MonthlyOutcome | null;
  }>({ open: false, outcome: null });
  const [withdrawDialog, setWithdrawDialog] = useState<{
    open: boolean;
    outcome: MonthlyOutcome | null;
  }>({ open: false, outcome: null });
  const [fundAmount, setFundAmount] = useState(0);
  const [fundPaymentSourceId, setFundPaymentSourceId] = useState("");
  const [fundDestinationPaymentSourceId, setFundDestinationPaymentSourceId] = useState("");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddName, setQuickAddName] = useState("");
  const [quickAddTarget, setQuickAddTarget] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawTitle, setWithdrawTitle] = useState("");
  const [withdrawPaymentSourceId, setWithdrawPaymentSourceId] = useState("");
  const [withdrawDate, setWithdrawDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [withdrawNotes, setWithdrawNotes] = useState("");
  const [transferDialog, setTransferDialog] = useState<{
    open: boolean;
    source: MonthlyOutcome | null;
  }>({ open: false, source: null });
  const [transferDestId, setTransferDestId] = useState("");
  const [transferAmount, setTransferAmount] = useState(0);
  const [transferPaymentSourceId, setTransferPaymentSourceId] = useState("");
  const [transferDestPaymentSourceId, setTransferDestPaymentSourceId] = useState("");
  const [reallocateDialog, setReallocateDialog] = useState<{
    open: boolean;
    outcome: MonthlyOutcome | null;
  }>({ open: false, outcome: null });
  const [reallocateFrom, setReallocateFrom] = useState("");
  const [reallocateTo, setReallocateTo] = useState("");
  const [reallocateAmount, setReallocateAmount] = useState(0);

  const [newIcon, setNewIcon] = useState("");
  const [containerUnassignedCounts, setContainerUnassignedCounts] = useState<
    Record<string, number>
  >({});
  const [migrateDialog, setMigrateDialog] = useState<{
    open: boolean;
    outcome: MonthlyOutcome | null;
  }>({ open: false, outcome: null });
  const [migratePaymentSourceId, setMigratePaymentSourceId] = useState("");
  const [isMigrating, setIsMigrating] = useState(false);

  const fetchOutcomes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/monthly-outcome");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOutcomes(data);
        const cBal: Record<string, Record<string, PaymentSourceBalance>> = {};
        for (const o of data) {
          if (o.paymentSources) {
            const sources: Record<string, PaymentSourceBalance> = {};
            for (const ps of o.paymentSources) {
              if (ps.id) {
                sources[ps.id] = { name: ps.name, balance: ps.amount };
              }
            }
            cBal[o.id] = sources;
          }
        }
        setContainerSourceBalances(cBal);
      } else {
        toast.error(data.message || "Failed to fetch wallets");
        setOutcomes([]);
      }
    } catch {
      toast.error("Failed to fetch wallets");
      setOutcomes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentSources = async () => {
    try {
      const res = await fetch("/api/payment-source");
      const json = await res.json();
      if (json.success) setPaymentSources(json.data);
    } catch {
      // ignore
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/monthly-outcome/balance");
      const data = await res.json();
      if (data.success) {
        setGlobalBalance(data.global.balance);
        if (data.global.paymentSourceBalances) {
          setGlobalPaymentSourceBalances(data.global.paymentSourceBalances);
        }
        if (data.paymentSourceTotals) {
          setPaymentSourceTotals(data.paymentSourceTotals);
        }
        if (data.containers) {
          const counts: Record<string, number> = {};
          for (const c of data.containers) {
            if (c.unassignedCount > 0) {
              counts[c.id] = c.unassignedCount;
            }
          }
          setContainerUnassignedCounts(counts);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchOutcomes();
    fetchBalance();
    fetchPaymentSources();
  }, []);

  useEffect(() => {
    if (
      isDialogOpen &&
      paymentSources.length > 0 &&
      !newOutcome.defaultPaymentSourceId
    ) {
      setNewOutcome((prev) => ({
        ...prev,
        defaultPaymentSourceId: paymentSources[0].id,
      }));
    }
  }, [isDialogOpen, paymentSources]);

  const handleAddOutcome = async () => {
    if (!newOutcome.title || !newOutcome.amount || !newOutcome.category) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/monthly-outcome", {
        method: "POST",
        body: JSON.stringify(newOutcome),
      });

      if (res.ok) {
        toast.success("Wallet created successfully");
        setNewOutcome({
          title: "",
          amount: 0,
          category: "",
          icon: "",
          defaultPaymentSourceId: "",
        });
        setIsDialogOpen(false);
        fetchOutcomes();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to create wallet");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOutcome = async () => {
    if (
      !editingOutcome?.title ||
      !editingOutcome?.amount ||
      !editingOutcome?.category
    ) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const body = {
        id: editingOutcome.id,
        title: editingOutcome.title,
        amount: editingOutcome.amount,
        category: editingOutcome.category,
        icon: editingOutcome.icon,
        defaultPaymentSourceId:
          (editingOutcome as any).default_payment_source_id || null,
      };
      const res = await fetch("/api/monthly-outcome", {
        method: "PUT",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Wallet updated successfully");
        setIsEditDialogOpen(false);
        setEditingOutcome(null);
        fetchOutcomes();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to update wallet");
      }
    } catch {
      toast.error("An error occurred during update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm("Move this wallet to the recycle bin? You can restore it later.")
    )
      return;

    try {
      const res = await fetch(`/api/monthly-outcome?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Deleted successfully");
        fetchOutcomes();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleFund = async () => {
    if (!fundDialog.outcome || fundAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/monthly-outcome/fund", {
        method: "POST",
        body: JSON.stringify({
          outcomeId: fundDialog.outcome.id,
          amount: fundAmount,
          paymentSourceId: fundPaymentSourceId || undefined,
          destinationPaymentSourceId: fundDestinationPaymentSourceId || undefined,
        }),
      });

      if (res.ok) {
        toast.success(`Funded ${fundDialog.outcome.title} successfully`);
        setFundDialog({ open: false, outcome: null });
        setFundAmount(0);
        setFundPaymentSourceId("");
        setFundDestinationPaymentSourceId("");
        fetchOutcomes();
        fetchBalance();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to fund wallet");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawDialog.outcome || withdrawAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/monthly-outcome/withdraw", {
        method: "POST",
        body: JSON.stringify({
          outcomeId: withdrawDialog.outcome.id,
          amount: withdrawAmount,
          title: withdrawTitle || undefined,
          paymentSourceId: withdrawPaymentSourceId || undefined,
          date: withdrawDate || undefined,
          notes: withdrawNotes || undefined,
        }),
      });

      if (res.ok) {
        toast.success(
          `Withdrawn from ${withdrawDialog.outcome.title} successfully`,
        );
        setWithdrawDialog({ open: false, outcome: null });
        setWithdrawAmount(0);
        setWithdrawTitle("");
        setWithdrawPaymentSourceId("");
        fetchOutcomes();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to withdraw");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferDialog.source || !transferDestId || transferAmount <= 0) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/monthly-outcome/transfer", {
        method: "POST",
        body: JSON.stringify({
          sourceWalletId: transferDialog.source.id,
          destinationWalletId: transferDestId,
          amount: transferAmount,
          paymentSourceId: transferPaymentSourceId || undefined,
          destinationPaymentSourceId: transferDestPaymentSourceId || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Transfer successful");
        setTransferDialog({ open: false, source: null });
        setTransferDestId("");
        setTransferAmount(0);
        setTransferPaymentSourceId("");
        setTransferDestPaymentSourceId("");
        fetchOutcomes();
        fetchBalance();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to transfer");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReallocate = async () => {
    if (
      !reallocateDialog.outcome ||
      !reallocateFrom ||
      !reallocateTo ||
      reallocateAmount <= 0
    ) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/monthly-outcome/reallocate", {
        method: "POST",
        body: JSON.stringify({
          walletId: reallocateDialog.outcome.id,
          fromPaymentSourceId: reallocateFrom,
          toPaymentSourceId: reallocateTo,
          amount: reallocateAmount,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setReallocateDialog({ open: false, outcome: null });
        setReallocateFrom("");
        setReallocateTo("");
        setReallocateAmount(0);
        fetchOutcomes();
        fetchBalance();
      } else {
        toast.error(json.message || "Failed to move");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMigrateWallet = async () => {
    if (!migrateDialog.outcome || !migratePaymentSourceId) {
      toast.error("Select a payment source");
      return;
    }
    setIsMigrating(true);
    try {
      const res = await fetch("/api/payment-source/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentSourceId: migratePaymentSourceId,
          category: migrateDialog.outcome.category,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setMigrateDialog({ open: false, outcome: null });
        setMigratePaymentSourceId("");
        setContainerUnassignedCounts((prev) => {
          const next = { ...prev };
          if (migrateDialog.outcome) delete next[migrateDialog.outcome.id];
          return next;
        });
        fetchOutcomes();
        fetchBalance();
      } else {
        toast.error(json.message || "Migration failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 w-full mx-auto">
      {paymentSourceTotals.length > 0 && (
        <div className="bg-chart-2 rounded-2xl border p-4 text-white">
          <h3 className="text-sm font-semibold mb-2 opacity-80">
            By Payment Source
          </h3>
          <div className="flex flex-wrap gap-4">
            {paymentSourceTotals.map((item) => (
              <div key={item.uuid} className="flex items-center gap-2 text-sm">
                {item.icon && isValidIcon(item.icon) ? (
                  <DynamicIcon
                    name={item.icon}
                    className="h-4 w-4 opacity-70"
                  />
                ) : null}
                <span className="opacity-70">{item.paymentSource}:</span>
                <span className="font-semibold">
                  {formatRupiah(String(item.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
          <p className="text-muted-foreground">
            Manage your savings wallets and budgets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/payment-source">
            <Button variant="outline" size="sm" className="gap-1">
              <CreditCard size={14} />
              Sources
            </Button>
          </Link>
          <ResponsiveDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            title="Add New Wallet"
            trigger={
              <Button className="gap-2">
                <Plus size={18} />
                Add Wallet
              </Button>
            }
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddOutcome();
              }}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="e.g. Emergency Fund"
                  value={newOutcome.title}
                  onChange={(e) =>
                    setNewOutcome({ ...newOutcome, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g. Emergency"
                  value={newOutcome.category}
                  onChange={(e) =>
                    setNewOutcome({ ...newOutcome, category: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <IconPicker
                  value={newOutcome.icon}
                  onChange={(iconName) =>
                    setNewOutcome({ ...newOutcome, icon: iconName })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Default Payment Source
                </label>
                  <PaymentSourceCombobox
                    value={newOutcome.defaultPaymentSourceId}
                    onChange={(id) =>
                      setNewOutcome({ ...newOutcome, defaultPaymentSourceId: id })
                    }
                    sources={paymentSources}
                    onQuickAdd={() => {
                    setQuickAddOpen(true);
                    setQuickAddName("");
                    setQuickAddTarget("walletAdd");
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget</label>
                <RupiahInput
                  value={newOutcome.amount}
                  onChange={(val) =>
                    setNewOutcome({ ...newOutcome, amount: val || 0 })
                  }
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Save Wallet"
                )}
              </Button>
            </form>
          </ResponsiveDialog>
        </div>
      </div>

      <ResponsiveDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Wallet"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEditOutcome();
          }}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="e.g. Emergency Fund"
              value={editingOutcome?.title || ""}
              onChange={(e) =>
                editingOutcome &&
                setEditingOutcome({
                  ...editingOutcome,
                  title: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input
              placeholder="e.g. Emergency"
              value={editingOutcome?.category || ""}
              onChange={(e) =>
                editingOutcome &&
                setEditingOutcome({
                  ...editingOutcome,
                  category: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Icon</label>
            <IconPicker
              value={editingOutcome?.icon || ""}
              onChange={(iconName) =>
                editingOutcome &&
                setEditingOutcome({ ...editingOutcome, icon: iconName })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Default Payment Source
            </label>
            <PaymentSourceCombobox
              value={(editingOutcome as any)?.default_payment_source_id || ""}
              onChange={(id) =>
                editingOutcome &&
                setEditingOutcome({
                  ...editingOutcome,
                  default_payment_source_id: id || null,
                } as any)
              }
              sources={paymentSources}
              onQuickAdd={() => {
                setQuickAddOpen(true);
                setQuickAddName("");
                setQuickAddTarget("walletEdit");
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Budget</label>
            <RupiahInput
              value={editingOutcome?.amount || 0}
              onChange={(val) =>
                editingOutcome &&
                setEditingOutcome({ ...editingOutcome, amount: val || 0 })
              }
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Update Wallet"
            )}
          </Button>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={fundDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setFundDialog({ open: false, outcome: null });
            setFundAmount(0);
            setFundPaymentSourceId("");
            setFundDestinationPaymentSourceId("");
          }
        }}
        title={`Fund ${fundDialog.outcome?.title || ""}`}
      >
        <div className="space-y-4 py-4">
          <div className="flex flex-wrap gap-3 p-3 bg-muted rounded-lg text-sm">
            {paymentSources.map((ps) => {
              const bal = globalPaymentSourceBalances[ps.id]?.balance ?? 0;
              return (
                <span key={ps.id} className="text-xs flex items-center gap-1">
                  {ps.icon && isValidIcon(ps.icon) ? (
                    <DynamicIcon name={ps.icon} className="h-3 w-3 text-muted-foreground" />
                  ) : null}
                  <span className="text-muted-foreground">{ps.name}:</span>{" "}
                  <span className={bal < 0 ? "text-destructive" : "text-green-600"}>
                    {formatRupiah(String(bal))}
                  </span>
                </span>
              );
            })}
          </div>
          <div className="space-y-2">
            <Label>Payment Source</Label>
            <PaymentSourceCombobox
              value={fundPaymentSourceId}
              onChange={setFundPaymentSourceId}
              sources={paymentSources.map((ps) => ({
                ...ps,
                balance: globalPaymentSourceBalances[ps.id]?.balance ?? 0,
              }))}
              onQuickAdd={() => {
                setQuickAddOpen(true);
                setQuickAddName("");
                setQuickAddTarget("fund");
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Destination Source</Label>
            <PaymentSourceCombobox
              value={fundDestinationPaymentSourceId}
              onChange={setFundDestinationPaymentSourceId}
              sources={(() => {
                const walletSources =
                  containerSourceBalances[fundDialog.outcome?.id || ""] || {};
                return paymentSources.map((ps) => ({
                  ...ps,
                  balance: walletSources[ps.id]?.balance,
                }));
              })()}
              placeholder="Select destination source..."
              onQuickAdd={() => {
                setQuickAddOpen(true);
                setQuickAddName("");
                setQuickAddTarget("fundDest");
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Amount to add</Label>
            <RupiahInput
              value={fundAmount}
              onChange={(val) => setFundAmount(val || 0)}
              max={
                fundPaymentSourceId
                  ? Math.max(0, globalPaymentSourceBalances[fundPaymentSourceId]?.balance ?? 0)
                  : Math.max(0, globalBalance)
              }
            />
          </div>
          <p className="text-sm text-muted-foreground">
            This will move money from your global balance to this wallet.
          </p>
          {fundPaymentSourceId
            ? fundAmount > (globalPaymentSourceBalances[fundPaymentSourceId]?.balance ?? 0) && (
                <p className="text-sm text-destructive font-medium">
                  Insufficient balance in this source. Available:{" "}
                  {formatRupiah(String(globalPaymentSourceBalances[fundPaymentSourceId]?.balance ?? 0))}.
                </p>
              )
            : fundAmount > globalBalance && globalBalance > 0 && (
                <p className="text-sm text-destructive font-medium">
                  Insufficient balance. You can fund up to{" "}
                  {formatRupiah(String(globalBalance))}.
                </p>
              )}
          {!fundPaymentSourceId && globalBalance <= 0 && (
            <p className="text-sm text-destructive font-medium">
              Your global balance is empty or negative. Add income before
              funding wallets.
            </p>
          )}
          <Button
            onClick={handleFund}
            className="w-full"
            disabled={
              isSubmitting ||
              fundAmount <= 0 ||
              (fundPaymentSourceId
                ? fundAmount > (globalPaymentSourceBalances[fundPaymentSourceId]?.balance ?? 0)
                : fundAmount > globalBalance)
            }
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Fund Wallet"
            )}
          </Button>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={withdrawDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setWithdrawDialog({ open: false, outcome: null });
            setWithdrawAmount(0);
            setWithdrawTitle("");
            setWithdrawPaymentSourceId("");
            setWithdrawDate(new Date().toISOString().split("T")[0]);
            setWithdrawNotes("");
          }
        }}
        title={`Withdraw from ${withdrawDialog.outcome?.title || ""}`}
      >
        <div className="space-y-4 py-4">
          {(() => {
            const walletSources =
              containerSourceBalances[withdrawDialog.outcome?.id || ""] || {};
            return (
              <div className="flex flex-wrap gap-3 p-3 bg-muted rounded-lg text-sm">
                {paymentSources.map((ps) => {
                  const bal = walletSources[ps.id]?.balance;
                  return (
                    <span
                      key={ps.id}
                      className="text-xs flex items-center gap-1"
                    >
                      {ps.icon && isValidIcon(ps.icon) ? (
                        <DynamicIcon
                          name={ps.icon}
                          className="h-3 w-3 text-muted-foreground"
                        />
                      ) : null}
                      <span className="text-muted-foreground">{ps.name}:</span>{" "}
                      <span
                        className={
                          bal !== undefined && bal < 0
                            ? "text-destructive"
                            : "text-green-600"
                        }
                      >
                        {formatRupiah(String(bal ?? 0))}
                      </span>
                    </span>
                  );
                })}
              </div>
            );
          })()}
          <div className="space-y-2">
            <Label>Title (optional)</Label>
            <Input
              placeholder="e.g. Groceries"
              value={withdrawTitle}
              onChange={(e) => setWithdrawTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Payment Source</Label>
            <PaymentSourceCombobox
              value={withdrawPaymentSourceId}
              onChange={setWithdrawPaymentSourceId}
              sources={(() => {
                const walletSources =
                  containerSourceBalances[withdrawDialog.outcome?.id || ""] ||
                  {};
                return paymentSources.map((ps) => ({
                  ...ps,
                  balance: walletSources[ps.id]?.balance,
                }));
              })()}
              onQuickAdd={() => {
                setQuickAddOpen(true);
                setQuickAddName("");
                setQuickAddTarget("withdraw");
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={withdrawDate}
              onChange={(e) => setWithdrawDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <textarea
              placeholder="Add notes..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={withdrawNotes}
              onChange={(e) => setWithdrawNotes(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Amount to withdraw</Label>
            <RupiahInput
              value={withdrawAmount}
              onChange={(val) => setWithdrawAmount(val || 0)}
              max={
                withdrawPaymentSourceId
                  ? (containerSourceBalances[
                      withdrawDialog.outcome?.id || ""
                    ]?.[withdrawPaymentSourceId]?.balance ?? 0)
                  : undefined
              }
            />
          </div>
          <Button
            onClick={handleWithdraw}
            className="w-full"
            disabled={
              isSubmitting ||
              withdrawAmount <= 0 ||
              (withdrawPaymentSourceId
                ? withdrawAmount >
                  (containerSourceBalances[
                    withdrawDialog.outcome?.id || ""
                  ]?.[withdrawPaymentSourceId]?.balance ?? 0)
                : false)
            }
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Withdraw"}
          </Button>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={transferDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setTransferDialog({ open: false, source: null });
            setTransferDestId("");
            setTransferAmount(0);
            setTransferPaymentSourceId("");
            setTransferDestPaymentSourceId("");
          }
        }}
        title={`Transfer from ${transferDialog.source?.title || ""}`}
      >
        <div className="space-y-4 py-4">
          {(() => {
            const walletSources =
              containerSourceBalances[transferDialog.source?.id || ""] || {};
            return (
              <div className="flex flex-wrap gap-3 p-3 bg-muted rounded-lg text-sm">
                {paymentSources.map((ps) => {
                  const bal = walletSources[ps.id]?.balance;
                  return (
                    <span
                      key={ps.id}
                      className="text-xs flex items-center gap-1"
                    >
                      {ps.icon && isValidIcon(ps.icon) ? (
                        <DynamicIcon
                          name={ps.icon}
                          className="h-3 w-3 text-muted-foreground"
                        />
                      ) : null}
                      <span className="text-muted-foreground">{ps.name}:</span>{" "}
                      <span
                        className={
                          bal !== undefined && bal < 0
                            ? "text-destructive"
                            : "text-green-600"
                        }
                      >
                        {formatRupiah(String(bal ?? 0))}
                      </span>
                    </span>
                  );
                })}
              </div>
            );
          })()}
          <div className="space-y-2">
            <Label>Payment Source</Label>
            <PaymentSourceCombobox
              value={transferPaymentSourceId}
              onChange={setTransferPaymentSourceId}
              sources={(() => {
                const walletSources =
                  containerSourceBalances[transferDialog.source?.id || ""] ||
                  {};
                return paymentSources.map((ps) => ({
                  ...ps,
                  balance: walletSources[ps.id]?.balance,
                }));
              })()}
              onQuickAdd={() => {
                setQuickAddOpen(true);
                setQuickAddName("");
                setQuickAddTarget("transfer");
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination Wallet</label>
            <select
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
              value={transferDestId}
              onChange={(e) => setTransferDestId(e.target.value)}
            >
              <option value="">Select a wallet...</option>
              {outcomes
                .filter((o) => o.id !== transferDialog.source?.id)
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title} ({formatRupiah(String(o.balance))})
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Destination Source</Label>
            <PaymentSourceCombobox
              value={transferDestPaymentSourceId}
              onChange={setTransferDestPaymentSourceId}
              sources={paymentSources}
              onQuickAdd={() => {
                setQuickAddOpen(true);
                setQuickAddName("");
                setQuickAddTarget("transferDest");
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <RupiahInput
              value={transferAmount}
              onChange={(val) => setTransferAmount(val || 0)}
              max={
                transferPaymentSourceId
                  ? (containerSourceBalances[
                      transferDialog.source?.id || ""
                    ]?.[transferPaymentSourceId]?.balance ?? 0)
                  : undefined
              }
            />
          </div>
          {transferPaymentSourceId &&
            transferAmount >
              (containerSourceBalances[transferDialog.source?.id || ""]?.[
                transferPaymentSourceId
              ]?.balance ?? 0) && (
              <p className="text-sm text-destructive font-medium">
                Insufficient balance in this source. Max transfer:{" "}
                {formatRupiah(
                  String(
                    containerSourceBalances[
                      transferDialog.source?.id || ""
                    ]?.[transferPaymentSourceId]?.balance ?? 0,
                  ),
                )}
              </p>
            )}
          <Button
            onClick={handleTransfer}
            className="w-full"
            disabled={
              isSubmitting ||
              transferAmount <= 0 ||
              !transferDestId ||
              (transferPaymentSourceId
                ? transferAmount >
                  (containerSourceBalances[
                    transferDialog.source?.id || ""
                  ]?.[transferPaymentSourceId]?.balance ?? 0)
                : false)
            }
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Transfer"}
          </Button>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={reallocateDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setReallocateDialog({ open: false, outcome: null });
            setReallocateFrom("");
            setReallocateTo("");
            setReallocateAmount(0);
          }
        }}
        title={`Move Money in ${reallocateDialog.outcome?.title || ""}`}
      >
        <div className="space-y-4 py-4">
          {(() => {
            const walletSources =
              containerSourceBalances[reallocateDialog.outcome?.id || ""] || {};
            return (
              <div className="flex flex-wrap gap-3 p-3 bg-muted rounded-lg text-sm">
                {paymentSources.map((ps) => {
                  const bal = walletSources[ps.id]?.balance;
                  return (
                    <span
                      key={ps.id}
                      className="text-xs flex items-center gap-1"
                    >
                      {ps.icon && isValidIcon(ps.icon) ? (
                        <DynamicIcon
                          name={ps.icon}
                          className="h-3 w-3 text-muted-foreground"
                        />
                      ) : null}
                      <span className="text-muted-foreground">{ps.name}:</span>{" "}
                      <span
                        className={
                          bal !== undefined && bal < 0
                            ? "text-destructive"
                            : "text-green-600"
                        }
                      >
                        {formatRupiah(String(bal ?? 0))}
                      </span>
                    </span>
                  );
                })}
              </div>
            );
          })()}
          <div className="space-y-2">
            <Label>From</Label>
            <PaymentSourceCombobox
              value={reallocateFrom}
              onChange={setReallocateFrom}
              sources={(() => {
                const walletSources =
                  containerSourceBalances[reallocateDialog.outcome?.id || ""] ||
                  {};
                return paymentSources.map((ps) => ({
                  ...ps,
                  balance: walletSources[ps.id]?.balance,
                }));
              })()}
              placeholder="Select source..."
            />
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <PaymentSourceCombobox
              value={reallocateTo}
              onChange={setReallocateTo}
              sources={(() => {
                const walletSources =
                  containerSourceBalances[reallocateDialog.outcome?.id || ""] ||
                  {};
                return paymentSources
                  .filter((ps) => ps.id !== reallocateFrom)
                  .map((ps) => ({
                    ...ps,
                    balance: walletSources[ps.id]?.balance,
                  }));
              })()}
              placeholder="Select destination..."
            />
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <RupiahInput
              value={reallocateAmount}
              onChange={(val) => setReallocateAmount(val || 0)}
              max={
                reallocateFrom
                  ? (containerSourceBalances[
                      reallocateDialog.outcome?.id || ""
                    ]?.[reallocateFrom]?.balance ?? 0)
                  : undefined
              }
            />
          </div>
          {reallocateAmount > 0 &&
            reallocateFrom &&
            (() => {
              const dest = paymentSources.find((ps) => ps.id === reallocateTo);
              return (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Moving {formatRupiah(String(reallocateAmount))} to
                  {dest?.icon && isValidIcon(dest.icon) ? (
                    <DynamicIcon name={dest.icon} className="h-3 w-3" />
                  ) : null}
                  <span>{dest?.name || "..."}</span>
                </p>
              );
            })()}
          <Button
            onClick={handleReallocate}
            className="w-full"
            disabled={
              isSubmitting ||
              !reallocateFrom ||
              !reallocateTo ||
              reallocateAmount <= 0 ||
              !!(
                reallocateFrom &&
                reallocateAmount >
                  ((containerSourceBalances[
                    reallocateDialog.outcome?.id || ""
                  ]?.[reallocateFrom]?.balance ??
                    reallocateDialog.outcome?.balance) ||
                    0)
              )
            }
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Move Money"}
          </Button>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={migrateDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setMigrateDialog({ open: false, outcome: null });
            setMigratePaymentSourceId("");
          }
        }}
        title={`Migrate Transactions — ${migrateDialog.outcome?.title || ""}`}
      >
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {containerUnassignedCounts[migrateDialog.outcome?.id || ""] || 0} unassigned transaction(s)
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                These are old transactions without a payment source. Choose where to assign them.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Destination Payment Source</Label>
            <PaymentSourceCombobox
              value={migratePaymentSourceId}
              onChange={setMigratePaymentSourceId}
              sources={paymentSources.map((ps) => ({
                ...ps,
                balance:
                  containerSourceBalances[migrateDialog.outcome?.id || ""]?.[
                    ps.id
                  ]?.balance,
              }))}
              placeholder="Select a payment source..."
            />
          </div>
          <Button
            onClick={handleMigrateWallet}
            className="w-full"
            disabled={isMigrating || !migratePaymentSourceId}
          >
            {isMigrating ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Migrate Transactions"
            )}
          </Button>
        </div>
      </ResponsiveDialog>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-2 w-full" />
                <div className="flex gap-6">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : outcomes.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground italic">
            No wallets yet. Create your first one!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {outcomes.map((outcome) => {
            const progress =
              outcome.amount > 0 ? (outcome.balance / outcome.amount) * 100 : 0;

            return (
              <Card key={outcome.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {outcome.icon ? (
                          <DynamicIcon
                            name={outcome.icon}
                            className="w-5 h-5 text-primary"
                          />
                        ) : (
                          <Wallet className="w-5 h-5 text-primary" />
                        )}
                        <CardTitle className="text-xl">
                          {outcome.title}
                        </CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground uppercase font-semibold">
                        {outcome.category}
                      </p>
                      {outcome.default_payment_source_id &&
                        (() => {
                          const ps = paymentSources.find(
                            (s) => s.id === outcome.default_payment_source_id,
                          );
                          return ps ? (
                            <span className="text-[11px] text-muted-foreground/50 flex items-center gap-1">
                              {isValidIcon(ps.icon) ? (
                                <DynamicIcon
                                  name={ps.icon!}
                                  className="h-3 w-3"
                                />
                              ) : null}
                              Default: {ps.name}
                            </span>
                          ) : null;
                        })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingOutcome(outcome);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil size={18} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(outcome.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-2xl font-bold">
                          {formatRupiah(String(outcome.balance))}
                        </div>
                        {outcome.amount > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Budget: {formatRupiah(String(outcome.amount))}
                          </div>
                        )}
                      </div>
                    </div>

                    {outcome.amount > 0 && (
                      <div>
                        <Progress
                          value={Math.min(100, progress)}
                          className="h-2"
                        />
                        <div className="flex justify-start text-xs text-muted-foreground mt-1">
                          <span>{progress.toFixed(0)}% budget left</span>
                          {/* <span>
                            {outcome.balance >= outcome.amount
                              ? "Still Full!"
                              : `${formatRupiah(String(outcome.totalFunded - outcome.totalSpent))} left`}
                          </span> */}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-6 pt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          This Month
                        </span>
                        <div className="font-semibold">
                          <span className="text-green-600">
                            +{formatRupiah(String(outcome.thisMonthFunded))}
                          </span>
                          {" / "}
                          <span className="text-red-600">
                            -{formatRupiah(String(outcome.thisMonthSpent))}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total</span>
                        <div className="font-semibold">
                          <span className="text-green-600">
                            +{formatRupiah(String(outcome.totalFunded))}
                          </span>
                          {" / "}
                          <span className="text-red-600">
                            -{formatRupiah(String(outcome.totalSpent))}
                          </span>
                        </div>
                      </div>
                    </div>
                    {paymentSources.length > 0 &&
                      (() => {
                        const walletSources =
                          containerSourceBalances[outcome.id] || {};
                        return (
                          <div className="pt-2 border-t">
                            <span className="text-xs text-muted-foreground">
                              Per Source
                            </span>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                              {paymentSources.map((ps) => {
                                const bal = walletSources[ps.id]?.balance;
                                return (
                                  <span
                                    key={ps.id}
                                    className="text-xs flex items-center gap-1"
                                  >
                                    {ps.icon && isValidIcon(ps.icon) ? (
                                      <DynamicIcon
                                        name={ps.icon}
                                        className="h-3 w-3 text-muted-foreground/60"
                                      />
                                    ) : null}
                                    <span className="text-muted-foreground/60">
                                      {ps.name}:
                                    </span>{" "}
                                    <span
                                      className={
                                        bal !== undefined && bal < 0
                                          ? "text-destructive"
                                          : "text-green-600"
                                      }
                                    >
                                      {formatRupiah(String(bal ?? 0))}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    {containerUnassignedCounts[outcome.id] > 0 && (
                      <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-amber-700 dark:text-amber-300">
                            ⚠ {containerUnassignedCounts[outcome.id]} transaction(s) without a source
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                            onClick={() => {
                              setMigrateDialog({ open: true, outcome });
                              setMigratePaymentSourceId(
                                outcome.default_payment_source_id || paymentSources[0]?.id || "",
                              );
                            }}
                          >
                            Migrate
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className=" flex gap-3 pt-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFundDialog({ open: true, outcome });
                          setFundAmount(outcome.amount);
                          setFundPaymentSourceId(
                            outcome.default_payment_source_id || "",
                          );
                        }}
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Fund
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setWithdrawDialog({ open: true, outcome });
                          setWithdrawAmount(0);
                          setWithdrawTitle("");
                          setWithdrawPaymentSourceId(
                            outcome.default_payment_source_id || "",
                          );
                        }}
                      >
                        <TrendingDown className="w-4 h-4 mr-1" />
                        Withdraw
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTransferDialog({ open: true, source: outcome });
                          setTransferDestId("");
                          setTransferAmount(0);
                          setTransferPaymentSourceId(
                            outcome.default_payment_source_id || "",
                          );
                        }}
                      >
                        <ArrowLeftRight className="w-4 h-4 mr-1" />
                        Transfer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const balances =
                            containerSourceBalances[outcome.id] || {};
                          const firstWithBalance = Object.entries(
                            balances,
                          ).find(([, b]) => b.balance > 0);
                          setReallocateDialog({ open: true, outcome });
                          setReallocateFrom(
                            firstWithBalance?.[0] ||
                              outcome.default_payment_source_id ||
                              paymentSources[0]?.id ||
                              "",
                          );
                          setReallocateTo("");
                          setReallocateAmount(0);
                        }}
                      >
                        <ArrowLeftRight className="w-4 h-4 mr-1" />
                        Move
                      </Button>
                      <Link
                        href={`/dashboard/transaction?categories=${encodeURIComponent(outcome.category)}`}
                      >
                        <Button variant="outline" size="sm">
                          <List className="w-4 h-4 mr-1" />
                          Transactions
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <AlertDialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!quickAddName.trim()) return;
              fetch("/api/payment-source", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: quickAddName.trim(),
                  icon: newIcon,
                }),
              })
                .then((res) => res.json())
                .then((json) => {
                  if (json.success) {
                    setPaymentSources((prev) => [...prev, json.data]);
                    const newId = json.data.id;
                    if (quickAddTarget === "fund")
                      setFundPaymentSourceId(newId);
                    else if (quickAddTarget === "fundDest")
                      setFundDestinationPaymentSourceId(newId);
                    else if (quickAddTarget === "withdraw")
                      setWithdrawPaymentSourceId(newId);
                    else if (quickAddTarget === "transfer")
                      setTransferPaymentSourceId(newId);
                    else if (quickAddTarget === "transferDest")
                      setTransferDestPaymentSourceId(newId);
                    else if (quickAddTarget === "walletAdd")
                      setNewOutcome((prev) => ({
                        ...prev,
                        defaultPaymentSourceId: newId,
                      }));
                    else if (quickAddTarget === "walletEdit")
                      setEditingOutcome((prev) =>
                        prev
                          ? ({
                              ...prev,
                              default_payment_source_id: newId,
                            } as any)
                          : null,
                      );
                    setQuickAddOpen(false);
                    setQuickAddName("");
                    setQuickAddTarget(null);
                  }
                });
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Add Payment Source</AlertDialogTitle>
              <AlertDialogDescription>
                Create a new payment source (e.g. BCA, Cash, GoPay).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input
                placeholder="Source name"
                value={quickAddName}
                onChange={(e) => setQuickAddName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-4 py-4">
              <Label>Icon</Label>
              <IconPicker value={newIcon} onChange={setNewIcon} />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <AlertDialogAction type="submit">Create</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
