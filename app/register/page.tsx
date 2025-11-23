"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const search = useSearchParams();
  const linkCode = search?.get("code") || null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      setError(null);
      setLoading(true);

      // 1) register
      await api.post("/auth/register", { name, email, password });

      // 2) login
      const loginRes = await api.post("/auth/login", { email, password });
      const token = loginRes.data.token;
      localStorage.setItem("token", token);

      // 3) link QR if exists
      if (linkCode) {
        await api.post(
          `/qr/link/${linkCode}`,   // ← هنا التصحيح
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        router.push(`/qr/${linkCode}`);
        return;
      }

      // otherwise go to profile
      router.push("/user/dashboard");

    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-4">Create Account</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <input className="w-full mb-2 p-2 border rounded" placeholder="Full name"
          value={name} onChange={e => setName(e.target.value)} />

        <input className="w-full mb-2 p-2 border rounded" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} />

        <input type="password" className="w-full mb-4 p-2 border rounded"
          placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />

        <button
          className="w-full py-2 bg-blue-600 text-white rounded"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register & Link"}
        </button>
      </div>
    </div>
  );
}
