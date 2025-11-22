// app/user/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
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

        // Redirect admins to admin panel
        if (res.data.user.isAdmin) {
          router.push("/admin/dashboard");
          return;
        }

        setUser(res.data.user);
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
        <p className="text-xs text-gray-400">User ID: {user._id}</p>

        <div className="mt-6 flex justify-center">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => router.push("/user/edit")}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
