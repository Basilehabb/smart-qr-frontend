"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [creatingQR, setCreatingQR] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const me = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!me.data.user.isAdmin) {
          router.push("/user/dashboard");
          return;
        }

        setAdmin(me.data.user);

        const allUsers = await api.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(allUsers.data.users);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleCreateQR = async () => {
    try {
      setCreatingQR(true);
      const token = localStorage.getItem("token");
      const res = await api.post("/qr/create", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const qrCodeValue = res.data.qr.code;
      setQrCode(qrCodeValue);
    } catch (error) {
      console.error("Error creating QR:", error);
      alert("Failed to create QR");
    } finally {
      setCreatingQR(false);
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {admin.name} 👑</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Email: {admin.email}</p>
            <p>Role: Admin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Users</CardTitle>
              <Button onClick={handleCreateQR} disabled={creatingQR}>
                {creatingQR ? "Creating..." : "Create QR"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-200">
              {users.map((u) => (
                <li key={u._id} className="py-2 flex justify-between">
                  <span>
                    {u.name} — {u.email}
                  </span>
                  <Button size="sm">View</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {qrCode && (
          <Card className="mt-6 text-center">
            <CardHeader>
              <CardTitle>New QR Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-3">
                <QRCode value={`http://localhost:3000/qr/${qrCode}`} size={180} />
                <p className="text-gray-700 font-semibold">
                  Code: <span className="text-blue-600">{qrCode}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Scan or open: <br />
                  <a
                    href={`http://localhost:3000/qr/${qrCode}`}
                    target="_blank"
                    className="text-blue-500 underline"
                  >
                  http://localhost:3000/qr/${qrCode}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
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
    </div>
  );
}
