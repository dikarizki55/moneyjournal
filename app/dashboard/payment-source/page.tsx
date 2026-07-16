"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
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
import IconPicker, {
  DynamicIcon,
  isValidIcon,
} from "@/components/ui/icon-picker";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CreditCard,
  ArchiveX,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "../RupiahInput";
import { toast } from "sonner";
import TransactionCard from "@/components/transaction/transactionCard";
import PaymentSourceCombobox from "@/components/ui/payment-source-combobox";

interface PaymentSourceItem {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
  default: boolean;
}

export default function PaymentSourcePage() {
  const [sources, setSources] = useState<PaymentSourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<PaymentSourceItem | null>(
    null,
  );
  const [editingSource, setEditingSource] = useState<PaymentSourceItem | null>(
    null,
  );
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [migrateSourceId, setMigrateSourceId] = useState("");
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrateDone, setMigrateDone] = useState(false);
  const [sourceBalances, setSourceBalances] = useState<Record<string, number>>(
    {},
  );
  const [deleteMigrateSource, setDeleteMigrateSource] =
    useState<PaymentSourceItem | null>(null);
  const [deleteMigrateDestId, setDeleteMigrateDestId] = useState("");

  const fetchBalances = async () => {
    try {
      const res = await fetch("/api/monthly-outcome/balance");
      const json = await res.json();
      if (json.success) {
        setUnassignedCount(json.unassignedTransactionCount ?? 0);
        const balMap: Record<string, number> = {};
        if (Array.isArray(json.paymentSourceTotals)) {
          for (const item of json.paymentSourceTotals) {
            balMap[item.uuid] = item.amount;
          }
        }
        setSourceBalances(balMap);
      }
    } catch {
      // silently fail
    }
  };

  const fetchSources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/payment-source");
      const json = await res.json();
      if (json.success) setSources(json.data);
    } catch {
      toast.error("Failed to fetch payment sources");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
    fetchBalances();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payment-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), icon: newIcon || null }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Payment source created");
        setAddDialogOpen(false);
        setNewName("");
        setNewIcon("");
        fetchSources();
      } else {
        toast.error(json.message || "Failed to create");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (source: PaymentSourceItem) => {
    setEditingSource(source);
    setNewName(source.name);
    setNewIcon(source.icon || "");
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editingSource || !newName.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payment-source", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSource.id,
          name: newName.trim(),
          icon: newIcon || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Payment source updated");
        setEditDialogOpen(false);
        setEditingSource(null);
        fetchSources();
      } else {
        toast.error(json.message || "Failed to update");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMigrate = async () => {
    if (!deleteMigrateSource || !deleteMigrateDestId) {
      toast.error("Select a destination payment source");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/payment-source?id=${deleteMigrateSource.id}&migrateTo=${deleteMigrateDestId}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (json.success) {
        toast.success("Payment source migrated and deleted");
        setDeleteMigrateSource(null);
        setDeleteMigrateDestId("");
        fetchSources();
        fetchBalances();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/payment-source?id=${deleteConfirm.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Payment source deleted");
        setDeleteConfirm(null);
        fetchSources();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMigrate = async () => {
    if (!migrateSourceId) {
      toast.error("Select a payment source");
      return;
    }
    setIsMigrating(true);
    try {
      const res = await fetch("/api/payment-source/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentSourceId: migrateSourceId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setUnassignedCount(0);
        setMigrateDone(true);
      } else {
        toast.error(json.message || "Migration failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSetDefault = async (source: PaymentSourceItem) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payment-source/default", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: source.id }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Payment source set as default");
        fetchSources();
      } else {
        toast.error(json.message || "Failed to set as default");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Payment Sources
        </h1>
        <p className="text-muted-foreground">
          Manage how you pay — cash, bank accounts, e-wallets, and more.
        </p>
      </div>

      {/* {unassignedCount > 0 && !migrateDone && (
        <div className="mb-6 p-4 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {unassignedCount} transaction(s) without a payment source
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                These transactions won't be counted in any payment source balance.
                Assign them to a source below.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1">
                  <PaymentSourceCombobox
                    value={migrateSourceId}
                    onChange={setMigrateSourceId}
                    sources={sources}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleMigrate}
                  disabled={isMigrating || !migrateSourceId}
                  className="gap-1"
                >
                  {isMigrating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Migrate"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      <div className="flex justify-end mb-6">
        <Button
          onClick={() => {
            setNewName("");
            setNewIcon("");
            setAddDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus size={18} />
          Add Source
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="lg:hidden space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 border rounded-lg"
              >
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden lg:block rounded-md border">
            <div className="p-4 space-y-4">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-4 w-24" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24 ml-auto" />
                  <div className="flex gap-1">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : sources.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground border rounded-lg border-dashed">
          <ArchiveX className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No payment sources yet. Add your first one!</p>
        </div>
      ) : (
        <>
          <div className="lg:hidden space-y-3">
            {sources.map((source) => (
              <TransactionCard
                key={source.id}
                icon={source.icon || source.name.charAt(0).toUpperCase()}
                title=""
                category={source.name}
                notes=""
                amount={sourceBalances[source.id] ?? 0}
                defaultBadge={source.default}
                onClick={() => openEdit(source)}
                swipeActions={[
                  {
                    label: "Delete",
                    onClick: () => {
                      if ((sourceBalances[source.id] ?? 0) !== 0) {
                        setDeleteMigrateSource(source);
                        setDeleteMigrateDestId("");
                      } else {
                        setDeleteConfirm(source);
                      }
                    },
                  },
                ]}
              />
            ))}
          </div>
          <div className="hidden lg:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">No</TableHead>
                  <TableHead className="w-12">Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-30">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((source, idx) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="w-8 h-8 flex items-center justify-center bg-primary text-secondary rounded-lg text-sm">
                        {isValidIcon(source.icon) ? (
                          <DynamicIcon
                            name={source.icon!}
                            className="h-4 w-4"
                          />
                        ) : (
                          <span>{source.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {source.name}{" "}
                      {source.default && (
                        <span className=" ml-3 text-muted-foreground text-sm">
                          Default
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(source.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 ${source.default ? "opacity-100" : "opacity-50"}`}
                          onClick={() => handleSetDefault(source)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(source)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if ((sourceBalances[source.id] ?? 0) !== 0) {
                              setDeleteMigrateSource(source);
                              setDeleteMigrateDestId("");
                            } else {
                              setDeleteConfirm(source);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <ResponsiveDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        title="Add Payment Source"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="psName">Name</Label>
            <Input
              id="psName"
              placeholder="e.g. BCA Bank, Cash, GoPay"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker value={newIcon} onChange={setNewIcon} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Save Source"
            )}
          </Button>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          if (!open) setEditingSource(null);
          setEditDialogOpen(open);
        }}
        title="Edit Payment Source"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEdit();
          }}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="psEditName">Name</Label>
            <Input
              id="psEditName"
              placeholder="e.g. BCA Bank"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Icon (optional)</Label>
            <IconPicker value={newIcon} onChange={setNewIcon} />
          </div>
          {editingSource && !editingSource.default && (
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                if (editingSource) handleSetDefault(editingSource);
              }}
              disabled={isSubmitting}
            >
              <Star className="h-4 w-4" />
              Set as Default
            </Button>
          )}
          {editingSource?.default && (
            <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1">
              {/* <Star className="h-4 w-4 fill-white text-white" /> */}
              Current default
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Update Source"
            )}
          </Button>
        </form>
      </ResponsiveDialog>

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirm(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete payment source?</AlertDialogTitle>
            <AlertDialogDescription>
              This source has no remaining balance and will be removed
              permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ResponsiveDialog
        open={!!deleteMigrateSource}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteMigrateSource(null);
            setDeleteMigrateDestId("");
          }
        }}
        title={`Delete ${deleteMigrateSource?.name || ""}`}
      >
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                This source has a balance of{" "}
                {formatRupiah(
                  String(sourceBalances[deleteMigrateSource?.id || ""] ?? 0),
                )}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Migrate all transactions to another payment source before
                deleting.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Migrate transactions to</Label>
            <PaymentSourceCombobox
              value={deleteMigrateDestId}
              onChange={setDeleteMigrateDestId}
              sources={sources.filter((s) => s.id !== deleteMigrateSource?.id)}
            />
          </div>
          <Button
            onClick={handleDeleteMigrate}
            className="w-full gap-2"
            disabled={isSubmitting || !deleteMigrateDestId}
            variant="destructive"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Migrate & Delete
              </>
            )}
          </Button>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
