"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  Wallet,
  Car,
  ShoppingBag,
  Utensils,
  Home,
  Plane,
  Bus,
  TrainFront,
  Gamepad2,
  Laptop,
  BookOpen,
  Heart,
  Shirt,
  Gift,
  Smartphone,
  Music,
  Dumbbell,
  PawPrint,
  Leaf,
  Pill,
  Scissors,
  Key,
  Camera,
  Trophy,
  Coffee,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Wrench,
  Beer,
  Droplets,
  Sparkles,
  Gem,
  ShoppingCart,
  Bike,
  Stethoscope,
  Palette,
  Weight,
  Sailboat,
  Tent,
  Mountain,
  Zap,
  Sun,
  Moon,
  Cloud,
  TreePine,
  Flower2,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Wallet,
  Car,
  ShoppingBag,
  Utensils,
  Home,
  Plane,
  Bus,
  TrainFront,
  Gamepad2,
  Laptop,
  BookOpen,
  Heart,
  Shirt,
  Gift,
  Smartphone,
  Music,
  Dumbbell,
  PawPrint,
  Leaf,
  Pill,
  Scissors,
  Key,
  Camera,
  Trophy,
  Coffee,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Wrench,
  Beer,
  Droplets,
  Sparkles,
  Gem,
  ShoppingCart,
  Bike,
  Stethoscope,
  Palette,
  Weight,
  Sailboat,
  Tent,
  Mountain,
  Zap,
  Sun,
  Moon,
  Cloud,
  TreePine,
  Flower2,
};

const ICON_NAMES = Object.keys(iconMap);

export { ICON_NAMES, iconMap };

export function DynamicIcon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  if (!name) return null;
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export default function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iconName: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-14 p-0 flex items-center justify-center"
        >
          <DynamicIcon name={value} className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2" align="start">
        <div className="grid grid-cols-5 gap-1">
          {ICON_NAMES.map((name) => {
            const Icon = iconMap[name];
            return (
              <button
                key={name}
                type="button"
                className={cn(
                  "h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent transition-colors",
                  value === name && "bg-accent ring-1 ring-primary"
                )}
                title={name}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
