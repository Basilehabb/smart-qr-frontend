"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code"); // ← مهم جدًا

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setError(null);
      setLoading(true);

      // 1) Register
      await api.post("/auth/register", { name, email, password });

      // 2) Login
      const loginRes = await api.post("/auth/login", { email, password });
      const token = loginRes.data.token;

      localStorage.setItem("token", token);

      // 3) Link QR if provided
      if (code) {
        await api.post(
          `/qr/link/${code}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 4) Redirect back to QR page
        router.push(`/qr/${code}`);
        return;
      }

      // Default redirect
      router.push("/user/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg p-8 rounded-2xl w-80">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Account</h1>

        <input className="border p-2 mb-2 w-full rounded" placeholder="Full Name" onChange={(e) => setName(e.target.value)} />

        <input className="border p-2 mb-2 w-full rounded" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

        <input className="border p-2 mb-3 w-full rounded" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <button
          onClick={handleRegister}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Registering..." : "Register & Link"}
        </button>
      </div>
    </div>
  );
}
