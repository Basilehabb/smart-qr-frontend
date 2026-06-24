"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import AdminSidebar from "../AdminSidebar";
import QRCode from "qrcode";

export default function AdminQRsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [qrs, setQrs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [admin, setAdmin] = useState<any | null>(null);

  // For Create QR Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCount, setBulkCount] = useState("10");
  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);

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
          headers: { Authorization: `Bearer ${token}` }
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
  // Create QR
  // ==========================
  const createQR = async () => {
    const token = localStorage.getItem("admin-token");

    try {
      const res = await api.post(
        "/admin/qrs",
        { code: newCode }, // لو فاضية → backend يعمل auto-generate
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQrs(prev => [...prev, res.data.qr]); // add to list
      setNewCode("");
      setShowCreateModal(false);

      alert("QR Created Successfully!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create QR");
    }
  };

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const svgToJpgBlob = async (svgMarkup: string, width: number, height: number) => {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context unavailable");
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      const jpgBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Failed to create JPG"));
        }, "image/jpeg", 1);
      });

      return jpgBlob;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const downloadBulkQrsAssets = async (codes: string[]) => {
    const pageWidth = 1240;
    const pageHeight = 1754;
    const margin = 70;
    const columns = 3;
    const rows = 4;
    const gap = 36;
    const pageSize = columns * rows;
    const cellWidth = (pageWidth - margin * 2 - gap * (columns - 1)) / columns;
    const cellHeight = (pageHeight - margin * 2 - gap * (rows - 1)) / rows;
    const qrSize = Math.min(cellWidth - 50, cellHeight - 95);
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const pages = Math.ceil(codes.length / pageSize);

    for (let pageIndex = 0; pageIndex < pages; pageIndex += 1) {
      const pageCodes = codes.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
      const elements: string[] = [
        `<rect x="0" y="0" width="${pageWidth}" height="${pageHeight}" fill="#ffffff" />`
      ];

      for (let i = 0; i < pageCodes.length; i += 1) {
        const column = i % columns;
        const row = Math.floor(i / columns);
        const cellX = margin + column * (cellWidth + gap);
        const cellY = margin + row * (cellHeight + gap);
        const qrX = cellX + (cellWidth - qrSize) / 2;
        const qrY = cellY + 24;
        const code = pageCodes[i];
        const targetUrl = `${baseUrl}/qr/${code}`;
        const qrSvg = await QRCode.toString(targetUrl, {
          type: "svg",
          width: 1000,
          margin: 1,
        });
        const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg)}`;

        elements.push(
          `<rect x="${cellX}" y="${cellY}" width="${cellWidth}" height="${cellHeight}" rx="22" ry="22" fill="#ffffff" stroke="#111827" stroke-width="3" />`,
          `<image href="${svgDataUrl}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" />`,
          `<text x="${cellX + cellWidth / 2}" y="${qrY + qrSize + 42}" font-family="Arial, sans-serif" font-size="28" font-weight="700" text-anchor="middle" fill="#111827">${code}</text>`,
          `<text x="${cellX + cellWidth / 2}" y="${qrY + qrSize + 76}" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#4b5563">${targetUrl}</text>`
        );
      }

      const svgMarkup = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">
          ${elements.join("")}
        </svg>
      `.trim();

      downloadBlob(
        new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" }),
        `smart-qr-bulk-page-${pageIndex + 1}.svg`
      );

      const jpgBlob = await svgToJpgBlob(svgMarkup, pageWidth, pageHeight);
      downloadBlob(jpgBlob, `smart-qr-bulk-page-${pageIndex + 1}.jpg`);
      await wait(150);
    }
  };

  const createBulkQrs = async () => {
    const count = Number(bulkCount);

    if (!Number.isInteger(count) || count < 1 || count > 100) {
      alert("Please enter a number between 1 and 100");
      return;
    }

    const token = localStorage.getItem("admin-token");
    setIsGeneratingBulk(true);

    try {
      const res = await api.post(
        "/admin/qrs/bulk",
        { count },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const createdQrs = res.data.qrs || [];
      const createdCodes = createdQrs.map((qr: any) => qr.code);

      setQrs((prev) => [...createdQrs, ...prev]);
      await downloadBulkQrsAssets(createdCodes);
      setShowBulkModal(false);
      setBulkCount("10");

      alert(`${createdCodes.length} QR codes created and downloaded as SVG + JPG successfully!`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create QR codes");
    } finally {
      setIsGeneratingBulk(false);
    }
  };


  // ==========================
  // Delete QR
  // ==========================
  const deleteQR = async (code: string) => {
    if (!confirm("Delete this QR?")) return;

    const token = localStorage.getItem("admin-token");

    await api.delete(`/admin/qrs/${code}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setQrs(prev => prev.filter(q => q.code !== code));
  };

  // ==========================
  // Unlink QR
  // ==========================
  const unlinkQR = async (code: string) => {
    if (!confirm("Unlink this QR?")) return;

    const token = localStorage.getItem("admin-token");

    await api.patch(`/admin/qrs/${code}/unlink`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setQrs(prev =>
      prev.map(q =>
        q.code === code ? { ...q, userId: null } : q
      )
    );
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">All QR Codes</h1>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Bulk Generate
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                + Create QR
              </button>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search code or user..."
            className="px-4 py-2 border rounded w-full mb-4"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* QR Table */}
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
                  .map(qr => (
                    <tr key={qr.code} className="border-b">
                      <td className="py-2">{qr.code}</td>

                      <td className="py-2">
                        {qr.userId ? (
                          <>
                            <span className="font-medium">{qr.userId.name}</span><br />
                            <span className="text-gray-500 text-sm">{qr.userId.phone || qr.userId.email || "-"}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">Not Linked</span>
                        )}
                      </td>

                      <td className="py-2 text-right space-x-2">
                        {/* Open QR */}
                        <a
                          href={`/admin/qr/${qr.code}`}
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

            {qrs.length === 0 && (
              <p className="text-center text-gray-500 py-4">No QR codes found.</p>
            )}
          </div>

        </div>
      </div>

      {/* ===============================
          CREATE QR MODAL
      =============================== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Create New QR</h2>

            <input
              className="border px-3 py-2 rounded w-full mb-3"
              placeholder="QR Code (optional)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />

            <p className="text-gray-500 text-sm mb-3">
              * لو سيبتها فاضية: النظام هيعمل QR كود تلقائي
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={createQR}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Bulk Generate QR Codes</h2>

            <input
              type="number"
              min={1}
              max={100}
              className="border px-3 py-2 rounded w-full mb-3"
              placeholder="How many QR codes?"
              value={bulkCount}
              onChange={(e) => setBulkCount(e.target.value)}
            />

            <p className="text-gray-500 text-sm mb-4">
              Generate from 1 to 100 QR codes in one batch, then auto-download printable SVG and JPG pages.
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => !isGeneratingBulk && setShowBulkModal(false)}
                disabled={isGeneratingBulk}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
                onClick={createBulkQrs}
                disabled={isGeneratingBulk}
              >
                {isGeneratingBulk ? "Generating..." : "Generate & Download"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
