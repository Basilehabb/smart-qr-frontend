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

/* ===== Titles ===== */
const PLATFORM_TITLES: Record<string, string> = {
  instagram: "Instagram",
  phone: "Phone",
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  tiktok: "TikTok",
  website: "Website",
  youtube: "YouTube",
  paypal: "PayPal",
  spotify: "Spotify",
  email: "Email",
};

/* ===== Icons ===== */
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <FaInstagram />,
  phone: <FaPhoneAlt />,
  whatsapp: <FaWhatsapp />,
  facebook: <FaFacebook />,
  tiktok: <FaTiktok />,
  website: <FaGlobe />,
  youtube: <FaYoutube />,
  paypal: <FaPaypal />,
  spotify: <FaSpotify />,
  gaming: <FaGamepad />,
  email: <FaEnvelope />,
  other: <FaLink />,
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
        flex items-center gap-4
        w-full px-6 py-4
        rounded-full
        bg-gradient-to-r from-[#C9A441] to-[#B8962E]
        text-white font-medium
        shadow-md
        hover:scale-[1.02] transition
      "
    >
      <div className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center text-lg">
        {PLATFORM_ICONS[platform] || PLATFORM_ICONS.other}
      </div>
      <span className="flex-1 text-left">{title}</span>
    </a>
  );
}

export default async function Page({ params }: Props) {
  const code = params.code;
  const data = await fetchQr(code);

  /* ================= QR NOT LINKED ================= */
  if (!data.user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">
            هذا الـ QR غير مربوط
          </h2>

          <p className="text-gray-600 mb-6">
            يمكنك إنشاء حساب جديد أو تسجيل الدخول لربط هذا الـ QR.
          </p>

          <div className="flex flex-col gap-3">
            <a
              href={`/register?code=${code}`}
              className="w-full px-4 py-3 rounded-lg bg-[#C9A441] text-white font-medium"
            >
              Create Account & Link QR
            </a>

            <LoginToLinkButton code={code} />
          </div>
        </div>
      </main>
    );
  }

  /* ================= QR LINKED ================= */
  const user = data.user;
  const profile = user.profile || {};

  const allLinks = Object.entries(profile).flatMap(([_, group]) =>
    Object.entries(group || {}).filter(
      ([_, v]) => v && String(v).trim() !== ""
    )
  );

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden">

        {/* ================= HEADER ================= */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[#111111]" />

          {user.avatar && (
            <img
              src={user.avatar}
              alt="cover"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
          )}

          <div className="h-[280px]" />

          {/* Wave */}
          <div className="absolute bottom-[-1px] left-0 w-full z-20">
            <svg
              viewBox="0 0 246 57"
              preserveAspectRatio="none"
              className="w-full h-[90px]"
            >
              <path
                d="M 214.7,6.1 C 195.6,5.9 172.3,11.9 137.8,32.5
                   110.1,49 86.9,56.8 65,57 H 246 V 11.4 Z"
                fill="white"
              />
              <path
                d="M 0,16.7 V 36 C 45,63 82,65 137,32
                   193,-0.4 219,3.8 246,11.4 V 6.5 Z"
                fill="#111111"
              />
            </svg>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="px-6 pt-6 pb-8">

          {/* LOGO */}
          <div className="flex justify-center -mt-16 mb-4">
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
              <img
                src="/loly-logo.png"
                alt="Loly Accessories"
                className="w-14 h-14 object-contain"
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {user.name}
            </h1>
            {user.job && (
              <p className="text-gray-500 text-sm">{user.job}</p>
            )}
          </div>

          <div className="space-y-4 mb-6">
            {allLinks.map(([key, value]) => (
              <LinkItem
                key={key}
                platform={key}
                title={PLATFORM_TITLES[key] || key}
                value={String(value)}
              />
            ))}
          </div>

          <div className="text-center mb-2">
            <EditButton />
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Powered by Loly Accessories
          </p>
        </div>
      </div>
    </main>
  );
}
