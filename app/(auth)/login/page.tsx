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

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      setError(error);
    } else {
      router.push("/dashboard");
    }
  };
  return (
    <div className=" w-full h-screen flex justify-center items-center">
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
            type="submit"
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
      {/* <div className=" max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className=" text-2xl font-bold mb-4">Sign In</h2>
        {error && <p className=" text-red-500 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className=" space-y-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              required
              className=" w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              required
              className=" w-full border p-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className=" w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>

        <div className=" mt-6 text-center">
          <p className=" mb-2">Or Sign in With:</p>
          <button
            onClick={() => signIn("google", { redirectTo: "/dashboard" })}
            className=" w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          >
            Sign in With Google
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default Login;
