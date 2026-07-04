"use client";

import { Input } from "@/components/ui/input";
import { NumericFormat } from "react-number-format";

type RupiahInputProps = {
  className?: string;
  id?: string;
  defaultValue?: number;
  value?: number | null;
  onChange?: (value: number | null) => void;
  max?: number;
};

export function formatRupiah(value: string | number) {
  if (value === null || value === undefined) return "";

  let number: number;
  if (typeof value === "string") {
    const isNegative = value.startsWith("-");
    const cleaned = value.replace(/[^\d]/g, "");
    number = (isNegative ? -1 : 1) * (cleaned ? Number(cleaned) : 0);
  } else {
    number = value;
  }

  if (isNaN(number)) return "";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

export default function RupiahInput({
  className,
  id = "rupiah",
  defaultValue,
  value,
  onChange,
  max,
}: RupiahInputProps) {
  return (
    <div className="space-y-1">
      <NumericFormat
        id={id}
        name={id}
        className={className}
        customInput={Input}
        decimalSeparator=","
        thousandSeparator="."
        prefix="Rp "
        value={value ?? defaultValue}
        onValueChange={(values) => {
          const { floatValue } = values;
          onChange?.(floatValue ?? null);
        }}
        onFocus={(e) => e.target.select()}
        placeholder="Rp 0"
        autoComplete="off"
        isAllowed={(values) => {
          const { floatValue } = values;
          if (max === undefined || max === null) return true;
          return floatValue === undefined || floatValue <= max;
        }}
      />
      {max !== undefined && max !== null && (
        <p className="text-xs text-muted-foreground">
          Max: {formatRupiah(max)}
        </p>
      )}
    </div>
  );
}
