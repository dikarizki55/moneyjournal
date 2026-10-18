"use client";

import {
  IconBag,
  IconBankNote,
  IconCalendar,
  IconCar,
  IconCreditCard,
  IconForkKnive,
  IconWallet,
} from "@/components/dashboard-new/Icon";

export type NewIconComponent = React.ComponentType<{ className?: string }>;

/**
 * Maps lucide icon slugs (as stored in `category.icon` / `paymentSource.icon`)
 * to the dashboard-new custom SVG components.
 *
 * NOTE: this list is intentionally small. Missing slugs fall back to
 * `DEFAULT_ICON` so the UI never breaks — extend it as new icons are added.
 */
export const iconMap: Record<string, NewIconComponent> = {
  // Food & Drink
  utensils: IconForkKnive,
  "utensils-crossed": IconForkKnive,
  coffee: IconForkKnive,
  "cup-soda": IconForkKnive,
  beer: IconForkKnive,
  wine: IconForkKnive,
  "glass-water": IconForkKnive,
  "cooking-pot": IconForkKnive,
  "chef-hat": IconForkKnive,
  sandwich: IconForkKnive,
  pizza: IconForkKnive,
  burger: IconForkKnive,
  hamburger: IconForkKnive,
  soup: IconForkKnive,
  salad: IconForkKnive,
  popcorn: IconForkKnive,

  // Transport & Travel
  car: IconCar,
  "car-front": IconCar,
  "car-taxi-front": IconCar,
  bus: IconCar,
  truck: IconCar,
  fuel: IconCar,
  taxi: IconCar,
  plane: IconCar,
  train: IconCar,
  "train-front": IconCar,
  ship: IconCar,
  sailboat: IconCar,
  rocket: IconCar,

  // Commerce & Money
  banknote: IconBankNote,
  coins: IconBankNote,
  cash: IconBankNote,
  "circle-dollar-sign": IconBankNote,
  "dollar-sign": IconBankNote,
  "badge-dollar-sign": IconBankNote,
  "hand-coins": IconBankNote,
  wallet: IconWallet,
  "wallet-cards": IconWallet,
  piggy: IconBankNote,
  "piggy-bank": IconBankNote,
  landmark: IconBankNote,
  receipt: IconBankNote,
  vault: IconBankNote,
  percent: IconBankNote,

  // Shopping
  bag: IconBag,
  "shopping-bag": IconBag,
  "shopping-basket": IconBag,
  "shopping-cart": IconBag,
  gift: IconBag,
  store: IconBag,
  package: IconBag,
  box: IconBag,
  tag: IconBag,
  tags: IconBag,
  barcode: IconBag,
  archive: IconBag,

  // Bills & Cards
  "credit-card": IconCreditCard,
  file: IconCreditCard,
  files: IconCreditCard,
  folder: IconCreditCard,
  printer: IconCreditCard,
  scan: IconCreditCard,

  // Bills, schedules & other
  calendar: IconCalendar,
  "calendar-days": IconCalendar,
  "calendar-range": IconCalendar,
  clock: IconCalendar,
  timer: IconCalendar,
  hourglass: IconCalendar,
  alarm: IconCalendar,
  home: IconWallet,
  building: IconWallet,
  house: IconWallet,
  sofa: IconWallet,
  bed: IconWallet,
};

export const DEFAULT_ICON: NewIconComponent = IconBankNote;

export function resolveIcon(slug?: string | null): NewIconComponent {
  if (!slug) return DEFAULT_ICON;
  return iconMap[slug.toLowerCase()] ?? DEFAULT_ICON;
}

/**
 * Maps a stored category color (hex) to the dashboard-new accent palette so the
 * icon bubble matches the original mockup styling.
 */
export function colorToClasses(color?: string | null): string {
  if (!color) {
    return "bg-new-accent-blue-background text-new-accent-blue";
  }

  const hex = color.trim().toLowerCase();

  if (!hex.startsWith("#")) return "bg-new-accent-blue-background text-new-accent-blue";

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if ([r, g, b].some(Number.isNaN)) {
    return "bg-new-accent-blue-background text-new-accent-blue";
  }

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;

  // Very low saturation -> neutral, use muted background
  if (saturation < 0.18) {
    return "bg-new-muted-background text-new-muted-foreground";
  }

  // Compare hue against the four brand accents
  let hue = 0;
  const d = max - min;
  if (max === r) hue = ((g - b) / d) % 6;
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  if (hue >= 70 && hue <= 170) {
    return "bg-new-primary-background text-new-primary";
  }
  if (hue >= 171 && hue <= 260) {
    return "bg-new-accent-blue-background text-new-accent-blue";
  }
  if (hue > 260 && hue <= 345) {
    return "bg-new-accent-red-background text-new-accent-red";
  }
  // orange / yellow
  return "bg-new-accent-orange-background text-new-accent-orange";
}
