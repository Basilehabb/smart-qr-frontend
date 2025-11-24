"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const login = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
  
      const token = res.data.token;
      const user  = res.data.user;

      // نقرأ return URL لو موجود
      const returnUrl = searchParams.get("return");
  
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

      // لو فيه return URL → رجعه لنفس صفحة الـ Edit
      if (returnUrl) {
        router.push(returnUrl);
        return;
      }
  
      // لو مفيش return → رجّعه للـ QR بتاعه
      router.push(`/qr/${user.code}`);
        
    } catch (err) {
      alert("Invalid admin credentials");
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
