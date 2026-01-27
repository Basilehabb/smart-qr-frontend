import React from "react";
import EditButton from "./EditButton";
import LoginToLinkButton from "./LoginToLinkButton";

import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaGlobe,
  FaPhoneAlt,
  FaYoutube,
  FaPaypal,
  FaSpotify,
  FaGamepad,
  FaLink,
} from "react-icons/fa";

type Props = { params: { code: string } };

async function fetchQr(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr/${code}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("QR not found");
  return res.json();
}

/* ===== Sections order ===== */
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

/* ===== Platform titles ===== */
const PLATFORM_TITLES: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  website: "Website",
  phone: "Phone",
  youtube: "YouTube",
  paypal: "PayPal",
  spotify: "Spotify",
};

/* ===== Platform icons ===== */
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  whatsapp: <FaWhatsapp className="text-green-500" />,
  instagram: <FaInstagram className="text-pink-500" />,
  facebook: <FaFacebook className="text-blue-600" />,
  tiktok: <FaTiktok className="text-black" />,
  website: <FaGlobe className="text-gray-600" />,
  phone: <FaPhoneAlt className="text-gray-600" />,
  youtube: <FaYoutube className="text-red-600" />,
  paypal: <FaPaypal className="text-blue-500" />,
  spotify: <FaSpotify className="text-green-600" />,
  gaming: <FaGamepad className="text-purple-600" />,
  other: <FaLink className="text-gray-500" />,
};

/* ===== Link Item ===== */
function LinkItem({
  title,
  value,
  platform,
}: {
  title: string;
  value: string;
  platform: string;
}) {
  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex items-center justify-between
        w-full px-5 py-4
        rounded-2xl
        bg-gray-50 border
        hover:bg-gray-100
        transition
      "
    >
      <div className="flex items-center gap-4">
        <div className="text-xl">
          {PLATFORM_ICONS[platform] || PLATFORM_ICONS.other}
        </div>
        <span className="font-medium text-gray-800">{title}</span>
      </div>

      <span className="text-gray-400 text-lg">›</span>
    </a>
  );
}

export default async function Page({ params }: Props) {
  const code = params.code;

  try {
    const data = await fetchQr(code);

    /* ===== QR not linked ===== */
    if (!data.user) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="bg-white p-8 rounded-2xl shadow max-w-md w-full text-center">
            <h2 className="text-xl font-semibold mb-2">
              هذا الـ QR غير مربوط
            </h2>
            <p className="text-gray-600 mb-6">
              يمكنك تسجيل حساب جديد أو تسجيل دخول لربط هذا QR.
            </p>

            <div className="flex justify-center gap-4">
              <a
                href={`/register?code=${code}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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

    /* ===== Profile Page ===== */
    return (
      <main className="min-h-screen bg-gray-100 flex justify-center px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-[420px]">

          {/* Avatar + Name */}
          <div className="text-center pt-10 pb-6">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="
                  w-28 h-28 rounded-full mx-auto object-cover
                  shadow-md -mt-20 mb-4
                  border-4 border-white
                "
              />
            ) : (
              <div
                className="
                  w-28 h-28 rounded-full bg-gray-300 mx-auto
                  flex items-center justify-center
                  text-4xl font-bold text-white
                  shadow-md -mt-20 mb-4
                  border-4 border-white
                "
              >
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}

            <h1 className="text-2xl font-semibold">{user.name}</h1>

            {user.job && (
              <p className="text-gray-500 text-sm mt-1">{user.job}</p>
            )}
          </div>

          {/* Links */}
          <div className="px-6 pb-8 space-y-8">
            {SECTIONS.map((sec) => {
              const entries = Object.entries(profile[sec.key] || {}).filter(
                ([_, v]) => v !== null && String(v).trim() !== ""
              );

              if (!entries.length) return null;

              return (
                <div key={sec.key}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                    {sec.title}
                  </h3>

                  <div className="space-y-3">
                    {entries.map(([key, value]) => (
                      <LinkItem
                        key={key}
                        platform={key}
                        title={PLATFORM_TITLES[key] || key}
                        value={String(value)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Edit Button */}
            <div className="text-center pt-6">
              <EditButton />
            </div>
          </div>
        </div>
      </main>
    );
  } catch {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded-2xl shadow text-center">
          <h2 className="text-lg font-semibold">هذا الـ QR غير موجود</h2>
          <p className="text-gray-600">
            تأكد من الكود أو تواصل مع الدعم.
          </p>
        </div>
      </main>
    );
  }
}
