"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { DynamicIcon, isValidIcon } from "@/components/ui/icon-picker";

interface WalletItem {
  id: string;
  title: string;
  icon?: string | null;
}

export function WalletFilter({ wallets }: { wallets: WalletItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentWalletIds =
    searchParams?.get("walletIds")?.split(",").filter(Boolean) || [];

  const toggleWallet = (walletId: string) => {
    const params = new URLSearchParams(searchParams ?? "");
    const newIds = currentWalletIds.includes(walletId)
      ? currentWalletIds.filter((c) => c !== walletId)
      : [...currentWalletIds, walletId];

    if (newIds.length > 0) {
      params.set("walletIds", newIds.join(","));
    } else {
      params.delete("walletIds");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10 gap-1">
          {currentWalletIds.length > 0 ? (
            <>Wallets ({currentWalletIds.length})</>
          ) : (
            <>All Wallets</>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          {wallets.map((wallet) => (
            <label
              key={wallet.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm"
            >
              <Checkbox
                checked={currentWalletIds.includes(wallet.id)}
                onCheckedChange={() => toggleWallet(wallet.id)}
              />
              {wallet.icon && isValidIcon(wallet.icon) ? (
                <div className="w-4 h-4 flex items-center justify-center rounded text-xs bg-primary/10 text-primary">
                  <DynamicIcon name={wallet.icon} className="h-3 w-3" />
                </div>
              ) : null}
              {wallet.title}
            </label>
          ))}
          {wallets.length === 0 && (
            <p className="text-sm text-muted-foreground p-2">No wallets</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
