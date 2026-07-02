"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, RotateCcw, Loader2, ArchiveX } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah } from "../RupiahInput";

interface DeletedTransaction {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  type: "income" | "outcome";
  date: string | null;
  deleted_at: string;
}

interface DeletedMonthlyOutcome {
  id: string;
  title: string;
  amount: number;
  category: string;
  deleted_at: string;
}

export default function RecycleBinPage() {
  const [transactions, setTransactions] = useState<DeletedTransaction[]>([]);
  const [monthlyOutcomes, setMonthlyOutcomes] = useState<DeletedMonthlyOutcome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Set<string>>(new Set());
  const [selectedMo, setSelectedMo] = useState<Set<string>>(new Set());
  const [actionType, setActionType] = useState<"restore" | "permanent" | null>(null);
  const [activeTab, setActiveTab] = useState("transactions");

  const fetchDeleted = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/recycle-bin");
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data.transactions);
        setMonthlyOutcomes(json.data.monthlyOutcomes);
      }
    } catch {
      toast.error("Failed to fetch deleted items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  const handleRestore = async (type: "transaction" | "monthly_outcome", ids: string[]) => {
    try {
      const res = await fetch("/api/recycle-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ids }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Restored successfully");
        setSelectedTx(new Set());
        setSelectedMo(new Set());
        fetchDeleted();
      } else {
        toast.error(json.message || "Failed to restore");
      }
    } catch {
      toast.error("Failed to restore");
    }
  };

  const handlePermanentDelete = async (type: "transaction" | "monthly_outcome", ids: string[]) => {
    try {
      const res = await fetch("/api/recycle-bin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ids }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Permanently deleted");
        setSelectedTx(new Set());
        setSelectedMo(new Set());
        fetchDeleted();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleSelectTx = (id: string) => {
    setSelectedTx((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectMo = (id: string) => {
    setSelectedMo((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllTx = () => {
    if (selectedTx.size === transactions.length) {
      setSelectedTx(new Set());
    } else {
      setSelectedTx(new Set(transactions.map((t) => t.id)));
    }
  };

  const toggleAllMo = () => {
    if (selectedMo.size === monthlyOutcomes.length) {
      setSelectedMo(new Set());
    } else {
      setSelectedMo(new Set(monthlyOutcomes.map((m) => m.id)));
    }
  };

  const confirmAction = (action: "restore" | "permanent") => {
    setActionType(action);
  };

  const executeAction = () => {
    const type = activeTab === "transactions" ? "transaction" : "monthly_outcome";
    const ids = activeTab === "transactions" ? Array.from(selectedTx) : Array.from(selectedMo);
    if (actionType === "restore") handleRestore(type, ids);
    else handlePermanentDelete(type, ids);
    setActionType(null);
  };

  const hasSelection = activeTab === "transactions" ? selectedTx.size > 0 : selectedMo.size > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ArchiveX className="h-8 w-8" />
          Recycle Bin
        </h1>
        <p className="text-muted-foreground">Manage your deleted transactions and monthly outcomes.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="transactions">
              Transactions ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="monthly-outcomes">
              Monthly Outcomes ({monthlyOutcomes.length})
            </TabsTrigger>
          </TabsList>

          {hasSelection && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => confirmAction("restore")}
                className="gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Restore ({activeTab === "transactions" ? selectedTx.size : selectedMo.size})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => confirmAction("permanent")}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete Forever ({activeTab === "transactions" ? selectedTx.size : selectedMo.size})
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="transactions">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground border rounded-lg border-dashed">
              No deleted transactions.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={transactions.length > 0 && selectedTx.size === transactions.length}
                        onCheckedChange={toggleAllTx}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Deleted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTx.has(tx.id)}
                          onCheckedChange={() => toggleSelectTx(tx.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{tx.title}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-semibold uppercase ${tx.type === "income" ? "text-green-600" : "text-destructive"}`}>
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell>{tx.category}</TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === "income" ? "text-green-600" : "text-destructive"}`}>
                        {tx.type === "income" ? "" : "-"}
                        {formatRupiah(Number(tx.amount).toString())}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(tx.deleted_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monthly-outcomes">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : monthlyOutcomes.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground border rounded-lg border-dashed">
              No deleted monthly outcomes.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={monthlyOutcomes.length > 0 && selectedMo.size === monthlyOutcomes.length}
                        onCheckedChange={toggleAllMo}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Deleted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyOutcomes.map((mo) => (
                    <TableRow key={mo.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMo.has(mo.id)}
                          onCheckedChange={() => toggleSelectMo(mo.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{mo.title}</TableCell>
                      <TableCell>{mo.category}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(Number(mo.amount).toString())}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(mo.deleted_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "restore" ? "Restore items?" : "Permanently delete items?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "restore"
                ? "Selected items will be moved back to their original location."
                : "This action cannot be undone. These items will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              {actionType === "restore" ? "Restore" : "Delete Forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
