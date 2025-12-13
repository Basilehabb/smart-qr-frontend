"use client";

import { useState, useEffect } from "react";

export default function NFCWriterPage({ params }: any) {

  const qrCode = params.code;

  const targetURL = `https://smart-qr-frontend.vercel.app/qr/${qrCode}`;

  async function writeNFC() {
    try {
      if ("NDEFWriter" in window) {
        const writer = new (window as any).NDEFWriter();
        await writer.write({
          records: [
            { recordType: "url", data: targetURL }
          ]
        });
        alert("NFC tag written successfully!");
      } else {
        alert("NFC writing is not supported on this device.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to write to NFC tag");
    }
  }

  return (
    <div className="p-10 flex justify-center">
      <div className="bg-white p-6 rounded shadow w-[450px]">
        <h2 className="text-2xl font-semibold mb-4">Write NFC Tag</h2>

        <p className="text-gray-600 mb-3">This URL will be written:</p>

        <input
          value={targetURL}
          className="border w-full px-3 py-2 rounded mb-4"
          readOnly
        />

        <button
          onClick={writeNFC}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Write NFC Tag
        </button>
      </div>
    </div>
  );
}
