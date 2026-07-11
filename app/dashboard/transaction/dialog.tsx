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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RupiahInput, { formatRupiah } from "../RupiahInput";
import CategoryCombobox from "@/components/ui/category-combobox";
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

type DrawerDialogProps = {
  customButton: React.ReactNode;
  title: string;
  description: string;
  initialData?: FormInput;
  apiLink: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type FormInput = {
  title: string;
  type: "income" | "outcome";
  category: string;
  amount: number | null;
  notes: string;
  date: string;
  isSavings: boolean;
  transferPairId: string | null;
  paymentSourceId: string | null;
};

export function DrawerDialog({
  customButton,
  title,
  description,
  initialData,
  apiLink,
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
          {/* <Button variant="outline">Create Transaction</Button> */}
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
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
      <DrawerTrigger asChild>
        {/* <Button variant="outline">Create Transaction</Button> */}
        {customButton}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <ProfileForm
          setOpen={setOpen}
          className="px-4"
          initialData={initialData}
          apiLink={apiLink}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({
  className,
  apiLink,
  setOpen,
  initialData,
}: React.ComponentProps<"form"> & {
  apiLink: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
  initialData: FormInput | undefined;
}) {
  const [form, setForm] = React.useState<FormInput>({
    title: initialData?.title || "",
    type: initialData?.type || "income",
    category: initialData?.category || "",
    notes: initialData?.notes || "",
    amount: initialData?.amount || null,
    date:
      initialData?.date.split("T")[0] || new Date().toISOString().split("T")[0],
    isSavings: initialData?.isSavings || false,
    transferPairId: initialData?.transferPairId || null,
    paymentSourceId: initialData?.paymentSourceId || null,
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

  const [categoryList, setCategoryList] = React.useState<string[]>([]);
  const [walletCategoryMap, setWalletCategoryMap] = React.useState<
    Map<string, string>
  >(new Map());
  const [walletDefaultSourceMap, setWalletDefaultSourceMap] = React.useState<
    Map<string, string | null>
  >(new Map());
  const [walletIconsMap, setWalletIconsMap] = React.useState<
    Map<string, string>
  >(new Map());
  const [globalBalance, setGlobalBalance] = React.useState(0);
  const [walletBalances, setWalletBalances] = React.useState<
    Map<string, number>
  >(new Map());
  const [paymentSources, setPaymentSources] = React.useState<
    { id: string; name: string; icon?: string | null }[]
  >([]);
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const [quickAddName, setQuickAddName] = React.useState("");

  useEffect(() => {
    const getCategoryList = async () => {
      try {
        const [transactionRes, outcomeRes, balanceRes, paymentSourceRes] = await Promise.all([
          fetch("/api/transaction/distinct/category", {
            credentials: "include",
          }),
          fetch("/api/monthly-outcome", { credentials: "include" }),
          fetch("/api/monthly-outcome/balance", { credentials: "include" }),
          fetch("/api/payment-source", { credentials: "include" }),
        ]);

        const transactionData = await transactionRes.json();
        const outcomeData = await outcomeRes.json();
        const balanceData = await balanceRes.json();

        if (balanceData.success) {
          const balMap = new Map<string, number>();
          balanceData.containers?.forEach(
            (c: { category: string; balance: number }) => {
              if (c.category) balMap.set(c.category.toLowerCase(), c.balance);
            }
          );
          setWalletBalances(balMap);
          setGlobalBalance(balanceData.global?.balance ?? 0);
        }

        const paymentSourceJson = await paymentSourceRes.json();
        if (paymentSourceJson.success) {
          setPaymentSources(paymentSourceJson.data);
        }

        const transactionCats: string[] = transactionData.data || [];
        const outcomeCats: string[] = Array.isArray(outcomeData)
          ? outcomeData.map((o: { category: string }) => o.category)
          : [];

        const combined = Array.from(
          new Set([...transactionCats, ...outcomeCats])
        )
          .filter(Boolean)
          .sort() as string[];

        setCategoryList(combined);

        const walletMap = new Map<string, string>();
        const walletDefaultMap = new Map<string, string | null>();
        const walletIconMap = new Map<string, string>();
        if (Array.isArray(outcomeData)) {
          outcomeData.forEach(
            (w: { category: string; title: string; icon?: string | null; default_payment_source_id?: string | null }) => {
              if (w.category) {
                walletMap.set(w.category.toLowerCase(), w.title);
                if (w.icon) walletIconMap.set(w.category.toLowerCase(), w.icon);
                if (w.default_payment_source_id) {
                  walletDefaultMap.set(w.category.toLowerCase(), w.default_payment_source_id);
                }
              }
            }
          );
        }
        setWalletCategoryMap(walletMap);
        setWalletDefaultSourceMap(walletDefaultMap);
        setWalletIconsMap(walletIconMap);
      } catch {
        // Silently fail
      }
    };

    getCategoryList();
  }, []);

  useEffect(() => {
    const cat = form.category?.toLowerCase();
    const isWallet = cat ? walletCategoryMap.has(cat) : false;
    setForm((prev) => {
      const update: Partial<FormInput> = { isSavings: isWallet };
      if (isWallet && cat && !prev.paymentSourceId) {
        const defaultSource = walletDefaultSourceMap.get(cat);
        if (defaultSource) update.paymentSourceId = defaultSource;
      }
      return { ...prev, ...update };
    });
  }, [form.category, walletCategoryMap, walletDefaultSourceMap]);

  const isWalletCategory = form.category
    ? walletCategoryMap.has(form.category.toLowerCase())
    : false;
  const linkedWalletName = isWalletCategory
    ? walletCategoryMap.get(form.category.toLowerCase())
    : null;

  const isOutcome = form.type === "outcome";
  const walletBalance = form.category
    ? walletBalances.get(form.category.toLowerCase()) ?? 0
    : 0;
  const editBuffer = initialData?.amount ?? 0;
  const availableBalance = isWalletCategory ? walletBalance : globalBalance;
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
            🔗 Linked transfer — edits apply to both transactions
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
            ></RupiahInput>
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-3">
            <div className="grid gap-3">
              <Label htmlFor="type">Type</Label>
              <Tabs
                value={form?.type}
                onValueChange={(value) => {
                  if (form.transferPairId) return;
                  setForm((prev) => {
                    const newType = value as FormInput["type"];
                    if (newType === "outcome") {
                      const newBalance = isWalletCategory
                        ? walletBalance
                        : globalBalance;
                      const newEffective = newBalance + editBuffer;
                      if ((prev.amount ?? 0) > newEffective) {
                        return { ...prev, type: newType, amount: newEffective || null };
                      }
                    }
                    return { ...prev, type: newType };
                  });
                }}
                className="w-full"
              >
                <TabsList>
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="outcome">Outcome</TabsTrigger>
                </TabsList>
              </Tabs>
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
            <CategoryCombobox
              value={form.category}
              onChange={(value) => {
                setForm((prev) => {
                  if (prev.transferPairId) return prev;
                  return { ...prev, category: value };
                });
              }}
              categories={categoryList}
              walletIcons={walletIconsMap}
            />
          </div>
          {isWalletCategory && linkedWalletName && !form.transferPairId && (
            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
              <span className="font-medium">Linked to wallet:</span>{" "}
              <strong>{linkedWalletName}</strong>
              <span className="ml-1 text-xs">
                ({form.type === "income" ? "Fund" : "Withdraw"})
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
            <Label htmlFor="paymentSourceId">Payment Source</Label>
            <PaymentSourceCombobox
              value={form.paymentSourceId || ""}
              onChange={(id) =>
                setForm((prev) => ({
                  ...prev,
                  paymentSourceId: id || null,
                }))
              }
              sources={paymentSources}
              onQuickAdd={() => {
                setQuickAddOpen(true);
                setQuickAddName("");
              }}
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
              max={maxAmount === 999999999999999 ? undefined : maxAmount}
            />
            {exceedsBalance && (
              <p className="text-sm text-destructive font-medium">
                {isWalletCategory
                  ? `Insufficient wallet balance. Available: ${formatRupiah(availableBalance)}.`
                  : `Insufficient global balance. Available: ${formatRupiah(availableBalance)}.`}
              </p>
            )}
          </div>
        </>
      )}
      <Button type="submit" disabled={exceedsBalance}>Save changes</Button>
    </form>

    <AlertDialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
      <AlertDialogContent>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!quickAddName.trim()) return;
          fetch("/api/payment-source", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: quickAddName.trim() }),
          })
            .then((res) => res.json())
            .then((json) => {
              if (json.success) {
                setPaymentSources((prev) => [...prev, json.data]);
                setForm((prev) => ({ ...prev, paymentSourceId: json.data.id }));
                setQuickAddOpen(false);
                setQuickAddName("");
              }
            });
        }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Payment Source</AlertDialogTitle>
            <AlertDialogDescription>Create a new payment source (e.g. BCA, Cash, GoPay).</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Source name"
              value={quickAddName}
              onChange={(e) => setQuickAddName(e.target.value)}
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit">Create</AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
