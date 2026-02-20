"use client";

import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRGenerator() {
  const [url, setUrl] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  function handleGenerate() {
    if (!url) return alert("Enter a valid URL");

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setGeneratedUrl("https://" + url);
    } else {
      setGeneratedUrl(url);
    }
  }

  function handleDownload() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = "qr-code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50">
      <h1 className="text-2xl font-bold">QR Code Generator</h1>

      <input
        className="border px-4 py-2 rounded w-96"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        className="px-6 py-2 bg-indigo-600 text-white rounded"
      >
        Generate QR
      </button>

      {generatedUrl && (
        <>
          <div
            ref={qrRef}
            className="p-6 bg-white shadow rounded flex flex-col items-center"
          >
            <QRCodeCanvas
              value={generatedUrl}
              size={260}
              level="H"
              includeMargin
            />
            <p className="text-center mt-4 text-sm break-all">
              {generatedUrl}
            </p>
          </div>

          <button
            onClick={handleDownload}
            className="px-6 py-2 bg-green-600 text-white rounded"
          >
            Download PNG
          </button>
        </>
      )}
    </div>
  );
}