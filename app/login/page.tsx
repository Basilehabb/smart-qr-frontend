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
        localStorage.setItem("admin-token", token);  // <— مهم جداً
        router.push("/admin/dashboard");
        return;
      }
      
      localStorage.setItem("user-token", token);

      // نجيب QR الحقيقي من السيرفر
      const qrRes = await api.get("/qr/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const code = qrRes.data?.code;
      
      // لو فيه return-url → رجّعه ليها
      const returnUrl = localStorage.getItem("return-url");
      if (returnUrl) {
        localStorage.removeItem("return-url");
        router.push(returnUrl);
        return;
      }
      
      // لو مفيش return → افتح QR الحقيقي
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
