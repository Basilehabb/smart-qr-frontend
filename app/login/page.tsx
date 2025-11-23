"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();

  const returnTo = params.get("return");  // مثل: /user/edit
  const code = params.get("code");        // QR code لو موجود

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });

      // Save token
      localStorage.setItem("token", res.data.token);

      // لو جا من QR علشان يعمل Edit → بس هدخله
      if (returnTo) {
        router.push(returnTo);
        return;
      }

      // لو جا عشان يربط QR
      if (code) {
        await api.post(
          "/qr/link",
          { code },
          { headers: { Authorization: `Bearer ${res.data.token}` } }
        );
      
        router.push(`/qr/${code}`);
        return;
      }
      

      // Default redirect
      if (res.data.user.isAdmin) router.push("/admin/dashboard");
      else router.push("/user/dashboard");

    } catch (err: any) {
      setError("Incorrect email or password");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 shadow rounded w-80">
        <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded w-full mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-600 text-center mb-2">{error}</p>}

        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Login
        </button>

        <p className="text-center text-sm mt-3">
          Don’t have an account?{" "}
          <a href={`/register?code=${code || ""}`} className="text-blue-600 underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
