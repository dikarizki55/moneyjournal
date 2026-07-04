"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function HideTransferToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checked = searchParams.get("hideTransferToSavings") !== "false";

  const handleToggle = (value: boolean) => {
    const params = new URLSearchParams(searchParams ?? "");
    if (value) {
      params.delete("hideTransferToSavings");
    } else {
      params.set("hideTransferToSavings", "false");
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="hide-transfer"
        checked={checked}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="hide-transfer" className="text-sm whitespace-nowrap cursor-pointer">
        Hide wallet transfers
      </Label>
    </div>
  );
}
