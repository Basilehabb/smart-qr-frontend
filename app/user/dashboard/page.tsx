// app/user/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [myQr, setMyQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Admin → redirect
        if (res.data.user.isAdmin) {
          router.push("/admin/dashboard");
          return;
        }

        // Set user info
        setUser(res.data.user);

        // Get my QR
        const qrRes = await api.get("/qr/my", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMyQr(qrRes.data.code || null);

      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md text-center">

        <h2 className="text-2xl font-bold mb-2">Hello, {user.name}</h2>
        <p className="text-sm text-gray-600 mb-4">{user.email}</p>

        {myQr && (
          <button
            className="mt-3 w-full py-2 bg-green-600 text-white rounded"
            onClick={() => router.push(`/qr/${myQr}`)}
          >
            Open My QR
          </button>
        )}

        <button
          className="w-full mt-3 py-2 bg-blue-600 text-white rounded"
          onClick={() => router.push(`/user/edit?code=${myQr}`)}
        >
          Edit Profile
          </button>

      </div>
    </div>
  );
}
