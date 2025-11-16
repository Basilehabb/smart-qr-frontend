// app/qr/[code]/page.tsx  (Next.js app-router - server component)
import React from "react";

type Props = { params: { code: string } };

async function fetchQr(code: string) {
  const res = await fetch(`http://localhost:4000/api/qr/${code}`, { cache: "no-store" });
  if (!res.ok) throw new Error("QR not found");
  return res.json();
}

export default async function Page({ params }: Props) {
  const code = params.code;
  try {
    const data = await fetchQr(code);
    // data: { code: string, user: { _id, name, email } | null }
    if (!data.user) {
      // QR مش مربوط → عرض صفحة تسجيل/ربط
      return (
        <main className="min-h-screen flex items-center justify-center">
          <div className="p-8 bg-white rounded shadow max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">هذا الـ QR غير مربوط</h2>
            <p className="mb-4">نقدر نربط لك بياناتك بالـ QR. اختر تسجيل جديد أو تسجيل دخول.</p>
            <div className="space-x-2">
              <a href={`/register?code=${code}`} className="btn">Register & Link</a>
              <a href={`/login?linkCode=${code}`} className="btn-outline">Login to Link</a>
            </div>
          </div>
        </main>
      );
    }

    // لو مربوط → عرض بيانات المستخدم (بدون QR)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="p-8 bg-white rounded shadow max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Hello, {data.user.name}</h1>
          <p className="text-sm text-gray-600">Email: {data.user.email}</p>
        </div>
      </main>
    );
  } catch (err) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-white rounded shadow">
          <h2>هذا الـ QR غير موجود</h2>
          <p>تأكد من الكود أو تواصل مع الدعم.</p>
        </div>
      </main>
    );
  }
}
