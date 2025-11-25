"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminQRsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [qrs, setQrs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [admin, setAdmin] = useState<any | null>(null);

  // ==========================
  // Load Admin + All QR codes
  // ==========================
  useEffect(() => {
    const token = localStorage.getItem("admin-token");

    if (!token) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const me = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!me.data.user.isAdmin) {
          router.push("/login");
          return;
        }

        setAdmin(me.data.user);

        const res = await api.get("/admin/qrs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setQrs(res.data);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // ==========================
  // Delete QR
  // ==========================
  const deleteQR = async (code: string) => {
    if (!confirm("Delete this QR?")) return;

    const token = localStorage.getItem("admin-token");

    await api.delete(`/admin/qrs/${code}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setQrs(prev => prev.filter(q => q.code !== code));
  };

  // ==========================
  // Unlink QR
  // ==========================
  const unlinkQR = async (code: string) => {
    if (!confirm("Unlink this QR from user?")) return;

    const token = localStorage.getItem("admin-token");

    await api.patch(`/admin/qrs/${code}/unlink`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setQrs(prev =>
      prev.map(q =>
        q.code === code ? { ...q, userId: null } : q
      )
    );
  };

  // ==========================
  // Render
  // ==========================
  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold">All QR Codes</h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search code or user..."
          className="px-4 py-2 border rounded w-full mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Table */}
        <div className="bg-white rounded-lg shadow p-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">QR Code</th>
                <th className="py-2 text-left">Linked User</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {qrs
                .filter(q =>
                  q.code.toLowerCase().includes(search.toLowerCase()) ||
                  (q.userId?.name || "").toLowerCase().includes(search.toLowerCase())
                )
                .map((qr) => (
                  <tr key={qr.code} className="border-b">
                    <td className="py-2">{qr.code}</td>

                    <td className="py-2">
                      {qr.userId ? (
                        <>
                          <span className="font-medium">{qr.userId.name}</span>
                          <br />
                          <span className="text-gray-500 text-sm">{qr.userId.email}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">Not Linked</span>
                      )}
                    </td>

                    <td className="py-2 text-right space-x-2">
                      {/* Open QR */}
                      <a
                        href={`/qr/${qr.code}`}
                        target="_blank"
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Open
                      </a>

                      {/* Unlink */}
                      {qr.userId && (
                        <button
                          onClick={() => unlinkQR(qr.code)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded"
                        >
                          Unlink
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => deleteQR(qr.code)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
