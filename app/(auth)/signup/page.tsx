"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

    if (!res.ok) {
      alert("User Registered");
    } else {
      signIn("credentials", {
        redirectTo: "/dashboard",
        email: form.email,
        password: form.password,
      });
    }
  };

  return (
    <div className=" w-full h-screen flex justify-center items-center">
      <Card className=" w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="Name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  required
                  onChange={handleOnChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  onChange={handleOnChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  onChange={handleOnChange}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className=" flex flex-col gap-2">
          <Button
            type="submit"
            onClick={handleSubmit}
            className=" w-full cursor-pointer"
          >
            Sign Up
          </Button>
          <div className="mt-4 text-center text-sm">
            Have an account?{" "}
            <Link href={"/login"} className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;
