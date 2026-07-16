"use client";
import { useState, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { formatRupiah } from "@/app/dashboard/RupiahInput";
import { DynamicIcon, isValidIcon } from "@/components/ui/icon-picker";
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
import { Star } from "lucide-react";

export default function TransactionCard({
  icon,
  title,
  notes,
  category,
  amount,
  paymentSourceId,
  defaultBadge,
  selectMode,
  selected,
  onSelectChange,
  onClick,
  onDelete,
  swipeActions,
  toleranceOpen = 40,
  toleranceClose = 40,
}: {
  icon: string;
  title: string;
  notes: string;
  category: string;
  amount?: number;
  paymentSourceId?: string | null;
  defaultBadge?: boolean;
  selectMode?: boolean;
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  onClick?: () => void;
  onDelete?: () => void;
  swipeActions?: { label: string; onClick: () => void }[];
  toleranceOpen?: number;
  toleranceClose?: number;
}) {
  const [paymentSource, setPaymentSource] = useState<{
    icon: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (!paymentSourceId) {
      setPaymentSource(null);
      return;
    }
    fetch("/api/payment-source")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const ps = json.data.find(
            (s: { id: string }) => s.id === paymentSourceId,
          );
          if (ps) setPaymentSource({ icon: ps.icon, name: ps.name });
        }
      });
  }, [paymentSourceId]);
  const isLucideIcon = isValidIcon(icon);
  const [showActions, setShowActions] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    label: string;
    onClick: () => void;
  } | null>(null);

  const actions =
    swipeActions ?? (onDelete ? [{ label: "Delete", onClick: onDelete }] : []);
  const swipeWidth = actions.length * 80;
  const x = useMotionValue(0);

  const handleSwipeEnd = (
    _: any,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    if (showActions) {
      if (info.offset.x > toleranceClose || info.velocity.x > 500) {
        setShowActions(false);
        animate(x, 0, { type: "spring", stiffness: 500, damping: 40 });
      } else {
        animate(x, -swipeWidth, {
          type: "spring",
          stiffness: 500,
          damping: 40,
        });
      }
    } else {
      if (info.offset.x < -toleranceOpen || info.velocity.x < -500) {
        setShowActions(true);
        animate(x, -swipeWidth, {
          type: "spring",
          stiffness: 500,
          damping: 40,
        });
      } else {
        animate(x, 0, { type: "spring", stiffness: 500, damping: 40 });
      }
    }
  };

  const handleActionClick = (action: {
    label: string;
    onClick: () => void;
  }) => {
    setPendingAction(action);
  };

  return (
    <>
      <div className="w-full rounded-xl shadow-sm border bg-card overflow-hidden">
        <motion.div
          className="flex"
          drag={selectMode || actions.length === 0 ? false : "x"}
          dragConstraints={{ left: -swipeWidth, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleSwipeEnd}
          style={{ x }}
          onClick={() => {
            if (showActions) {
              animate(x, 0, { type: "spring", stiffness: 500, damping: 40 });
              setShowActions(false);
            }
          }}
        >
          <div className="w-full shrink-0">
            <div className="flex items-center p-4 gap-0">
              <motion.div
                initial={{ width: 0, opacity: 0, marginRight: 0 }}
                animate={{
                  width: selectMode ? 40 : 0,
                  opacity: selectMode ? 1 : 0,
                  marginRight: selectMode ? 12 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 35,
                }}
                className="overflow-hidden shrink-0"
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={onSelectChange}
                  />
                </div>
              </motion.div>
              <div
                className="flex gap-3 flex-1 min-w-0 items-center cursor-pointer active:scale-[0.98] transition-transform"
                onClick={onClick}
              >
                <div className="text-secondary aspect-square w-10 h-10 flex items-center justify-center bg-primary rounded-lg text-lg shrink-0">
                  {isLucideIcon ? (
                    <DynamicIcon name={icon} className="h-5 w-5" />
                  ) : (
                    <span>{icon}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1 w-full min-w-0">
                  <div className="flex justify-between w-full gap-2">
                    <div className="truncate font-medium flex gap-2 items-center capitalize">
                      {category || title}
                      {defaultBadge && (
                        <span className="text-muted-foreground text-sm flex items-center gap-1 shrink-0">
                          {/* <Star className="h-3 w-3" /> */}
                          Default
                        </span>
                      )}
                      {paymentSource && (
                        <span className="text-[10px] text-muted-foreground/50 mt-0.5 flex items-center gap-1">
                          {isValidIcon(paymentSource.icon) ? (
                            <DynamicIcon
                              name={paymentSource.icon}
                              className="h-3 w-3"
                            />
                          ) : (
                            <span>{paymentSource.icon}</span>
                          )}
                          {paymentSource.name}
                        </span>
                      )}
                    </div>
                    {amount !== undefined && (
                      <div
                        className={`shrink-0 font-semibold ${
                          amount < 0 ? "text-destructive" : "text-green-700"
                        }`}
                      >
                        {formatRupiah(amount)}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {title}
                    {notes && (
                      <span className="text-muted-foreground/60">
                        {" "}
                        &ndash; {notes}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(action);
              }}
              className={`w-20 shrink-0 text-white font-semibold text-sm flex items-center justify-center cursor-pointer border-l border-white/20 ${
                action.label === "Restore"
                  ? "bg-blue-600"
                  : action.label === "Default"
                    ? "bg-amber-600"
                    : "bg-destructive"
              }`}
            >
              {action.label}
            </button>
          ))}
        </motion.div>
      </div>
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.label === "Default"
                ? "Set as default payment source?"
                : `${pendingAction?.label} transaction?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.label === "Default"
                ? "This will set this payment source as your default for new transactions."
                : pendingAction?.label === "Delete Forever"
                  ? "This action cannot be undone. This transaction will be permanently deleted."
                  : pendingAction?.label === "Restore"
                    ? "This transaction will be moved back to your transactions."
                    : "This will move this transaction to the recycle bin. You can restore it later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                pendingAction?.onClick();
                setPendingAction(null);
              }}
            >
              {pendingAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
