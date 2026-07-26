"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import IconPicker from "@/components/ui/icon-picker";

export const COLOR_OPTIONS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#78716c",
];

export type CategoryFormValues = {
  name: string;
  icon: string;
  color: string;
};

export default function CategoryFormFields({
  values,
  onChange,
}: {
  values: CategoryFormValues;
  onChange: (values: CategoryFormValues) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input
          placeholder="e.g. Food & Drinks"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Icon</Label>
        <IconPicker
          value={values.icon}
          onChange={(icon) => onChange({ ...values, icon })}
        />
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ ...values, color })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                values.color === color
                  ? "border-foreground scale-110"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          {values.color && !COLOR_OPTIONS.includes(values.color) && (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full border-2 border-foreground"
                style={{ backgroundColor: values.color }}
              />
              <Input
                className="w-24 h-8 text-xs"
                value={values.color}
                onChange={(e) => onChange({ ...values, color: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
