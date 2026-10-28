"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

const Page = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
      }),
    });

    if (res.ok) {
      alert("User Registered");
      await signIn("credentials", {
        redirectTo: "/dashboard-new",
        email: form.email,
        password: form.password,
      });
    } else {
      const data = await res.json();
      alert(data.message || "Failed to register");
    }
  };

  const inputStyle = {
    WebkitBoxShadow: "0 0 0 30px var(--new-muted-background) inset",
    WebkitTextFillColor: "var(--new-foreground)",
  } as React.CSSProperties;

  return (
    <div className="w-full h-screen flex justify-center items-center px-6 py-12">
      <div className="w-full max-w-sm bg-new-background shadow-soft rounded-[20px] border border-new-muted-background flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-new-foreground">Sign Up</h2>
          <p className="text-sm text-new-muted-foreground">
            Create your account to get started
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-new-foreground">
                Name
              </Label>
              <input
                id="name"
                type="text"
                placeholder="Your Name"
                required
                onChange={handleOnChange}
                style={inputStyle}
                className="flex h-9 w-full rounded-md border border-new-muted-background bg-new-background px-3 py-1 text-sm text-new-foreground placeholder:text-new-muted-foreground focus-visible:border-new-primary focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-new-foreground">
                Email
              </Label>
              <input
                id="email"
                type="email"
                placeholder="email@example.com"
                required
                onChange={handleOnChange}
                style={inputStyle}
                className="flex h-9 w-full rounded-md border border-new-muted-background bg-new-background px-3 py-1 text-sm text-new-foreground placeholder:text-new-muted-foreground focus-visible:border-new-primary focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-new-foreground">
                Password
              </Label>
              <input
                id="password"
                type="password"
                minLength={6}
                required
                onChange={handleOnChange}
                style={inputStyle}
                className="flex h-9 w-full rounded-md border border-new-muted-background bg-new-background px-3 py-1 text-sm text-new-foreground placeholder:text-new-muted-foreground focus-visible:border-new-primary focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
          </div>
        </form>
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full cursor-pointer bg-new-primary text-new-background rounded-full py-3"
          >
            Sign Up
          </Button>
          <div className="mt-4 text-center text-sm text-new-muted-foreground">
            Have an account?{" "}
            <Link
              href={"/login"}
              className="text-new-primary underline underline-offset-4"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
