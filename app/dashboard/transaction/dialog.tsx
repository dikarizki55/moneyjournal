"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FullscreenDialog,
} from "@/components/ui/fullscreen-dialog";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { TypeToggle } from "@/components/transaction/type-toggle";
import RupiahInput, { formatRupiah } from "../RupiahInput";
import PaymentSourceCombobox from "@/components/ui/payment-source-combobox";
import CategorySelect from "@/components/ui/category-select";
import WalletSelect from "@/components/ui/wallet-select";
import {
  ResponsiveDialog,
} from "@/components/ui/responsive-dialog";
import CategoryFormFields from "@/components/category/category-form";
import PaymentSourceFormFields from "@/components/payment-source/payment-source-form";

type DrawerDialogProps = {
  customButton: React.ReactNode;
  title: string;
  description: string;
  initialData?: FormInput;
  apiLink: string;
  preloadedData?: PreloadedData;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type FormInput = {
  title: string;
  type: "income" | "outcome";
  categoryId: string;
  amount: number | null;
  notes: string;
  date: string;
  transferPairId: string | null;
  paymentSourceId: string | null;
  walletId: string | null;
};

export type PreloadedData = {
  categories?: { id: string; name: string; icon?: string | null; color?: string | null }[];
  wallets?: { id: string; title: string; icon?: string | null }[];
};

export function DrawerDialog({
  customButton,
  title,
  description,
  initialData,
  apiLink,
  preloadedData,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: DrawerDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen: React.Dispatch<React.SetStateAction<boolean>> =
    externalOnOpenChange !== undefined
      ? (externalOnOpenChange as React.Dispatch<React.SetStateAction<boolean>>)
      : setInternalOpen;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {customButton}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ProfileForm
            setOpen={setOpen}
            className="px-4"
            initialData={initialData}
            apiLink={apiLink}
            preloadedData={preloadedData}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <FullscreenDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      description={description}
      trigger={customButton}
    >
      <ProfileForm
        setOpen={setOpen}
        className=""
        initialData={initialData}
        apiLink={apiLink}
        preloadedData={preloadedData}
      />
    </FullscreenDialog>
  );
}

export function ProfileForm({
  className,
  apiLink,
  setOpen,
  initialData,
  preloadedData,
}: React.ComponentProps<"form"> & {
  apiLink: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  initialData: FormInput | undefined;
  preloadedData?: PreloadedData;
}) {
  const [form, setForm] = React.useState<FormInput>({
    title: initialData?.title || "",
    type: initialData?.type || "income",
    categoryId: initialData?.categoryId || "",
    notes: initialData?.notes || "",
    amount: initialData?.amount || null,
    date:
      initialData?.date.split("T")[0] || new Date().toISOString().split("T")[0],
    transferPairId: initialData?.transferPairId || null,
    paymentSourceId: initialData?.paymentSourceId || null,
    walletId: initialData?.walletId || null,
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(apiLink, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    });
    setOpen(false);
    window.location.reload();
  };

  const [categoryList, setCategoryList] = React.useState<
    { id: string; name: string; icon?: string | null; color?: string | null }[]
  >(preloadedData?.categories || []);
  const [walletList, setWalletList] = React.useState<
    { id: string; title: string; icon?: string | null }[]
  >(preloadedData?.wallets || []);
  const [globalBalance, setGlobalBalance] = React.useState(0);
  const [walletBalances, setWalletBalances] = React.useState<
    Map<string, number>
  >(new Map());
  const [paymentSources, setPaymentSources] = React.useState<
    { id: string; name: string; icon?: string | null }[]
  >([]);
  const [globalPaymentSourceBalances, setGlobalPaymentSourceBalances] = React.useState<
    Record<string, { name: string; balance: number }>
  >({});
  const [containerPaymentSourceBalances, setContainerPaymentSourceBalances] = React.useState<
    Record<string, Record<string, { name: string; balance: number }>>
  >({});
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const [quickAddName, setQuickAddName] = React.useState("");
  const [quickAddIcon, setQuickAddIcon] = React.useState("");
  const [quickAddSubmitting, setQuickAddSubmitting] = React.useState(false);
  const [quickCatAddOpen, setQuickCatAddOpen] = React.useState(false);
  const [quickCatName, setQuickCatName] = React.useState("");
  const [quickCatIcon, setQuickCatIcon] = React.useState("");
  const [quickCatColor, setQuickCatColor] = React.useState("");
  const [quickCatSubmitting, setQuickCatSubmitting] = React.useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, walletRes, balanceRes, paymentSourceRes] = await Promise.all([
          categoryList.length === 0
            ? fetch("/api/category", { credentials: "include" })
            : undefined,
          walletList.length === 0
            ? fetch("/api/monthly-outcome", { credentials: "include" })
            : undefined,
          fetch("/api/monthly-outcome/balance", { credentials: "include" }),
          fetch("/api/payment-source", { credentials: "include" }),
        ]);

        if (categoryRes) {
          const categoryData = await categoryRes.json();
          if (categoryData.success) {
            setCategoryList(categoryData.data);
          }
        }

        if (walletRes) {
          const walletData = await walletRes.json();
          if (Array.isArray(walletData)) {
            setWalletList(walletData.map((w: any) => ({ id: w.id, title: w.title, icon: w.icon })));
          }
        }

        const balanceData = await balanceRes.json();
        if (balanceData.success) {
          const balMap = new Map<string, number>();
          balanceData.containers?.forEach(
            (c: { id: string; balance: number }) => {
              if (c.id) balMap.set(c.id, c.balance);
            }
          );
          setWalletBalances(balMap);
          setGlobalBalance(balanceData.global?.balance ?? 0);

          if (balanceData.global?.paymentSourceBalances) {
            setGlobalPaymentSourceBalances(balanceData.global.paymentSourceBalances);
          }

          const containerPsBal: Record<string, Record<string, { name: string; balance: number }>> = {};
          balanceData.containers?.forEach((c: any) => {
            if (c.id && c.paymentSourceBalances) {
              containerPsBal[c.id] = c.paymentSourceBalances;
            }
          });
          setContainerPaymentSourceBalances(containerPsBal);
        }

        const paymentSourceJson = await paymentSourceRes.json();
        if (paymentSourceJson.success) {
          setPaymentSources(paymentSourceJson.data);
        }
      } catch {
        // Silently fail
      }
    };

    fetchData();
  }, []);

  const selectedWallet = form.walletId;
  const isWalletTransaction = !!selectedWallet;
  const linkedWalletName = isWalletTransaction
    ? walletList.find((w) => w.id === selectedWallet)?.title
    : null;

  const isOutcome = form.type === "outcome";
  const walletBalance = selectedWallet
    ? walletBalances.get(selectedWallet) ?? 0
    : 0;
  const editBuffer = initialData?.amount ?? 0;
  const availableBalance = isWalletTransaction ? walletBalance : globalBalance;
  const effectiveBalance = availableBalance + editBuffer;
  const maxAmount = isOutcome && !form.transferPairId
    ? Math.max(0, effectiveBalance)
    : 999999999999999;
  const exceedsBalance =
    isOutcome &&
    !form.transferPairId &&
    (form.amount ?? 0) > 0 &&
    (form.amount ?? 0) > effectiveBalance;

  React.useEffect(() => {
    if ((form.amount ?? 0) > maxAmount) {
      setForm((prev) => ({ ...prev, amount: maxAmount }));
    }
  }, [maxAmount]);

  return (
    <>
    <form
      className={cn("grid items-start gap-4", className)}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3">
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          onChange={handleOnChange}
          value={form?.title}
        />
      </div>
      {form.transferPairId ? (
        <>
          <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300">
            Linked transfer — edits apply to both transactions
          </div>
          <div className="grid gap-3">
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              onChange={handleOnChange}
              value={form?.title}
            />
          </div>
          <div className="grid gap-3 w-full">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              onChange={handleOnChange}
              value={form?.date}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="amount">Amount</Label>
            <RupiahInput
              id="amount"
              defaultValue={form.amount ?? undefined}
              onChange={(value) =>
                setForm({
                  ...form,
                  amount: value,
                })
              }
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-3">
            <div className="grid gap-3">
              <Label htmlFor="type">Type</Label>
              <TypeToggle
                value={form.type}
                onValueChange={(value) => {
                  if (form.transferPairId) return;
                  setForm((prev) => {
                    if (value === "outcome") {
                      const newBalance = isWalletTransaction
                        ? walletBalance
                        : globalBalance;
                      const newEffective = newBalance + editBuffer;
                      if ((prev.amount ?? 0) > newEffective) {
                        return { ...prev, type: value, amount: newEffective || null };
                      }
                    }
                    return { ...prev, type: value };
                  });
                }}
                disabled={!!form.transferPairId}
              />
            </div>

            <div className="grid gap-3 w-full">
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                onChange={handleOnChange}
                value={form?.date}
              />
            </div>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="category">Category</Label>
            <CategorySelect
              value={form.categoryId}
              onChange={(id) => {
                setForm((prev) => {
                  if (prev.transferPairId) return prev;
                  return { ...prev, categoryId: id };
                });
              }}
              categories={categoryList}
              onQuickAdd={() => {
                setQuickCatAddOpen(true);
                setQuickCatName("");
                setQuickCatIcon("");
                setQuickCatColor("");
              }}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="wallet">Wallet (optional)</Label>
            <WalletSelect
              value={form.walletId || ""}
              onChange={(id) =>
                setForm((prev) => ({ ...prev, walletId: id }))
              }
              wallets={walletList}
            />
          </div>
          {isWalletTransaction && linkedWalletName && !form.transferPairId && (
            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
              <span className="font-medium">Wallet:</span>{" "}
              <strong>{linkedWalletName}</strong>
              <span className="ml-1 text-xs">
                ({form.type === "income" ? "Fund" : "Spend"})
              </span>
            </div>
          )}
          <div className="grid gap-3">
            <Label htmlFor="notes">Notes</Label>
            <Input
              type="text"
              id="notes"
              onChange={handleOnChange}
              value={form?.notes}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="paymentSourceId">Payment Source *</Label>
            <PaymentSourceCombobox
              value={form.paymentSourceId || ""}
              onChange={(id) =>
                setForm((prev) => ({
                  ...prev,
                  paymentSourceId: id || null,
                }))
              }
              sources={paymentSources.map((ps) => ({
                ...ps,
                balance: form.walletId
                  ? (containerPaymentSourceBalances[form.walletId]?.[ps.id]?.balance ?? 0)
                  : (globalPaymentSourceBalances[ps.id]?.balance ?? 0),
              }))}
              onQuickAdd={() => {
                setQuickAddOpen(true);
                setQuickAddName("");
                setQuickAddIcon("");
              }}
            />
            {!form.paymentSourceId && (
              <p className="text-xs text-destructive">Payment source is required</p>
            )}
          </div>
          <div className="grid gap-3">
            <Label htmlFor="amount">Amount</Label>
            <RupiahInput
              id="amount"
              defaultValue={form.amount ?? undefined}
              onChange={(value) =>
                setForm({
                  ...form,
                  amount: value,
                })
              }
              max={maxAmount === 999999999999999 ? undefined : maxAmount}
            />
            {exceedsBalance && (
              <p className="text-sm text-destructive font-medium">
                {isWalletTransaction
                  ? `Insufficient wallet balance. Available: ${formatRupiah(availableBalance)}.`
                  : `Insufficient global balance. Available: ${formatRupiah(availableBalance)}.`}
              </p>
            )}
          </div>
        </>
      )}
      <Button type="submit" disabled={exceedsBalance || !form.paymentSourceId || !form.categoryId}>
        Save changes
      </Button>
    </form>

    <ResponsiveDialog
      open={quickAddOpen}
      onOpenChange={setQuickAddOpen}
      title="Add Payment Source"
      description="Create a new payment source (e.g. BCA, Cash, GoPay)."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!quickAddName.trim()) return;
          setQuickAddSubmitting(true);
          fetch("/api/payment-source", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: quickAddName.trim(), icon: quickAddIcon }),
          })
            .then((res) => res.json())
            .then((json) => {
              if (json.success) {
                setPaymentSources((prev) => [...prev, json.data]);
                setForm((prev) => ({ ...prev, paymentSourceId: json.data.id }));
                setQuickAddOpen(false);
                setQuickAddName("");
                setQuickAddIcon("");
              }
            })
            .finally(() => setQuickAddSubmitting(false));
        }}
        className="space-y-4 py-4"
      >
        <PaymentSourceFormFields
          values={{ name: quickAddName, icon: quickAddIcon }}
          onChange={(vals) => {
            setQuickAddName(vals.name);
            setQuickAddIcon(vals.icon);
          }}
        />
        <Button type="submit" className="w-full" disabled={quickAddSubmitting}>
          {quickAddSubmitting ? <Loader2 className="animate-spin" /> : "Save Source"}
        </Button>
      </form>
    </ResponsiveDialog>

    <ResponsiveDialog
      open={quickCatAddOpen}
      onOpenChange={setQuickCatAddOpen}
      title="Add Category"
      description="Create a new transaction category."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!quickCatName.trim()) return;
          setQuickCatSubmitting(true);
          fetch("/api/category", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: quickCatName.trim(), icon: quickCatIcon, color: quickCatColor }),
          })
            .then((res) => res.json())
            .then((json) => {
              if (json.success) {
                setCategoryList((prev) => [...prev, json.data]);
                setForm((prev) => ({ ...prev, categoryId: json.data.id }));
                setQuickCatAddOpen(false);
                setQuickCatName("");
                setQuickCatIcon("");
                setQuickCatColor("");
              }
            })
            .finally(() => setQuickCatSubmitting(false));
        }}
        className="space-y-4 py-4"
      >
        <CategoryFormFields
          values={{ name: quickCatName, icon: quickCatIcon, color: quickCatColor }}
          onChange={(vals) => {
            setQuickCatName(vals.name);
            setQuickCatIcon(vals.icon);
            setQuickCatColor(vals.color);
          }}
        />
        <Button type="submit" className="w-full" disabled={quickCatSubmitting}>
          {quickCatSubmitting ? <Loader2 className="animate-spin" /> : "Save Category"}
        </Button>
      </form>
    </ResponsiveDialog>
    </>
  );
}
