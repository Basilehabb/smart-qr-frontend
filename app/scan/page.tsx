"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ScanPage() {
  const [result, setResult] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // لازم 3 arguments: id, config, verbose
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false // 👈 verbose mode OFF
    );

    scanner.render(
      async (decodedText) => {
        setResult(decodedText);

        try {
          const res = await api.get(`/qr/${decodedText}`);
          setUserData(res.data.user || null);
        } catch {
          setUserData(null);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Scan QR</h1>

      <div id="reader" className="w-full max-w-sm mx-auto" />

      {result && (
        <p className="mt-4 text-center">
          <strong>QR:</strong> {result}
        </p>
      )}

      {userData && (
        <div className="mt-4 p-4 bg-white shadow rounded">
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
        </div>
      )}
    </div>
  );
}
