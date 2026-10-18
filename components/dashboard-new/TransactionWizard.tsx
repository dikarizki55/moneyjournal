"use client";

import Sheet from "@/components/dashboard-new/Sheet";
import {
  IconCalendar,
  IconWallet,
  IconCheckmark,
  IconPlus,
} from "@/components/dashboard-new/Icon";
import { formatRupiah, formatRupiahPlain } from "@/lib/api";
import { colorToClasses, resolveIcon } from "@/lib/icon-map";
import type { TransactionItem } from "@/lib/dashboard-new-types";
import {
  useCategories,
  usePaymentSources,
  useWallets,
} from "@/hooks/use-dashboard-new";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type SelectItem = {
  id: string;
  label: string;
  sublabel?: string | null;
  icon?: React.ComponentType<{ className?: string }> | null;
  iconColorTailwind?: string;
  rightLabel?: string | null;
};

export const WIZARD_STEPS = [
  "type",
  "amount",
  "title",
  "category",
  "wallet",
  "source",
  "date",
  "notes",
  "review",
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

export type WizardData = {
  type: "income" | "outcome";
  amount: number;
  title: string;
  categoryId: string | null;
  paymentSourceId: string | null;
  walletId: string | null;
  date: string;
  notes: string;
};

const STEP_LABELS: Record<WizardStep, string> = {
  type: "Transaction type",
  amount: "Amount",
  title: "Title",
  category: "Category",
  source: "Payment source",
  wallet: "Wallet",
  date: "Date",
  notes: "Notes",
  review: "Review",
};

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export function emptyWizardData(): WizardData {
  return {
    type: "outcome",
    amount: 0,
    title: "",
    categoryId: null,
    paymentSourceId: null,
    walletId: null,
    date: todayString(),
    notes: "",
  };
}

export function wizardDataFromTransaction(tx: TransactionItem): WizardData {
  return {
    type: tx.type,
    amount: Number(tx.amount),
    title: tx.title,
    categoryId: tx.category_id ?? null,
    paymentSourceId: tx.payment_source_id ?? null,
    walletId: tx.wallet_id ?? null,
    date: tx.date
      ? new Date(tx.date).toISOString().split("T")[0]
      : todayString(),
    notes: tx.notes ?? "",
  };
}

export function stepIsValid(step: WizardStep, data: WizardData) {
  switch (step) {
    case "amount":
      return data.amount > 0;
    case "title":
      return data.title.trim().length > 0;
    case "category":
      return !!data.categoryId;
    case "wallet":
      return !!data.walletId;
    case "source":
      return !!data.paymentSourceId;
    default:
      return true;
  }
}

function Progress({ step }: { step: WizardStep }) {
  const idx = WIZARD_STEPS.indexOf(step);
  return (
    <div className="w-full flex items-center gap-1.5 px-1">
      {WIZARD_STEPS.map((s, i) => (
        <span
          key={s}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i <= idx ? "bg-new-primary" : "bg-new-muted-background"
          }`}
        />
      ))}
    </div>
  );
}

export function InlineSelector({
  items,
  value,
  onChange,
  emptyMessage = "Nothing available",
  onCreate,
  createLabel = "Add new",
  allowDeselect = false,
}: {
  items: SelectItem[];
  value: string | null;
  onChange: (id: string | null) => void;
  emptyMessage?: string;
  onCreate?: () => void;
  createLabel?: string;
  allowDeselect?: boolean;
}) {
  return (
    <div className="w-full flex flex-col gap-2">
      {items.map((item, idx) => {
        const isActive = item.id === value;
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            className="flex justify-between items-center px-4 py-4 w-full text-left bg-new-background rounded-[16px] shadow-soft"
            onClick={() => onChange(allowDeselect && isActive ? null : item.id)}
          >
            <span className="flex gap-3 items-center min-w-0">
              {item.icon && (
                <span
                  className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
                    item.iconColorTailwind ??
                    "bg-new-muted-background text-new-muted-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium">{item.label}</span>
                {item.sublabel && (
                  <span className="block text-xs text-new-muted-foreground truncate">
                    {item.sublabel}
                  </span>
                )}
              </span>
            </span>
            <span className="shrink-0 flex items-center gap-3">
              {item.rightLabel && (
                <span className="text-xs font-semibold text-new-muted-foreground">
                  {item.rightLabel}
                </span>
              )}
              <span className="relative w-5 h-5">
                <AnimatePresence mode="sync">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    key={`${item.id}-${isActive ? "active" : "inactive"}`}
                    className={`absolute text-new-background rounded-full w-5 h-5 ${
                      isActive
                        ? "bg-new-primary"
                        : "bg-new-background border-new-muted-foreground border"
                    } flex items-center justify-center`}
                  >
                    <IconCheckmark />
                  </motion.span>
                </AnimatePresence>
              </span>
            </span>
          </motion.button>
        );
      })}
      {items.length === 0 && !onCreate && (
        <p className="text-sm text-new-muted-foreground text-center py-10">
          {emptyMessage}
        </p>
      )}
      {onCreate && (
        <button
          onClick={onCreate}
          className="mx-auto mt-2 rounded-[14px] bg-new-primary-background text-new-primary font-semibold text-sm py-3 px-6 flex items-center justify-center gap-2"
        >
          <IconPlus className="w-4 h-4" />
          {createLabel}
        </button>
      )}
    </div>
  );
}

export default function TransactionWizard({
  initial,
  onClose,
  onSaved,
  startStep = "type",
}: {
  initial?: WizardData;
  onClose: () => void;
  onSaved?: (tx: TransactionItem | null) => void;
  startStep?: WizardStep;
}) {
  const [step, setStep] = useState<WizardStep>(startStep);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [data, setData] = useState<WizardData>(initial ?? emptyWizardData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quickCreate, setQuickCreate] = useState<"category" | "source" | null>(
    null,
  );
  const [quickName, setQuickName] = useState("");
  const [isQuickCreating, setIsQuickCreating] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  const {
    data: categories,
    refetch: refetchCategories,
    isLoading: categoriesLoading,
  } = useCategories();
  const {
    data: paymentSources,
    refetch: refetchSources,
    isLoading: sourcesLoading,
  } = usePaymentSources();
  const {
    data: wallets,
    refetch: refetchWallets,
    isLoading: walletsLoading,
  } = useWallets();

  const set = <K extends keyof WizardData>(key: K, value: WizardData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    set("paymentSourceId", null);
  }, [data.walletId]);

  useEffect(() => {
    if (step !== "title") return;
    const t = setTimeout(() => titleRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [step]);

  const goTo = (next: WizardStep) => {
    setDirection(1);
    setStep(next);
  };

  const goBack = () => {
    const idx = WIZARD_STEPS.indexOf(step);
    if (idx <= 0) return;
    setDirection(-1);
    setStep(WIZARD_STEPS[idx - 1]);
  };

  const handleNext = () => {
    if (!stepIsValid(step, data)) {
      if (step === "amount") toast.error("Enter an amount greater than 0");
      if (step === "title") toast.error("Enter a title");
      if (step === "category") toast.error("Select a category");
      if (step === "wallet") toast.error("Select a wallet");
      if (step === "source") toast.error("Select a payment source");
      return;
    }
    const idx = WIZARD_STEPS.indexOf(step);
    if (idx < WIZARD_STEPS.length - 1) {
      goTo(WIZARD_STEPS[idx + 1]);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    if (!data.categoryId) return toast.error("Category is required");
    if (!data.paymentSourceId) return toast.error("Payment source is required");
    if (data.amount <= 0) return toast.error("Amount must be greater than 0");
    if (!data.title.trim()) return toast.error("Title is required");

    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title.trim(),
        amount: data.amount,
        type: data.type,
        categoryId: data.categoryId,
        paymentSourceId: data.paymentSourceId,
        walletId: data.walletId || null,
        date: data.date || undefined,
        notes: data.notes.trim() || undefined,
      };

      const res = await fetch("/api/transaction", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.message || "Failed to save transaction");
      }

      const saved: TransactionItem | undefined = body.data
        ? {
            ...body.data,
            amount: Number(body.data.amount),
            date: body.data.date
              ? new Date(body.data.date).toISOString()
              : null,
            created_at: null,
          }
        : undefined;

      toast.success("Transaction created");
      refetchCategories();
      refetchSources();
      refetchWallets();
      onSaved?.(saved as TransactionItem);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions: SelectItem[] = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: c.name,
        icon: resolveIcon(c.icon),
        iconColorTailwind: colorToClasses(c.color),
      })),
    [categories],
  );

  const selectedWallet = wallets.find((w) => w.id === data.walletId);

  const sourceOptions: SelectItem[] = useMemo(() => {
    const wallet =
      selectedWallet ?? wallets.find((w) => w.id === data.walletId);
    if (!wallet) return [];

    const walletSources: SelectItem[] = wallet.paymentSources
      .filter(
        (ps): ps is {
          id: string;
          name: string;
          icon: string | null;
          amount: number;
        } => ps.id != null,
      )
      .map((ps) => ({
        id: ps.id,
        label: ps.name,
        icon: resolveIcon(ps.icon),
        iconColorTailwind: "bg-new-primary-background text-new-primary",
        rightLabel: formatRupiahPlain(ps.amount),
      }));

    if (data.paymentSourceId) {
      const existingInWallet = walletSources.some(
        (s) => s.id === data.paymentSourceId,
      );
      if (!existingInWallet) {
        const globalSource = paymentSources.find(
          (p) => p.id === data.paymentSourceId,
        );
        if (globalSource) {
          walletSources.push({
            id: globalSource.id,
            label: globalSource.name,
            icon: resolveIcon(globalSource.icon),
            iconColorTailwind: "bg-new-primary-background text-new-primary",
            rightLabel: "\u2014",
            sublabel: "Not linked to this wallet",
          });
        }
      }
    }

    return walletSources;
  }, [
    selectedWallet,
    wallets,
    data.walletId,
    data.paymentSourceId,
    paymentSources,
  ]);

  const walletOptions: SelectItem[] = useMemo(
    () =>
      wallets.map((w) => ({
        id: w.id,
        label: w.title,
        rightLabel: formatRupiahPlain(w.balance),
        icon: resolveIcon(w.icon),
        iconColorTailwind: "bg-new-accent-blue-background text-new-accent-blue",
      })),
    [wallets],
  );

  const selectedCategory = categories.find((c) => c.id === data.categoryId);
  const selectedSource = paymentSources.find(
    (p) => p.id === data.paymentSourceId,
  );

  const submitQuickCreate = async () => {
    const name = quickName.trim();
    if (!name || !quickCreate) return;

    setIsQuickCreating(true);
    try {
      const isCategory = quickCreate === "category";
      const res = await fetch(
        isCategory ? "/api/category" : "/api/payment-source",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isCategory
              ? { name, color: "#1db252" }
              : { name, walletId: data.walletId },
          ),
        },
      );
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body.message || "Failed to create");
      }

      if (isCategory) {
        refetchCategories();
        set("categoryId", body.data.id);
      } else {
        refetchSources();
        refetchWallets();
        set("paymentSourceId", body.data.id);
      }

      toast.success(`${isCategory ? "Category" : "Payment source"} created`);
      setQuickName("");
      setQuickCreate(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsQuickCreating(false);
    }
  };

  const slideVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir * 40 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
  };

  const isFirst = WIZARD_STEPS.indexOf(step) === 0;
  const isLast = WIZARD_STEPS.indexOf(step) === WIZARD_STEPS.length - 1;

  return (
    <div className="flex flex-col min-h-full">
      <div className="w-full pt-5 px-5">
        <div className="w-full py-2 flex justify-between items-center">
          <div className="w-16 text-left">
            <button
              onClick={isFirst ? onClose : goBack}
              className="text-new-primary text-sm"
            >
              {isFirst ? "Cancel" : "Back"}
            </button>
          </div>
          <div className="text-sm font-semibold text-new-muted-foreground">
            {STEP_LABELS[step]}
          </div>
          <div className="w-16 text-right">
            <button
              onClick={onClose}
              className="text-new-primary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
        <div className="mt-3">
          <Progress step={step} />
        </div>
      </div>

      <div className="flex-1 px-5 pt-8 pb-4 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.5, 0, 0.1, 1] }}
          >
            {step === "type" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">
                  Is this income or outcome?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {(["outcome", "income"] as const).map((t) => (
                    <motion.button
                      key={t}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => set("type", t)}
                      className={`rounded-[20px] py-8 shadow-soft capitalize font-semibold transition-colors ${
                        data.type === t
                          ? t === "income"
                            ? "bg-new-primary text-new-background"
                            : "bg-new-accent-red text-new-background"
                          : "bg-new-background text-new-muted-foreground"
                      }`}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {step === "amount" && (
              <div className="flex flex-col">
                <h2 className="text-xl font-bold mb-8">How much?</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-new-muted-foreground">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={
                      data.amount > 0 ? formatRupiahPlain(data.amount) : ""
                    }
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^\d]/g, "");
                      set("amount", digits ? Number(digits) : 0);
                    }}
                    placeholder="0"
                    className="w-full text-[40px] font-bold tracking-tight bg-transparent border-none outline-none placeholder:text-new-muted-foreground/30"
                  />
                </div>
              </div>
            )}

            {step === "title" && (
              <div className="flex flex-col">
                <h2 className="text-xl font-bold mb-2">What is it for?</h2>
                <p className="text-sm text-new-muted-foreground mb-6">
                  Give this transaction a short name.
                </p>
                <input
                  ref={titleRef}
                  value={data.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Lunch at Bakmi GM"
                  className="w-full text-lg bg-transparent border-none outline-none placeholder:text-new-muted-foreground/50"
                />
              </div>
            )}

            {step === "category" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-center">
                  Pick a category
                </h2>
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-new-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <InlineSelector
                    items={categoryOptions}
                    value={data.categoryId}
                    onChange={(id) => set("categoryId", id)}
                    emptyMessage="No category yet"
                    onCreate={() => {
                      setQuickName("");
                      setQuickCreate("category");
                    }}
                    createLabel="Add new category"
                  />
                )}
              </div>
            )}

            {step === "source" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-center">
                  Pay from where?
                </h2>
                {walletsLoading || sourcesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-new-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !selectedWallet ? (
                  <p className="text-sm text-new-muted-foreground text-center py-8">
                    Select a wallet first
                  </p>
                ) : (
                  <InlineSelector
                    items={sourceOptions}
                    value={data.paymentSourceId}
                    onChange={(id) => set("paymentSourceId", id)}
                    emptyMessage="No payment source in this wallet"
                    onCreate={() => {
                      setQuickName("");
                      setQuickCreate("source");
                    }}
                    createLabel="Add new payment source"
                  />
                )}
              </div>
            )}

            {step === "wallet" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-center">Which wallet?</h2>
                {walletsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-new-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <InlineSelector
                    items={walletOptions}
                    value={data.walletId}
                    onChange={(id) => set("walletId", id)}
                    emptyMessage="No wallet yet"
                  />
                )}
              </div>
            )}

            {step === "date" && (
              <div className="flex flex-col">
                <h2 className="text-xl font-bold mb-8">Which date?</h2>
                <input
                  type="date"
                  value={data.date}
                  onChange={(e) => set("date", e.target.value)}
                  className="w-full text-lg bg-transparent border-none outline-none"
                />
              </div>
            )}

            {step === "notes" && (
              <div className="flex flex-col">
                <h2 className="text-xl font-bold mb-2">Add a note</h2>
                <p className="text-sm text-new-muted-foreground mb-6">
                  Optional. Anything you want to remember.
                </p>
                <textarea
                  value={data.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Notes (optional)"
                  rows={5}
                  className="w-full text-base bg-transparent border-none outline-none resize-none placeholder:text-new-muted-foreground/50"
                />
              </div>
            )}

            {step === "review" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold">Review</h2>
                <div className="rounded-[20px] shadow-soft bg-new-background px-5 py-5">
                  <div className="flex items-center gap-3">
                    {selectedCategory && (
                      <span
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${colorToClasses(selectedCategory.color)}`}
                      >
                        {(() => {
                          const Icon = resolveIcon(selectedCategory.icon);
                          return <Icon className="w-6 h-6" />;
                        })()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold truncate">{data.title}</h3>
                      <p className="text-xs text-new-muted-foreground truncate">
                        {[
                          selectedCategory?.name,
                          selectedSource?.name,
                          selectedWallet?.title,
                        ]
                          .filter(Boolean)
                          .join(" \u2022 ")}
                      </p>
                    </div>
                  </div>
                  <hr className="bg-new-muted-foreground opacity-10 my-4" />
                  <h3
                    className={`text-2xl font-bold ${
                      data.type === "income"
                        ? "text-new-primary"
                        : "text-new-accent-red"
                    }`}
                  >
                    {data.type === "outcome" && "- "}
                    {formatRupiah(data.amount)}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-new-muted-foreground">
                    <IconCalendar className="w-3.5 h-3.5" />
                    {data.date}
                  </div>
                  {data.notes && (
                    <p className="text-sm text-new-muted-foreground mt-3 whitespace-pre-wrap">
                      {data.notes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-5 pt-2 pb-8">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          disabled={!stepIsValid(step, data) || isSubmitting}
          className={`w-full rounded-full py-4 font-semibold transition-colors ${
            stepIsValid(step, data) && !isSubmitting
              ? "bg-new-primary text-new-background"
              : "bg-new-muted-background text-new-muted-foreground"
          }`}
        >
          {isSubmitting
            ? "Saving..."
            : isLast
            ? "Save Transaction"
            : "Next"}
        </motion.button>
      </div>

      <Sheet
        open={!!quickCreate}
        onClose={() => setQuickCreate(null)}
        title={
          quickCreate === "category" ? "New category" : "New payment source"
        }
        closeLabel="Cancel"
        showClose={false}
      >
        <div className="px-5 pb-12">
          <div className="rounded-[20px] shadow-soft bg-new-background px-5 py-4">
            <input
              autoFocus
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitQuickCreate();
              }}
              placeholder="Name"
              className="w-full text-sm bg-transparent border-none outline-none placeholder:text-new-muted-foreground/50"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={submitQuickCreate}
            disabled={!quickName.trim() || isQuickCreating}
            className={`w-full rounded-full py-4 font-semibold mt-3 ${
              quickName.trim() && !isQuickCreating
                ? "bg-new-primary text-new-background"
                : "bg-new-muted-background text-new-muted-foreground"
            }`}
          >
            {isQuickCreating ? "Creating..." : "Create"}
          </motion.button>
        </div>
      </Sheet>
    </div>
  );
}