"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

// تحميل الكومبوننت بدون SSR
const QrReader = dynamic(() => import("react-qr-scanner"), { ssr: false });

export default function ScanPage() {
  const [result, setResult] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (data: string | null) => {
    if (data && data !== result) {
      setResult(data);

      try {
        const res = await api.get(`/qr/${data}`);
        setUserData(res.data.user);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError("No user found for this QR code");
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setError("Camera access error");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Scan QR Code</h1>

      <div className="w-72 h-72 border-4 border-blue-600 rounded-xl overflow-hidden mb-4">
        <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {result && (
        <p className="mt-3 text-sm text-gray-600">
          ✅ QR Detected: <strong>{result}</strong>
        </p>
      )}

      {userData && (
        <div className="mt-6 bg-white p-4 rounded-xl shadow-md w-80">
          <h2 className="text-lg font-semibold mb-2">User Info</h2>
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
        </div>
      )}

      {error && <p className="text-red-500 mt-3">{error}</p>}
    </div>
  );
}
