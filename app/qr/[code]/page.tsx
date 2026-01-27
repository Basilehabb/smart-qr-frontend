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
  whatsapp: <FaWhatsapp className="text-green-600" />,
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

/* ===== Link Row ===== */
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
        flex items-center gap-4
        w-full px-4 py-4
        rounded-xl
        bg-white
        shadow-sm
        hover:shadow-md
        transition
      "
    >
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
        {PLATFORM_ICONS[platform] || PLATFORM_ICONS.other}
      </div>

      <span className="font-medium text-gray-800">{title}</span>
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
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

    /* ===== collect all links ===== */
    const allLinks = Object.entries(profile).flatMap(([_, group]) =>
      Object.entries(group || {}).filter(
        ([_, v]) => v && String(v).trim() !== ""
      )
    );

    return (
      <main className="min-h-screen bg-gray-100 flex justify-center px-4 py-6">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-[420px] overflow-hidden">

          {/* ===== Header with Cover ===== */}
          <div className="relative h-64 w-full overflow-hidden">
            <img
              src={user.avatar || "/cover-placeholder.jpg"}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/25" />

            {/* Wave */}
            <svg
              className="absolute bottom-0 w-full"
              viewBox="0 0 1440 120"
              preserveAspectRatio="none"
            >
              <path
                fill="#ffffff"
                d="M0,60 C240,120 480,0 720,30 960,60 1200,120 1440,60 L1440,120 L0,120 Z"
              />
            </svg>

            {/* Header content */}
            <div className="relative z-10 flex flex-col items-center justify-end h-full pb-10 text-white">
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover mb-3"
              />

              <h1 className="text-2xl font-semibold">{user.name}</h1>

              {user.job && (
                <p className="text-sm text-white/90 mt-1">
                  {user.job}
                </p>
              )}
            </div>
          </div>

          {/* ===== Links ===== */}
          <div className="px-6 py-6 space-y-3">
            {allLinks.map(([key, value]) => (
              <LinkItem
                key={key}
                platform={key}
                title={PLATFORM_TITLES[key] || key}
                value={String(value)}
              />
            ))}
          </div>

          {/* ===== Edit ===== */}
          <div className="text-center mb-6">
            <EditButton />
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
