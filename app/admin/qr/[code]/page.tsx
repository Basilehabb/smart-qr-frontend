"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import AdminSidebar from "../../AdminSidebar";

export default function AdminQRDetails({ params }: any) {
  const { code } = params;
  const router = useRouter();

  const [qr, setQr] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);

  // ==========================
  // Load QR + Scan Logs
  // ==========================
  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) return router.push("/login");

    (async () => {
      try {
        // 1) load QR list
        const res = await api.get(`/admin/qrs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const found = res.data.find((q: any) => q.code === code);
        setQr(found);

        // 2) load scan logs
        const logsRes = await api.get("/admin/scan-analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLogs(logsRes.data.filter((l: any) => l.code === code));
      } catch (err) {
        console.error(err);
        router.push("/admin/qrs");
      } finally {
        setLoading(false);
      }
    })();
  }, [code, router]);

  // ==========================
  // Write NFC (QR URL)
  // ==========================
  const writeNFC = async () => {
    try {
      if (!("NDEFWriter" in window)) {
        alert("NFC غير مدعوم على الجهاز ده (Android Chrome فقط).");
        return;
      }

      setWriting(true);

      const publicUrl = `https://smart-qr-frontend.vercel.app/qr/${qr.code}`;

      const writer = new (window as any).NDEFWriter();
      await writer.write({
        records: [
          {
            recordType: "url",
            data: publicUrl,
          },
        ],
      });

      alert("✅ تم كتابة اللينك على NFC بنجاح");
    } catch (err) {
      console.error("NFC write error:", err);
      alert("❌ فشل كتابة NFC");
    } finally {
      setWriting(false);
    }
  };

  // ==========================
  // Delete QR
  // ==========================
  const deleteQR = async () => {
    if (!confirm("Delete this QR?")) return;

    const token = localStorage.getItem("admin-token");

    await api.delete(`/admin/qrs/${code}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    router.push("/admin/qrs");
  };

  // ==========================
  // Unlink QR
  // ==========================
  const unlinkQR = async () => {
    if (!confirm("Unlink this QR from user?")) return;

    const token = localStorage.getItem("admin-token");

    await api.patch(
      `/admin/qrs/${code}/unlink`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setQr((prev: any) => ({ ...prev, userId: null }));
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  if (!qr)
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold">QR Not Found</h2>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">

          <h1 className="text-2xl font-bold">QR: {qr.code}</h1>

          <div className="bg-white p-5 rounded shadow space-y-4">
            <h2 className="text-lg font-semibold">QR Information</h2>

            <p>
              <strong>Code:</strong> {qr.code}
            </p>

            <p>
              <strong>Public URL:</strong>{" "}
              <a
                href={`/qr/${qr.code}`}
                target="_blank"
                className="text-blue-600 underline"
              >
                /qr/{qr.code}
              </a>
            </p>

            <p>
              <strong>Linked User:</strong>{" "}
              {qr.userId ? (
                <span className="text-green-600 font-medium">
                  {qr.userId.name} ({qr.userId.email})
                </span>
              ) : (
                <span className="text-gray-500">Not Linked</span>
              )}
            </p>

            <div className="flex gap-2 pt-4 flex-wrap">
              <a
                href={`/qr/${qr.code}`}
                target="_blank"
                className="px-4 py-2 bg-blue-600 rounded text-white"
              >
                Open Public View
              </a>

              <button
                onClick={writeNFC}
                disabled={writing}
                className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-60"
              >
                {writing ? "Writing NFC..." : "Write NFC"}
              </button>

              {qr.userId && (
                <button
                  onClick={unlinkQR}
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                >
                  Unlink
                </button>
              )}

              <button
                onClick={deleteQR}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Scan Logs */}
          <div className="bg-white p-5 rounded shadow">
            <h2 className="text-lg font-semibold mb-3">Scan History</h2>

            {logs.length === 0 && (
              <p className="text-gray-500">No scans yet.</p>
            )}

            <ul className="space-y-2">
              {logs.map((log, i) => (
                <li key={i} className="border-b pb-2">
                  <p>
                    <strong>At:</strong>{" "}
                    {new Date(log.scannedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>User Agent:</strong> {log.userAgent}
                  </p>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
