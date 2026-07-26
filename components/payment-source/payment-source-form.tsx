"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import IconPicker from "@/components/ui/icon-picker";

export type PaymentSourceFormValues = {
  name: string;
  icon: string;
};

export default function PaymentSourceFormFields({
  values,
  onChange,
}: {
  values: PaymentSourceFormValues;
  onChange: (values: PaymentSourceFormValues) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="psName">Name</Label>
        <Input
          id="psName"
          placeholder="e.g. BCA Bank, Cash, GoPay"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label>Icon</Label>
        <IconPicker
          value={values.icon}
          onChange={(icon) => onChange({ ...values, icon })}
        />
      </div>
    </>
  );
}
