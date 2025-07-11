"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(error);
    } else {
      router.push("/dashboard");
    }
  };
  return (
    <div className=" max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
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
    </div>
  );
};

export default Login;
