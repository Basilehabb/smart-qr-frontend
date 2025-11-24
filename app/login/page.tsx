"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // نقرأ return URL لو موجود
  const returnUrl = searchParams.get("return");

  const login = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.token;
      const user = res.data.user;

      // فصل التوكن بين الأدمن واليوزر
      if (user.isAdmin) {
        localStorage.setItem("admin-token", token);
      } else {
        localStorage.setItem("user-token", token);
      }

      // لو أدمن → Dashboard الأدمن
      if (user.isAdmin) {
        router.push("/admin/dashboard");
        return;
      }

      // لو فيه return URL → ارجعله
      if (returnUrl) {
        router.push(returnUrl);
        return;
      }

      // لو مفيش → ارجع للـ QR الخاص بالمستخدم
      router.push(`/qr/${user.code}`);

    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <input 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="mb-3 p-2 border rounded"
      />

      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="mb-3 p-2 border rounded"
      />

      <button 
        onClick={login}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Login
      </button>
    </div>
  );
}
