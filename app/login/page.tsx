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

      const returnUrl = localStorage.getItem("return-url");
  
      if (user.isAdmin) {
        localStorage.setItem("admin-token", token);
      } else {
        localStorage.setItem("user-token", token);
      }

      // لو فيه return URL → رجّعه لنفس الصفحة
      if (!user.isAdmin && returnUrl) {
        localStorage.removeItem("return-url");
        router.push(returnUrl);
        return;
      }
  
      // لو أدمن → Dashboard الأدمن
      if (user.isAdmin) {
        router.push("/admin/dashboard");
        return;
      }

      // لو مفيش return → QR
      router.push(`/qr/${user.code}`);
        
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
