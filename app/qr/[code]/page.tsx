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
  FaEnvelope,
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
  email: "Email",
};

/* ===== Platform icons ===== */
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  whatsapp: <FaWhatsapp className="text-white" />,
  instagram: <FaInstagram className="text-white" />,
  facebook: <FaFacebook className="text-white" />,
  tiktok: <FaTiktok className="text-white" />,
  website: <FaGlobe className="text-white" />,
  phone: <FaPhoneAlt className="text-white" />,
  youtube: <FaYoutube className="text-white" />,
  paypal: <FaPaypal className="text-white" />,
  spotify: <FaSpotify className="text-white" />,
  gaming: <FaGamepad className="text-white" />,
  email: <FaEnvelope className="text-white" />,
  other: <FaLink className="text-white" />,
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
        flex items-center gap-3
        w-full px-6 py-3
        rounded-full
        bg-gradient-to-r from-purple-600 to-purple-700
        hover:from-purple-700 hover:to-purple-800
        text-white font-medium
        shadow-md hover:shadow-lg
        transition-all duration-200
      "
    >
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg flex-shrink-0">
        {PLATFORM_ICONS[platform] || PLATFORM_ICONS.other}
      </div>
      <span className="text-left flex-1">{title}</span>
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
      <main className="min-h-screen bg-gray-50 flex justify-center px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">

          {/* ===== Header with Cover and Wave ===== */}
          <div className="relative">
            {/* Cover Image */}
            <div className="h-52 w-full overflow-hidden">
              <img
                src={user.avatar || "/cover-placeholder.jpg"}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Purple Wave - exact HiHello style */}
            <div className="absolute bottom-0 w-full" style={{ transform: 'translateY(1px)' }}>
              <svg
                className="w-full"
                viewBox="0 0 1440 60"
                preserveAspectRatio="none"
                style={{ height: '50px', display: 'block' }}
              >
                <path
                  fill="#8b5cf6"
                  d="M0,30 C360,50 480,10 720,30 C960,50 1080,10 1440,30 L1440,60 L0,60 Z"
                />
              </svg>
            </div>

            {/* Avatar Circle - positioned on the wave */}
            <div className="absolute left-1/2 transform -translate-x-1/2" style={{ bottom: '-40px' }}>
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover bg-white"
              />
            </div>
          </div>

          {/* ===== Content ===== */}
          <div className="pt-14 px-6 pb-6">
            {/* Name and Job */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {user.name}
              </h1>
              {user.job && (
                <p className="text-gray-600 text-sm font-normal">
                  {user.job}
                </p>
              )}
            </div>

            {/* Links */}
            <div className="space-y-3 mb-6">
              {allLinks.map(([key, value]) => (
                <LinkItem
                  key={key}
                  platform={key}
                  title={PLATFORM_TITLES[key] || key}
                  value={String(value)}
                />
              ))}
            </div>

            {/* Edit Button */}
            <div className="text-center mt-4">
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