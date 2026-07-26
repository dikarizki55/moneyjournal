import { Wallet } from "lucide-react";
import { DynamicIcon, isValidIcon } from "@/components/ui/icon-picker";

export function WalletIconDisplay({ icon, title }: { icon?: string | null; title?: string }) {
  return (
    <div className="w-5 h-5 flex items-center justify-center rounded text-xs shrink-0 bg-primary/10 text-primary">
      {icon && isValidIcon(icon) ? (
        <DynamicIcon name={icon} className="h-3 w-3" />
      ) : (
        <span className="font-bold">{(title || "W").charAt(0)}</span>
      )}
    </div>
  );
}

export function PaymentSourceIconDisplay({ icon, name }: { icon?: string | null; name: string }) {
  return (
    <div className="w-5 h-5 flex items-center justify-center rounded text-xs shrink-0 bg-primary/10 text-primary">
      {icon && isValidIcon(icon) ? (
        <DynamicIcon name={icon} className="h-3 w-3" />
      ) : (
        <span className="font-bold">{name.charAt(0)}</span>
      )}
    </div>
  );
}

export interface CategoryObj {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

export interface PaymentSourceObj {
  id: string;
  name: string;
  icon?: string | null;
}

export interface WalletObj {
  id: string;
  title: string;
  icon?: string | null;
}

export function CategoryCell({ category }: { category?: CategoryObj | null }) {
  if (!category) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-5 h-5 flex items-center justify-center rounded text-xs shrink-0"
        style={{
          backgroundColor: category.color ? `${category.color}20` : "hsl(var(--primary) / 0.1)",
          color: category.color || "hsl(var(--primary))",
        }}
      >
        {category.icon && isValidIcon(category.icon) ? (
          <DynamicIcon name={category.icon} className="h-3 w-3" />
        ) : (
          <span className="font-bold">{category.name.charAt(0)}</span>
        )}
      </div>
      <span>{category.name}</span>
    </div>
  );
}

export function PaymentSourceCell({ paymentSource }: { paymentSource?: PaymentSourceObj | null }) {
  if (!paymentSource) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      {paymentSource.icon && isValidIcon(paymentSource.icon) ? (
        <div className="w-5 h-5 flex items-center justify-center rounded text-xs bg-primary/10 text-primary">
          <DynamicIcon name={paymentSource.icon} className="h-3 w-3" />
        </div>
      ) : null}
      <span className="text-xs font-medium">{paymentSource.name}</span>
    </div>
  );
}

export function WalletCell({ wallet }: { wallet?: WalletObj | null }) {
  if (!wallet) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
      <Wallet className="h-3 w-3" />
      {wallet.title}
    </span>
  );
}
