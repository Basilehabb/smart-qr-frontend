"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data.token;
      const user = res.data.user;

      // Admin
      if (user.isAdmin) {
        localStorage.setItem("admin-token", token);
        router.push("/admin/dashboard");
        return;
      }

      // User
      localStorage.setItem("user-token", token);

      // ⬅ هل جاي يربط QR ؟
      const qrToLink = localStorage.getItem("qr-to-link");
      if (qrToLink) {
        await api.post(
          "/qr/link",
          { code: qrToLink },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        localStorage.removeItem("qr-to-link");
        router.push(`/qr/${qrToLink}`);
        return;
      }

      // ⬅ return-url (edit)
      const returnUrl = localStorage.getItem("return-url");
      if (returnUrl) {
        router.push(returnUrl);
        localStorage.removeItem("return-url");
        return;
      }


      // otherwise: fetch user QRs
      const qrRes = await api.get("/qr/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const codes = qrRes.data?.codes;
      if (codes?.length > 0) {
        router.push(`/qr/${codes[0]}`);
        return;
      }

      router.push("/");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <button onClick={login}>Login</button>
    </div>
  );
}
