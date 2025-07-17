"use client";

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
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

const page = () => {
  return (
    <div>
      <DrawerDialog />
    </div>
  );
};

export default page;

export function DrawerDialog() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    console.log(open);
  }, [open]);

  const customButton = (
    <Button variant={"outline"} className=" mt-6">
      Create
    </Button>
  );

  const title = "Create Transaction";
  const description = "Make new transaction data";

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
          <ProfileForm className="px-4" setOpen={setOpen} />
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
        <ProfileForm className="px-4" setOpen={setOpen} />
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
  setOpen,
}: React.ComponentProps<"form"> & {
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [form, setForm] = React.useState({
    title: "",
    type: "",
    category: "",
    amount: 0,
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    await fetch("/api/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    });
  };

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
        <Label htmlFor="title">Type</Label>
        <Input
          type="text"
          id="type"
          onChange={handleOnChange}
          value={form?.type}
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="title">Category</Label>
        <Input
          type="text"
          id="category"
          onChange={handleOnChange}
          value={form?.category}
        />
      </div>
      <div className="grid gap-3">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          onChange={handleOnChange}
          value={form?.amount}
        />
      </div>
      <div>{JSON.stringify(form)}</div>
      <Button type="submit" onClick={handleSubmit}>
        Save changes
      </Button>
    </form>
  );
}
