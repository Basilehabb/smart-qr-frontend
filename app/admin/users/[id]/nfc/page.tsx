"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function NFCWriterPage({ params }: any) {
  const userId = params.id;

  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(true);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // ============ Get User QR ==============
  useEffect(() => {
    async function loadQR() {
      try {
        const token = localStorage.getItem("admin-token");
        const res = await api.get(`/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Find the first QR assigned to this user
        const code = res.data.user?.qrCodes?.[0]?.code 
                 || res.data.user?.qrCode 
                 || "";

        setQrCode(code);
      } catch (err) {
        console.error("Failed to load QR", err);
      } finally {
        setLoading(false);
      }
    }

    loadQR();
  }, [userId]);

  if (loading) return <p className="p-10">Loading...</p>;

  if (!qrCode)
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-semibold">
          This user has no QR code linked.
        </p>
      </div>
    );

  const qrUrl = `${appUrl}/qr/${qrCode}`;

  // ============ Write NFC Tag ==============
  async function writeNFC() {
    try {
      if ("NDEFWriter" in window) {
        const writer = new (window as any).NDEFWriter();
        await writer.write({
          records: [{ recordType: "url", data: qrUrl }],
        });
        alert("NFC tag written successfully!");
      } else {
        alert("Web NFC is not supported on this device.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to write NFC.");
    }
  }

  return (
    <div className="p-10 flex justify-center">
      <div className="bg-white p-6 rounded shadow max-w-lg w-full">
        <h1 className="text-xl font-bold mb-4">Write NFC for User</h1>

        <p className="mb-2 text-gray-600">
          This URL will be written to the NFC tag:
        </p>

        <input
          className="w-full border rounded px-3 py-2 bg-gray-100 text-sm"
          value={qrUrl}
          readOnly
        />

        <button
          onClick={writeNFC}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded"
        >
          Write NFC Tag
        </button>
      </div>
    </div>
  );
}
