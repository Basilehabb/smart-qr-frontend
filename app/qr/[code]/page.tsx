// app/qr/[code]/page.tsx
import React from "react";

type Props = { params: { code: string } };

async function fetchQr(code: string) {
  const res = await fetch(`http://localhost:4000/api/qr/${code}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("QR not found");
  return res.json();
}

export default async function Page({ params }: Props) {
  const code = params.code;

  try {
    const data = await fetchQr(code);

    // ----------------------------------
    // CASE 1 — QR NOT LINKED
    // ----------------------------------
    if (!data.user) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="p-8 bg-white rounded shadow max-w-md w-full text-center">
            <h2 className="text-xl font-semibold mb-2">هذا الـ QR غير مربوط</h2>
            <p className="text-gray-600 mb-4">
              يمكنك تسجيل حساب جديد أو تسجيل دخول لربط هذا QR.
            </p>

            <div className="flex justify-center gap-4 mt-4">
              <a
                href={`/register?code=${code}`}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Register & Link
              </a>

              <a
                href={`/login?code=${code}&return=/user/edit`}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded"
              >
                Login to Link
              </a>
            </div>
          </div>
        </main>
      );
    }

    // ----------------------------------
    // CASE 2 — QR LINKED → Show USER DATA
    // ----------------------------------
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded shadow max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Hello, {data.user.name}</h1>
          <p className="text-sm text-gray-600 mb-4">Email: {data.user.email}</p>

          {/* Edit Profile Button */}
          <a
            href={`/login?code=${code}&return=/user/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Edit Profile
          </a>
        </div>
      </main>
    );
  } catch (err) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-white rounded shadow text-center">
          <h2 className="text-lg font-semibold">هذا الـ QR غير موجود</h2>
          <p className="text-gray-600">تأكد من الكود أو تواصل مع الدعم.</p>
        </div>
      </main>
    );
  }
}
