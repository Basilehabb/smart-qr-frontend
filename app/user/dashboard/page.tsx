"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // لو المستخدم Admin نحوله للداشبورد بتاع الأدمن
        if (res.data.user.isAdmin) {
          router.push("/admin/dashboard");
          return;
        }

        setUser(res.data.user);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading)
    return <p className="text-center mt-20 text-gray-600">Loading...</p>;

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <Card className="max-w-md w-full text-center shadow-md border">
        <CardHeader>
          <CardTitle className="text-xl">Hello, {user.name} 👋</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-gray-600 mb-2">
            <b>Email:</b> {user.email}
          </p>
          <p className="text-gray-600 mb-4">
            <b>User ID:</b> {user._id}
          </p>

          <p className="text-sm text-gray-400">
            This is your profile data linked with your QR code.
          </p>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/login");
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
