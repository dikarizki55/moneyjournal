"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RupiahInput from "../RupiahInput";
import ComboboxInput from "./comboboxinput";

type DrawerDialogProps = {
  customButton: React.ReactNode;
  title: string;
  description: string;
  initialData?: FormInput;
  onSubmit: (values: any) => Promise<void>;
  updateData?: () => void;
};

type FormInput = {
  title: string;
  type: "income" | "outcome";
  category: string;
  amount: number | null;
  notes: string;
};

export function DrawerDialog({
  customButton,
  title,
  description,
  initialData,
  onSubmit,
  updateData,
}: DrawerDialogProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {/* <Button variant="outline">Create Transaction</Button> */}
          {customButton}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ProfileForm
            setOpen={setOpen}
            className="px-4"
            initialData={initialData}
            onSubmit={onSubmit}
            updateData={updateData}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} repositionInputs={false}>
      <DrawerTrigger asChild>
        {/* <Button variant="outline">Create Transaction</Button> */}
        {customButton}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <ProfileForm
          setOpen={setOpen}
          className="px-4"
          initialData={initialData}
          onSubmit={onSubmit}
          updateData={updateData}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({
  className,
  onSubmit,
  setOpen,
  updateData,
  initialData,
}: React.ComponentProps<"form"> & {
  onSubmit: (values: any) => Promise<void>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  updateData?: () => void;
  initialData: FormInput | undefined;
}) {
  const [form, setForm] = React.useState<FormInput>({
    title: initialData?.title || "",
    type: initialData?.type || "income",
    category: initialData?.category || "",
    notes: initialData?.notes || "",
    amount: initialData?.amount || null,
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setOpen(false);
    if (updateData) updateData();
    window.location.reload();
  };

  const [categoryList, setCategoryList] = React.useState([]);

  useEffect(() => {
    const getCategoryList = async () => {
      const data = await fetch("/api/transaction/distinct/category", {
        credentials: "include",
      }).then((res) => res.json());
      setCategoryList(data.data);
    };

    getCategoryList();
  }, []);

  return (
    <form
      className={cn("grid items-start gap-6", className)}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3">
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          onChange={handleOnChange}
          value={form?.title}
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="type">Type</Label>
        <Tabs
          value={form?.type}
          onValueChange={(value) =>
            setForm({
              ...form,
              type: value as FormInput["type"],
            })
          }
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="outcome">Outcome</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="grid gap-3">
        <Label htmlFor="category">Category</Label>
        <ComboboxInput
          id="category"
          defaultValue={form.category ?? undefined}
          onChange={(value) =>
            setForm({
              ...form,
              category: value,
            })
          }
          list={categoryList}
        ></ComboboxInput>
      </div>
      <div className="grid gap-3">
        <Label htmlFor="notes">Notes</Label>
        <Input
          type="text"
          id="notes"
          onChange={handleOnChange}
          value={form?.notes}
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="amount">Amount</Label>
        <RupiahInput
          id="amount"
          defaultValue={form.amount ?? undefined}
          onChange={(value) =>
            setForm({
              ...form,
              amount: value,
            })
          }
        ></RupiahInput>
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  );
}
