import React from "react";
import EditButton from "./EditButton";
import LoginToLinkButton from "./LoginToLinkButton";

type Props = { params: { code: string } };

async function fetchQr(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/${code}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("QR not found");
  return res.json();
}

// نفس الترتيب
const SECTIONS = [
  { key: "contact", title: "Contact" },
  { key: "social", title: "Social" },
  { key: "payment", title: "Payment" },
  { key: "video", title: "Video" },
  { key: "music", title: "Music" },
  { key: "design", title: "Design" },
  { key: "gaming", title: "Gaming" },
  { key: "other", title: "Other" },
];

// 🔥 platform titles هنا
const PLATFORM_TITLES: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  website: "Website",
  phone: "Phone",
};

function LinkItem({ title, value }: { title: string; value: string }) {
  return (
    <a
      href={value}
      target="_blank"
      className="flex items-center justify-between w-full p-3 bg-white border rounded-lg hover:bg-gray-50"
    >
      <div>
        <div className="font-semibold text-gray-700">{title}</div>
        <div className="text-xs text-gray-500 break-all">{value}</div>
      </div>
      <span className="text-indigo-500 text-sm">Open</span>
    </a>
  );
}

export default async function Page({ params }: Props) {
  const code = params.code;

  try {
    const data = await fetchQr(code);

    // QR NOT LINKED
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

              <LoginToLinkButton code={code} />
            </div>
          </div>
        </main>
      );
    }

    const user = data.user;
    const profile = user.profile || {};

    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full">

          {/* ===== Avatar + Name ===== */}
          <div className="text-center mb-6">
            {user.avatar ? (
              <img
                src={user.avatar}
                className="w-24 h-24 rounded-full mx-auto object-cover mb-3 shadow"
                alt="Avatar"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto flex items-center justify-center text-3xl font-bold text-white mb-3">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}

            <h1 className="text-2xl font-bold">{user.name}</h1>

            {user.job && (
              <p className="text-gray-500 text-sm">{user.job}</p>
            )}

            {(user.countryCode || user.phone) && (
              <p className="text-gray-600 mt-1">
                {user.countryCode} {user.phone}
              </p>
            )}
          </div>

          {/* ===== SECTIONS ===== */}
          <div className="space-y-6">
            {SECTIONS.map((sec) => {
              const entries = Object.entries(profile[sec.key] || {}).filter(
                ([_, v]) => v !== null && String(v).trim() !== ""
              );

              if (entries.length === 0) return null;

              return (
                <div key={sec.key}>
                  <h3 className="text-sm font-bold text-gray-600 mb-2">
                    {sec.title}
                  </h3>

                  <div className="space-y-2">
                    {entries.map(([key, value]) => (
                      <LinkItem
                        key={key}
                        title={PLATFORM_TITLES[key] || key}
                        value={String(value)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edit Button */}
          <div className="text-center mt-6">
            <EditButton />
          </div>
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
