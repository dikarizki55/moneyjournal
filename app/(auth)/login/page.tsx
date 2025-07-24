"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Login = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      setIsLoading(false);
      setError(error);
    } else {
      router.push("/dashboard");
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email: "demo@demo.com",
      password: "123456",
    });

    if (res?.error) {
      setError(error);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className=" text-5xl font-bold">Loading...</h1>
      </div>
    );

  return (
    <div className=" w-full h-screen flex justify-center items-center flex-col gap-5">
      <Card className=" w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
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
              <button type="submit" className="hidden"></button>
            </div>
          </form>
        </CardContent>
        <CardFooter className=" flex flex-col gap-2">
          <Button
            type="submit"
            onClick={handleSubmit}
            className=" w-full cursor-pointer"
          >
            Sign In
          </Button>
          <Button
            onClick={() => signIn("google", { redirectTo: "/dashboard" })}
            variant={"outline"}
            className=" w-full cursor-pointer"
          >
            Login with Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href={"/signup"} className="underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
      <Button
        className=" mt-5 py-7 px-10 text-2xl cursor-pointer"
        onClick={loginDemo}
      >
        use Demo Account
      </Button>
    </div>
  );
};

export default Login;
