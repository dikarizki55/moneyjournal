"use client";

import { Input } from "@/components/ui/input";
import { NumericFormat } from "react-number-format";

type RupiahInputProps = {
  className?: string;
  id?: string;
  defaultValue?: number;
  value?: number | null;
  onChange?: (value: number | null) => void;
};

export function formatRupiah(value: string | number) {
  const number =
    typeof value === "string" ? Number(value.replace(/[^\d]/g, "")) : value;

  if (isNaN(number) || number === null) return "";

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
}: RupiahInputProps) {
  return (
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
    />
  );
}
