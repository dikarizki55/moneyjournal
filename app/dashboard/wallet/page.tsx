"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import RupiahInput from "../RupiahInput";
import { Label } from "@/components/ui/label";
import IconPicker, { DynamicIcon } from "@/components/ui/icon-picker";

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
}

export default function MonthlyOutcomePage() {
  const [outcomes, setOutcomes] = useState<MonthlyOutcome[]>([]);
  const [globalBalance, setGlobalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOutcome, setNewOutcome] = useState({
    title: "",
    amount: 0,
    category: "",
    icon: "",
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
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawTitle, setWithdrawTitle] = useState("");

  const fetchOutcomes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/monthly-outcome");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOutcomes(data);
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

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/monthly-outcome/balance");
      const data = await res.json();
      if (data.success) {
        setGlobalBalance(data.global.balance);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchOutcomes();
    fetchBalance();
  }, []);

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
        setNewOutcome({ title: "", amount: 0, category: "", icon: "" });
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
      const res = await fetch("/api/monthly-outcome", {
        method: "PUT",
        body: JSON.stringify(editingOutcome),
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
        }),
      });

      if (res.ok) {
        toast.success(`Funded ${fundDialog.outcome.title} successfully`);
        setFundDialog({ open: false, outcome: null });
        setFundAmount(0);
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
        }),
      });

      if (res.ok) {
        toast.success(
          `Withdrawn from ${withdrawDialog.outcome.title} successfully`,
        );
        setWithdrawDialog({ open: false, outcome: null });
        setWithdrawAmount(0);
        setWithdrawTitle("");
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

  return (
    <div className="p-6 space-y-6 w-full mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
          <p className="text-muted-foreground">
            Manage your savings wallets and budgets.
          </p>
        </div>

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
            }
          }}
          title={`Fund ${fundDialog.outcome?.title || ""}`}
        >
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Global Balance</span>
              <span
                className={`text-sm font-bold ${globalBalance < 0 ? "text-destructive" : "text-green-600"}`}
              >
                {formatRupiah(String(globalBalance))}
              </span>
            </div>
            <div className="space-y-2">
              <Label>Amount to add</Label>
              <RupiahInput
                value={fundAmount}
                onChange={(val) => setFundAmount(val || 0)}
                max={Math.max(0, globalBalance)}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This will move money from your global balance to this wallet.
            </p>
            {fundAmount > globalBalance && globalBalance > 0 && (
              <p className="text-sm text-destructive font-medium">
                Insufficient balance. You can fund up to{" "}
                {formatRupiah(String(globalBalance))}.
              </p>
            )}
            {globalBalance <= 0 && (
              <p className="text-sm text-destructive font-medium">
                Your global balance is empty or negative. Add income before
                funding wallets.
              </p>
            )}
            <Button
              onClick={handleFund}
              className="w-full"
              disabled={
                isSubmitting || fundAmount <= 0 || fundAmount > globalBalance
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
            }
          }}
          title={`Withdraw from ${withdrawDialog.outcome?.title || ""}`}
        >
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                placeholder="e.g. Groceries"
                value={withdrawTitle}
                onChange={(e) => setWithdrawTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount to withdraw</Label>
              <RupiahInput
                value={withdrawAmount}
                onChange={(val) => setWithdrawAmount(val || 0)}
              />
            </div>
            <Button
              onClick={handleWithdraw}
              className="w-full"
              disabled={isSubmitting || withdrawAmount <= 0}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Withdraw"}
            </Button>
          </div>
        </ResponsiveDialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-primary" size={32} />
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
                          <DynamicIcon name={outcome.icon} className="w-5 h-5 text-primary" />
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
                    <div className=" flex gap-5 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFundDialog({ open: true, outcome });
                          setFundAmount(outcome.amount);
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
                        }}
                      >
                        <TrendingDown className="w-4 h-4 mr-1" />
                        Withdraw
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
