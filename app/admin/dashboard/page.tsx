"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import QRCode from "react-qr-code";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [creatingQR, setCreatingQR] = useState(false);

  // =======================
  // Load Admin + Users List
  // =======================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const me = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!me.data.user.isAdmin) {
          router.push("/user/dashboard");
          return;
        }

        setAdmin(me.data.user);

        const usersRes = await api.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(usersRes.data.users || []);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // =======================
  // CREATE NEW QR
  // =======================
  const handleCreateQR = async () => {
    try {
      setCreatingQR(true);
      const token = localStorage.getItem("token");

      const res = await api.post(
        "/qr/create",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const code = res.data.qr?.code;
      if (code) setQrCode(code);

    } catch (err) {
      console.error(err);
      alert("Failed to create QR");
    } finally {
      setCreatingQR(false);
    }
  };

  if (loading)
    return <p className="text-center mt-20">Loading...</p>;

  if (!admin) return null;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ==========================
            ADMIN INFO CARD
        =========================== */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Welcome, {admin.name} 👑</h2>
          <p className="text-gray-600 text-sm">{admin.email}</p>
        </div>

        {/* ==========================
            USERS HEADER + CREATE QR
        =========================== */}
        <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <h3 className="text-lg font-medium">All Users</h3>

          <button
            onClick={handleCreateQR}
            disabled={creatingQR}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {creatingQR ? "Creating..." : "Create QR"}
          </button>
        </div>

        {/* ==========================
            USERS LIST
        =========================== */}
        <div className="bg-white p-4 rounded-lg shadow">
          <ul>
            {users.map((u) => (
              <li
                key={u._id}
                className="py-3 flex justify-between items-center border-b last:border-none"
              >
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>

                <button className="px-3 py-1 border rounded hover:bg-gray-100">
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ==========================
            SHOW NEW QR + LINK
        =========================== */}
        {qrCode && (
  <div className="bg-white p-6 rounded-lg shadow text-center">
    <h4 className="text-lg font-semibold mb-3">New QR</h4>

    <QRCode
      value={`${process.env.NEXT_PUBLIC_APP_URL}/qr/${qrCode}`}
      size={160}
    />

    <p className="mt-3 font-semibold text-gray-800">{qrCode}</p>

    <p className="text-sm text-gray-600 mt-3">Scan or open:</p>

    <a
      href={`${process.env.NEXT_PUBLIC_APP_URL}/qr/${qrCode}`}
      target="_blank"
      className="text-blue-600 underline break-all text-sm"
    >
      {`${process.env.NEXT_PUBLIC_APP_URL}/qr/${qrCode}`}
    </a>
  </div>
)}

        {/* ==========================
            LOGOUT
        =========================== */}
        <div className="text-center mt-4">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
