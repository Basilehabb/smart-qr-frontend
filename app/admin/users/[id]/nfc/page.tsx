"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminSidebar from "../../../AdminSidebar";

export default function UserNFCWriterPage() {
  const params = useParams();
  const userId = params.id as string;

  const [url, setUrl] = useState("");

  // Create the user URL automatically
  useEffect(() => {
    if (userId) {
      const link = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/u/${userId}`;
      setUrl(link);
    }
  }, [userId]);

  async function writeNFC() {
    if (!("NDEFWriter" in window)) {
      alert("Web NFC غير مدعوم — يجب استخدام Chrome على Android.");
      return;
    }

    try {
      const writer = new (window as any).NDEFWriter();

      await writer.write({
        records: [
          { recordType: "url", data: url }
        ]
      });

      alert("✔ تم كتابة الـ NFC بنجاح! المس الـ Tag مرة أخرى للتجربة.");

    } catch (err: any) {
      console.error(err);
      alert("❌ فشل الكتابة: " + err.message);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 p-6">
        <div className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-6">
          
          <h1 className="text-2xl font-bold mb-4">Write NFC for User</h1>

          <p className="text-gray-600 mb-1">This URL will be written to the NFC tag:</p>

          <input
            className="border px-3 py-2 rounded w-full bg-gray-100"
            value={url}
            readOnly
          />

          <button
            onClick={writeNFC}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded w-full"
          >
            Write NFC Tag
          </button>
        </div>
      </div>
    </div>
  );
}
