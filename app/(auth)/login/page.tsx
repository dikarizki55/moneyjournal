"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
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
      setError(res.error);
    } else {
      router.push("/dashboard-new");
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
      setError(res.error);
      setIsLoading(false);
    } else {
      router.push("/dashboard-new");
    }
  };

  const inputStyle = {
    WebkitBoxShadow: "0 0 0 30px var(--new-muted-background) inset",
    WebkitTextFillColor: "var(--new-foreground)",
  } as React.CSSProperties;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className=" text-5xl font-bold text-new-foreground">Loading...</h1>
      </div>
    );

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-sm bg-new-background shadow-soft rounded-[20px] border border-new-muted-background flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-new-foreground">Sign In</h2>
          <p className="text-sm text-new-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
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
                required
                onChange={handleOnChange}
                style={inputStyle}
                className="flex h-9 w-full rounded-md border border-new-muted-background bg-new-background px-3 py-1 text-sm text-new-foreground placeholder:text-new-muted-foreground focus-visible:border-new-primary focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow]"
              />
            </div>
            <button type="submit" className="hidden"></button>
          </div>
        </form>
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            onClick={handleSubmit}
            className="w-full cursor-pointer bg-new-primary text-new-background rounded-full py-3"
          >
            Sign In
          </Button>
          <Button
            onClick={() => signIn("google", { redirectTo: "/dashboard-new" })}
            variant="outline"
            className="w-full cursor-pointer border-new-muted-background text-new-foreground rounded-full py-3"
          >
            Login with Google
          </Button>
          {error && <p className="text-xs text-new-accent-red">{error}</p>}
          <div className="mt-4 text-center text-sm text-new-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={"/signup"}
              className="text-new-primary underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <Button
        className="mt-8 py-4 px-8 text-xl cursor-pointer bg-new-background text-new-foreground border border-new-muted-background rounded-full hover:bg-new-muted-background"
        onClick={loginDemo}
      >
        use Demo Account
      </Button>
    </div>
  );
};

export default Login;
