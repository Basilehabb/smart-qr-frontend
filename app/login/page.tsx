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
      
      // Save token
      localStorage.setItem("adminToken", res.data.token);

      // redirect to dashboard
      router.push("/admin/dashboard");

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
