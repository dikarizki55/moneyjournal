"use client";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

const categoryList = ["Makanan", "Transportasi", "Hiburan", "Gaji", "Lainnya"];

export default function ComboboxInput({
  id,
  onChange,
  list,
  defaultValue,
}: {
  id: string;
  onChange: (value: string) => void;
  list: string[];
  defaultValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue || "");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          id={id}
          className=" w-full rounded-2 border px-3 py-2"
          value={value}
          onChange={(e) => {
            setOpen(true);
            setValue(e.target.value);
            onChange(e.target.value);
          }}
          autoComplete="off"
          type="text"
        ></Input>
      </PopoverTrigger>
      <PopoverContent className=" w-full p-0">
        <Command>
          <CommandInput
            placeholder="category"
            value={value}
            onValueChange={(val) => {
              setValue(val);
              onChange(val);
            }}
          />
          <CommandList>
            <CommandEmpty>not found</CommandEmpty>
            {list.map((cat) => (
              <CommandItem
                key={cat}
                value={cat}
                onSelect={() => {
                  setValue(cat);
                  onChange(cat);
                  setOpen(false);
                }}
              >
                {cat}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ComboboxInputContainer() {
  return (
    <ComboboxInput
      id="category"
      onChange={(val) => console.log(val)}
      list={["Makanan", "Gaji", "Lainnya"]}
    ></ComboboxInput>
  );
}
