"use client";
import { useState, useEffect } from "react";

export default function NFCWriterPage({ params }: any) {
  const qrCode = params.code;
  const targetURL = `https://smart-qr-frontend.vercel.app/qr/${qrCode}`;
  const [status, setStatus] = useState<"idle" | "writing" | "success" | "error">("idle");
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  // ✅ التحقق من الدعم
  useEffect(() => {
    if (typeof window !== "undefined") {
      const supported = "NDEFReader" in window && window.isSecureContext;
      setIsSupported(supported);
      
      console.log("🔍 Debug Info:");
      console.log("NDEFReader exists:", "NDEFReader" in window);
      console.log("Secure context (HTTPS):", window.isSecureContext);
      console.log("User Agent:", navigator.userAgent);
    }
  }, []);

  const writeNFC = async () => {
    if (!isSupported) {
      alert("❌ NFC غير مدعوم. تأكد من:\n• استخدام Chrome على Android\n• الموقع HTTPS\n• تفعيل NFC من الإعدادات");
      return;
    }

    try {
      setStatus("writing");
      
      // ✅ استخدام NDEFReader (الصح)
      const ndef = new (window as any).NDEFReader();
      
      await ndef.write({
        records: [{ 
          recordType: "url", 
          data: targetURL 
        }]
      });
      
      setStatus("success");
      
      // 📊 Analytics
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
          timestamp: new Date().toISOString()
        }),
      }).catch(err => console.log("Analytics error:", err));
      
    } catch (err: any) {
      console.error("NFC Error:", err);
      setStatus("error");
      
      // ✅ رسائل خطأ واضحة
      if (err.name === "NotAllowedError") {
        alert("❌ تم رفض صلاحية NFC. اسمح بالوصول وحاول مرة أخرى");
      } else if (err.name === "NotSupportedError") {
        alert("❌ NFC غير مدعوم على هذا الجهاز");
      } else if (err.name === "NotReadableError") {
        alert("❌ فشلت الكتابة. تأكد من:\n• وجود بطاقة NFC قريبة\n• البطاقة غير محمية");
      } else if (err.name === "NetworkError") {
        alert("❌ خطأ في NFC. حاول مرة أخرى");
      } else {
        alert(`❌ خطأ: ${err.message || "فشلت الكتابة"}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="text-5xl mb-2">📱</div>
          <h2 className="text-2xl font-bold text-gray-800">كتابة بطاقة NFC</h2>
        </div>

        {/* ✅ حالة التحميل */}
        {isSupported === null && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-700 text-sm text-center">
            جاري التحقق من دعم NFC...
          </div>
        )}

        {/* ❌ NFC غير مدعوم */}
        {isSupported === false && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 text-sm">
            <p className="font-semibold mb-2">⚠️ NFC غير مدعوم</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>استخدم <strong>Chrome</strong> على <strong>Android</strong></li>
              <li>فعّل NFC من إعدادات الهاتف</li>
              <li>تأكد أن الموقع <strong>HTTPS</strong></li>
              <li>جرب تحديث Chrome لآخر نسخة</li>
            </ul>
          </div>
        )}

        {/* ✅ NFC مدعوم */}
        {isSupported === true && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-green-700 text-sm text-center">
            ✓ NFC مدعوم على جهازك
          </div>
        )}

        {/* التعليمات */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-sm text-gray-700">
          <p className="font-semibold mb-2 flex items-center gap-2">
            <span>📋</span> التعليمات:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-xs">
            <li>اضغط على زر "كتابة البطاقة"</li>
            <li>قرّب بطاقة NFC من خلف الهاتف</li>
            <li>انتظر رسالة النجاح</li>
            <li>جرّب مسح البطاقة للتأكد</li>
          </ol>
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الرابط المراد كتابته:
          </label>
          <div className="relative">
            <input
              value={targetURL}
              readOnly
              className="border border-gray-300 w-full px-3 py-2 rounded-lg bg-gray-50 text-xs font-mono pr-10"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(targetURL);
                alert("✓ تم النسخ");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
              title="نسخ"
            >
              📋
            </button>
          </div>
        </div>

        {/* زر الكتابة */}
        <button
          onClick={writeNFC}
          disabled={status === "writing" || isSupported === false}
          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
            status === "writing"
              ? "bg-yellow-500 text-white cursor-wait"
              : isSupported === false
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
          }`}
        >
          {status === "writing" ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              قرّب البطاقة الآن...
            </span>
          ) : (
            "📝 كتابة البطاقة"
          )}
        </button>

        {/* رسائل الحالة */}
        {status === "success" && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-green-700 text-sm text-center animate-pulse">
            ✅ تم كتابة NFC بنجاح!
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-700 text-sm text-center">
            ❌ فشلت الكتابة، حاول مرة أخرى
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          <p>رمز QR: <code className="bg-gray-100 px-2 py-1 rounded">{qrCode}</code></p>
        </div>
      </div>
    </div>
  );
}