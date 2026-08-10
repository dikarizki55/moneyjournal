"use client";

import { IconChevronDown } from "./Icon";

export default function DropdownMenu({
  title,
  action,
}: {
  title: string;
  action: () => void;
}) {
  return (
    <button
      onClick={() => action()}
      className="text-xs bg-new-muted-background rounded-full py-2 px-4 flex items-center gap-2"
    >
      {title} <IconChevronDown className=" w-2 h-2" />
    </button>
  );
}
