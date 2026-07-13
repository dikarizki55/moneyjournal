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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatRupiah } from "../RupiahInput";
import TransactionCard from "@/components/transaction/transactionCard";

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
  const [mobileSelectTx, setMobileSelectTx] = useState(false);
  const [mobileSelectMo, setMobileSelectMo] = useState(false);
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
        setMobileSelectTx(false);
        setMobileSelectMo(false);
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
        setMobileSelectTx(false);
        setMobileSelectMo(false);
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
              Wallets ({monthlyOutcomes.length})
            </TabsTrigger>
          </TabsList>

          {hasSelection && (
            <div className="hidden lg:flex items-center gap-2">
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
            <div className="space-y-4">
              <div className="lg:hidden space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
              <div className="hidden lg:block rounded-md border">
                <div className="p-4 space-y-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24 ml-auto" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground border rounded-lg border-dashed">
              No deleted transactions.
            </div>
          ) : (
            <>
              <div className="lg:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{transactions.length} transactions</span>
                  {mobileSelectTx ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedTx(new Set(transactions.map((t) => t.id)))}>Select All</Button>
                      <Button size="sm" variant="outline" onClick={() => { setMobileSelectTx(false); setSelectedTx(new Set()); }}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setMobileSelectTx(true)}>Select</Button>
                  )}
                </div>
                {mobileSelectTx && selectedTx.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => confirmAction("restore")}>
                      <RotateCcw className="h-4 w-4" /> Restore ({selectedTx.size})
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => confirmAction("permanent")}>
                      <Trash2 className="h-4 w-4" /> Delete Forever ({selectedTx.size})
                    </Button>
                  </div>
                )}
                {transactions.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    icon={tx.title.charAt(0).toUpperCase()}
                    title={tx.title}
                    notes=""
                    category={tx.category || "Uncategorized"}
                    amount={tx.type === "outcome" ? -Number(tx.amount) : Number(tx.amount)}
                    selectMode={mobileSelectTx}
                    selected={selectedTx.has(tx.id)}
                    onSelectChange={() => toggleSelectTx(tx.id)}
                    onClick={() => { if (mobileSelectTx) toggleSelectTx(tx.id); }}
                    swipeActions={[
                      { label: "Restore", onClick: () => handleRestore("transaction", [tx.id]) },
                      { label: "Delete Forever", onClick: () => handlePermanentDelete("transaction", [tx.id]) },
                    ]}
                  />
                ))}
              </div>
              <div className="hidden lg:block rounded-md border">
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
            </>
          )}
        </TabsContent>

        <TabsContent value="monthly-outcomes">
          {isLoading ? (
            <div className="space-y-4">
              <div className="lg:hidden space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
              <div className="hidden lg:block rounded-md border">
                <div className="p-4 space-y-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-4 w-6" />
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24 ml-auto" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : monthlyOutcomes.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground border rounded-lg border-dashed">
              No deleted monthly outcomes.
            </div>
          ) : (
            <>
              <div className="lg:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{monthlyOutcomes.length} wallets</span>
                  {mobileSelectMo ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedMo(new Set(monthlyOutcomes.map((m) => m.id)))}>Select All</Button>
                      <Button size="sm" variant="outline" onClick={() => { setMobileSelectMo(false); setSelectedMo(new Set()); }}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setMobileSelectMo(true)}>Select</Button>
                  )}
                </div>
                {mobileSelectMo && selectedMo.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => confirmAction("restore")}>
                      <RotateCcw className="h-4 w-4" /> Restore ({selectedMo.size})
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => confirmAction("permanent")}>
                      <Trash2 className="h-4 w-4" /> Delete Forever ({selectedMo.size})
                    </Button>
                  </div>
                )}
                {monthlyOutcomes.map((mo) => (
                  <TransactionCard
                    key={mo.id}
                    icon={mo.title.charAt(0).toUpperCase()}
                    title={mo.title}
                    notes=""
                    category={mo.category}
                    amount={Number(mo.amount)}
                    selectMode={mobileSelectMo}
                    selected={selectedMo.has(mo.id)}
                    onSelectChange={() => toggleSelectMo(mo.id)}
                    onClick={() => { if (mobileSelectMo) toggleSelectMo(mo.id); }}
                    swipeActions={[
                      { label: "Restore", onClick: () => handleRestore("monthly_outcome", [mo.id]) },
                      { label: "Delete Forever", onClick: () => handlePermanentDelete("monthly_outcome", [mo.id]) },
                    ]}
                  />
                ))}
              </div>
              <div className="hidden lg:block rounded-md border">
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
            </>
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
