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
  
      // فصل التوكن بين الأدمن واليوزر
      if (user.isAdmin) {
        localStorage.setItem("admin-token", token);
      } else {
        localStorage.setItem("user-token", token);
      }
  
      // redirect to dashboard
      if (user.isAdmin) {
        router.push("/admin/dashboard");
      } else {
        router.push(`/qr/${user.code}`);
      }      
        
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
