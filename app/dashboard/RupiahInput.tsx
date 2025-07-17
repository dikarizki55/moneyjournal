"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";

type RupiahInputProps = {
  id?: string;
  defaultValue?: number;
  onChange?: (value: number | null) => void;
};

export function formatRupiah(value: string) {
  const numeric = value.replace(/[^\d]/g, "");
  const number = Number(numeric);

  if (isNaN(number)) return "";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
}

export default function RupiahInput({
  id = "rupiah",
  defaultValue,
  onChange,
}: RupiahInputProps) {
  const [displayValue, setDisplayValue] = useState(() =>
    defaultValue ? formatRupiah(defaultValue.toString()) : ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    const number = raw === "" ? null : Number(raw);
    setDisplayValue(formatRupiah(e.target.value));
    onChange?.(number);
  };

  return (
    <div>
      <Input
        id={id}
        name={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        onChange={handleChange}
        value={displayValue}
        placeholder="Rp 0"
      ></Input>
    </div>
  );
}
