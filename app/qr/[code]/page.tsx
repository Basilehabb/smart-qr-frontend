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
        flex items-center justify-center gap-2
        w-full px-6 py-3
        rounded-full
        bg-gradient-to-r from-purple-600 to-purple-700
        hover:from-purple-700 hover:to-purple-800
        text-white font-medium
        shadow-md hover:shadow-lg
        transition-all duration-200
      "
    >
      <div className="text-xl">
        {PLATFORM_ICONS[platform] || PLATFORM_ICONS.other}
      </div>
      <span>{title}</span>
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
            <div className="h-48 w-full overflow-hidden bg-gradient-to-br from-orange-200 via-yellow-200 to-orange-300">
              <img
                src={user.avatar || "/cover-placeholder.jpg"}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Purple Wave */}
            <div className="absolute bottom-0 w-full">
              <svg
                className="w-full"
                viewBox="0 0 1440 100"
                preserveAspectRatio="none"
                style={{ height: '80px' }}
              >
                <path
                  fill="#ffffff"
                  d="M0,50 Q360,100 720,50 T1440,50 L1440,100 L0,100 Z"
                />
              </svg>
            </div>

            {/* Avatar - positioned to overlap wave */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-12">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
                />
              </div>
            </div>
          </div>

          {/* ===== Content ===== */}
          <div className="pt-16 px-6 pb-6">
            {/* Name and Job */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {user.name}
              </h1>
              {user.job && (
                <p className="text-gray-600 text-sm">
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

            {/* Save Contact Button */}
            <button className="
              w-full py-3 px-6
              bg-gradient-to-r from-purple-600 to-purple-700
              hover:from-purple-700 hover:to-purple-800
              text-white font-semibold rounded-full
              shadow-md hover:shadow-lg
              transition-all duration-200
              flex items-center justify-center gap-2
            ">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              SAVE CONTACT
            </button>

            {/* Edit Button */}
            <div className="text-center mt-4">
              <EditButton />
            </div>
          </div>

          {/* ===== Footer ===== */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 py-3 text-center">
            <p className="text-white text-xs">
              A free digital business card from HiHello
            </p>
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