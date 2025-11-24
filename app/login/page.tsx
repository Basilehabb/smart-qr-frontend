"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const token = res.data.token;
      const user  = res.data.user;

      if (user.isAdmin) {
        localStorage.setItem("admin-token", token);
        router.push("/admin/dashboard");
        return;
      }

      localStorage.setItem("user-token", token);

      // ⬅ مهم: جلب كل الـ QR codes
      const qrRes = await api.get("/qr/my", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const codes = qrRes.data?.codes;

      if (!codes || codes.length === 0) {
        alert("لا يوجد QR مربوط بهذا الحساب");
        return;
      }

      const code = codes[0]; // أول QR

      // return-url (edit button)
      const returnUrl = localStorage.getItem("return-url");
      if (returnUrl) {
        localStorage.removeItem("return-url");
        router.push(returnUrl);
        return;
      }

      // فتح أول QR
      router.push(`/qr/${code}`);

    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <input 
        value={email} 
        onChange={e=>setEmail(e.target.value)} 
        placeholder="Email"
      />

      <input 
        type="password" 
        value={password} 
        onChange={e=>setPassword(e.target.value)} 
        placeholder="Password"
      />

      <button onClick={login}>Login</button>
    </div>
  );
}
