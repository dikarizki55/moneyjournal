"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "../RupiahInput";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import RupiahInput from "../RupiahInput";

interface MonthlyOutcome {
  id: string;
  title: string;
  amount: number;
  category: string;
  spent: number;
}

export default function MonthlyOutcomePage() {
  const [outcomes, setOutcomes] = useState<MonthlyOutcome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOutcome, setNewOutcome] = useState({
    title: "",
    amount: 0,
    category: "",
  });
  const [editingOutcome, setEditingOutcome] = useState<MonthlyOutcome | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchOutcomes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/monthly-outcome");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOutcomes(data);
      } else {
        toast.error(data.message || "Failed to fetch monthly outcomes");
        setOutcomes([]);
      }
    } catch {
      toast.error("Failed to fetch monthly outcomes");
      setOutcomes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOutcomes();
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
        toast.success("Successfully added monthly outcome");
        setNewOutcome({ title: "", amount: 0, category: "" });
        setIsDialogOpen(false);
        fetchOutcomes();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to add outcome");
      }
    } catch {
      toast.error("An error occurred during upload");
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
        toast.success("Successfully updated monthly outcome");
        setIsEditDialogOpen(false);
        setEditingOutcome(null);
        fetchOutcomes();
      } else {
        const error = await res.json();
        toast.error(error.message || "Failed to update outcome");
      }
    } catch {
      toast.error("An error occurred during update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;

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

  const handleApprove = async (outcome: MonthlyOutcome) => {
    const remaining = Math.max(0, outcome.amount - outcome.spent);
    if (remaining <= 0) {
      toast.info("Target already reached for this month");
      return;
    }

    try {
      const res = await fetch("/api/monthly-outcome/approve", {
        method: "POST",
        body: JSON.stringify({
          outcomeId: outcome.id,
          amount: remaining,
        }),
      });

      if (res.ok) {
        toast.success(`Success! Paid Rp ${formatRupiah(remaining.toString())}`);
        fetchOutcomes();
      } else {
        toast.error("Approval failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const getStatus = (spent: number, budget: number) => {
    if (spent >= budget)
      return { label: "Paid", color: "text-green-500", icon: CheckCircle2 };
    if (spent > 0)
      return { label: "Partial", color: "text-blue-500", icon: AlertCircle };
    return {
      label: "Pending",
      color: "text-muted-foreground",
      icon: AlertCircle,
    };
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monthly Outcome</h1>
          <p className="text-muted-foreground">
            Manage your recurring budgets and tracking.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Monthly Budget</DialogTitle>
            </DialogHeader>
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
                  placeholder="e.g. Monthly Gasoline"
                  value={newOutcome.title}
                  onChange={(e) =>
                    setNewOutcome({ ...newOutcome, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g. Transport"
                  value={newOutcome.category}
                  onChange={(e) =>
                    setNewOutcome({ ...newOutcome, category: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Amount</label>
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
                  "Save Budget"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Monthly Budget</DialogTitle>
            </DialogHeader>
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
                  placeholder="e.g. Monthly Gasoline"
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
                  placeholder="e.g. Transport"
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
                <label className="text-sm font-medium">Monthly Amount</label>
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
                  "Update Budget"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : outcomes.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground italic">
            No monthly outcomes set yet.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {outcomes.map((outcome) => {
            const status = getStatus(outcome.spent, outcome.amount);
            const progress = (outcome.spent / outcome.amount) * 100;
            const remaining = Math.max(0, outcome.amount - outcome.spent);

            return (
              <Card key={outcome.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">
                          {outcome.title}
                        </CardTitle>
                        <status.icon className={status.color} size={18} />
                      </div>
                      <p className="text-sm text-muted-foreground uppercase font-semibold">
                        {outcome.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={remaining <= 0}
                        onClick={() => handleApprove(outcome)}
                      >
                        {remaining <= 0 ? "Fully Paid" : "Pay Remaining"}
                      </Button>
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

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        {formatRupiah(outcome.spent.toString())} /{" "}
                        {formatRupiah(outcome.amount.toString())}
                      </span>
                      <span
                        className={
                          remaining > 0
                            ? "text-orange-500 font-bold"
                            : "text-green-500"
                        }
                      >
                        {remaining > 0
                          ? `Remaining: ${formatRupiah(remaining.toString())}`
                          : "Budget Reached"}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
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
