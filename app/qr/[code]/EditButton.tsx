"use client";

export default function EditButton() {
  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={() => {
        const token = localStorage.getItem("user-token");

        // 🔍 1) استخراج QR code من مسار الصفحة الحالية
        const path = window.location.pathname; // مثال: /qr/K09GADBGRK
        const qrCode = path.startsWith("/qr/") ? path.replace("/qr/", "") : null;

        // 2) بناء رابط edit مع كود الـ QR
        const target = qrCode
          ? `/user/edit?code=${qrCode}`
          : "/user/edit";

        if (token) {
          // 🔥 لو المستخدم مسجل دخول → روح لصفحة edit
          window.location.href = target;
        } else {
          // 🔥 لو مش مسجل → احفظ return-url ثم login
          localStorage.setItem("return-url", target);
          window.location.href = "/login";
        }
      }}
    >
      Edit Profile
    </button>
  );
}
