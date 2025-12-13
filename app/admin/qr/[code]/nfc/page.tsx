"use client";

import { useState } from "react";

export default function NFCWriterPage({ params }: any) {
  const qrCode = params.code;
  const targetURL = `https://smart-qr-frontend.vercel.app/qr/${qrCode}`;

  const [status, setStatus] = useState<"idle" | "writing" | "success" | "error">("idle");

  const writeNFC = async () => {
    // ✅ لازم user gesture مباشر
    if (
      typeof window === "undefined" ||
      !("NDEFWriter" in window) ||
      !window.isSecureContext
    ) {
      alert("❌ NFC غير مدعوم. استخدم Android + Chrome + HTTPS");
      return;
    }

    try {
      setStatus("writing");

      const writer = new (window as any).NDEFWriter();

      // ❗ أول await
      await writer.write({
        records: [{ recordType: "url", data: targetURL }],
      });

      setStatus("success");
      alert("✅ تم كتابة NFC بنجاح");

      // 📊 Analytics (بعد النجاح)
      fetch("https://smart-qr-backend.onrender.com/api/admin/nfc-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
        body: JSON.stringify({
          qrCode,
          url: targetURL,
          userAgent: navigator.userAgent,
        }),
      });

    } catch (err) {
      console.error(err);
      setStatus("error");
      alert("❌ فشل كتابة NFC، حاول مرة أخرى");
    }
  };

  return (
    <div className="p-10 flex justify-center">
      <div className="bg-white p-6 rounded shadow w-[450px] space-y-4">

        <h2 className="text-2xl font-semibold">Write NFC Tag</h2>

        {/* Tooltip تعليمات */}
        <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded">
          📌 التعليمات:
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>استخدم Android فقط</li>
            <li>افتح Google Chrome (مش Samsung Browser)</li>
            <li>فعّل NFC من إعدادات الجهاز</li>
            <li>قرب الـ NFC Tag بعد الضغط على الزر</li>
          </ul>
        </div>

        <div>
          <p className="text-gray-600 mb-1">URL المكتوب على الـ NFC:</p>
          <input
            value={targetURL}
            readOnly
            className="border w-full px-3 py-2 rounded bg-gray-50"
          />
        </div>

        <button
          onClick={writeNFC}
          disabled={status === "writing"}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
        >
          {status === "writing" ? "قرب الـ NFC..." : "Write NFC Tag"}
        </button>

        {status === "success" && (
          <p className="text-green-600 text-center text-sm">
            ✔️ NFC اتكتب بنجاح
          </p>
        )}

        {status === "error" && (
          <p className="text-red-600 text-center text-sm">
            ❌ حصل خطأ أثناء الكتابة
          </p>
        )}
      </div>
    </div>
  );
}
