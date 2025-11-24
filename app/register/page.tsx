"use client";

export const dynamic = "force-dynamic";
export const revalidate = false;
export const fetchCache = "force-no-store";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code"); // ← لو جاي من QR

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setError(null);
      setLoading(true);

      // 1) Register user
      await api.post("/auth/register", { name, email, password });

      // 2) Login immediately
      const loginRes = await api.post("/auth/login", { email, password });
      const token = loginRes.data.token;
      localStorage.setItem("token", token);

      // 3) If QR exists → link it
      if (code) {
        await api.post(
          `/qr/link/${code}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        router.push(`/qr/${code}`);
        return;
      }

      // Normal redirect
      router.push("/user/dashboard");

    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg p-8 rounded-2xl w-80">
        <h1 className="text-2xl font-bold mb-4 text-center">Create Account</h1>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 mb-2 rounded w-full"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 mb-2 rounded w-full"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-3 py-2 mb-3 rounded w-full"
        />

        {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-3">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
